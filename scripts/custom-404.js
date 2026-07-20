/**
 * Hexo Custom 404 Middleware
 * 当访问不存在的页面时，显示自定义的404.html
 */

hexo.extend.filter.register('server_middleware', function(app) {
  const fs = require('fs');
  const path = require('path');
  const publicDir = hexo.public_dir;
  const file404 = path.join(publicDir, '404.html');

  hexo.log.info('>>> Custom 404: Initializing');
  hexo.log.info('>>> 404.html exists:', fs.existsSync(file404));

  if (!fs.existsSync(file404)) {
    hexo.log.warn('>>> Custom 404: 404.html not found');
    return;
  }

  hexo.log.info('>>> Custom 404: Registering middleware');

  app.use(function(req, res, next) {
    // 只处理GET和HEAD请求
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // 获取请求路径
    const requestPath = req.path || req.url || '/';

    // 跳过首页、404页面本身和静态资源
    if (requestPath === '/' ||
        requestPath === '/index.html' ||
        requestPath === '/404.html' ||
        requestPath.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|map|json|xml)$/i)) {
      return next();
    }

    // 检查请求的文件是否存在
    const htmlFile = path.join(publicDir, requestPath + '.html');
    const dirIndex = path.join(publicDir, requestPath, 'index.html');

    const fileExists = fs.existsSync(htmlFile) || fs.existsSync(dirIndex);

    if (!fileExists) {
      // 文件不存在，返回自定义404页面
      try {
        hexo.log.info('>>> Custom 404: Reading 404.html');
        const content = fs.readFileSync(file404, 'utf8');
        hexo.log.info('>>> Custom 404: Sending response, res.type=' + typeof res.type);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(content);
        hexo.log.info('>>> Custom 404: Response sent');
      } catch (err) {
        hexo.log.error('>>> Custom 404: Error:', err.message);
        next();
      }
      return;
    }

    next();
  });

  hexo.log.info('>>> Custom 404: Middleware registered');
});
