const http = require('http'),
  fs = require('fs'),
  path = require('path');
const root = process.argv[2],
  port = +process.argv[3];
const types = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.otf': 'font/otf',
  '.woff2': 'font/woff2',
};
http
  .createServer((req, res) => {
    let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      const html = p + '.html';
      p = fs.existsSync(html) ? html : path.join(root, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  })
  .listen(port);
