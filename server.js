// server.js
const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Change 2!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
