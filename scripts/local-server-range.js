/* global hexo */
'use strict';

// Provides HTTP Range support while running `hexo server` locally.
// hexo-server's route middleware answers every request with a full stream and
// never honours the Range header, so browsers cannot seek audio/video: every
// seek restarts playback from byte 0. Static hosts (GitHub Pages, Vercel, ...)
// support ranges out of the box, so this shim is development-only and only
// touches media files (or requests that explicitly ask for a byte range).

const fs = require('fs');
const pathFn = require('path');
const mime = require('mime');

const MEDIA_EXTENSIONS = /\.(mp3|flac|m4a|aac|wav|ogg|oga|opus|mp4|m4v|webm|mov|mkv)$/i;

const parseRange = (header, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
  if (!match) return null;
  const [, startText, endText] = match;
  if (startText === '' && endText === '') return null;
  let start;
  let end;
  if (startText === '') {
    const suffixLength = Number(endText);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(startText);
    end = endText === '' ? size - 1 : Math.min(Number(endText), size - 1);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return 'unsatisfiable';
  return { start, end };
};

hexo.extend.filter.register('server_middleware', function (app) {
  const publicDir = pathFn.resolve(this.public_dir);
  const root = this.config.root || '/';

  const serveFile = function (req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const rangeHeader = req.headers.range;
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (error) {
      return next();
    }
    if (root !== '/' && pathname.startsWith(root)) pathname = `/${pathname.slice(root.length)}`;
    if (!rangeHeader && !MEDIA_EXTENSIONS.test(pathname)) return next();

    const filePath = pathFn.resolve(publicDir, `.${pathname}`);
    const relative = pathFn.relative(publicDir, filePath);
    if (!relative || relative.startsWith('..') || pathFn.isAbsolute(relative)) return next();

    fs.stat(filePath, (error, stat) => {
      if (error || !stat.isFile()) return next();
      const range = rangeHeader ? parseRange(rangeHeader, stat.size) : null;
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', mime.getType(pathFn.extname(filePath)) || 'application/octet-stream');
      if (range === 'unsatisfiable') {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${stat.size}`);
        return res.end();
      }
      if (range) {
        res.statusCode = 206;
        res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stat.size}`);
        res.setHeader('Content-Length', String(range.end - range.start + 1));
      } else {
        res.setHeader('Content-Length', String(stat.size));
      }
      if (req.method === 'HEAD') return res.end();
      const stream = fs.createReadStream(filePath, range ? { start: range.start, end: range.end } : undefined);
      stream.on('error', () => (res.headersSent ? res.destroy() : next()));
      stream.pipe(res);
    });
  };

  // Run before hexo-server's own middlewares (route/static) regardless of the
  // plugin registration order.
  app.use(serveFile);
  app.stack.unshift(app.stack.pop());
});
