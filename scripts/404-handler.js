/**
 * Custom 404 Handler
 * 自定义404页面处理
 */

hexo.on('new', function(args) {
  // 这个插件在服务器启动时添加404中间件
});

// 监听服务器启动事件
hexo.on('server', function() {
  // 获取服务器实例
  const server = hexo.server;

  if (server) {
    // 添加404中间件
    server.use((req, res, next) => {
      // 如果是静态文件请求且存在，直接返回
      if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|map)$/)) {
        return next();
      }

      // 读取自定义404页面的内容
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(hexo.public_dir, '404.html');

      // 检查404.html是否存在
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // 返回404状态码和自定义404页面
        res.status(404);
        res.type('html');
        res.send(content);
      } else {
        // 如果404.html不存在，返回默认404
        next();
      }
    });

    hexo.log.info('Custom 404 handler registered');
  }
});
