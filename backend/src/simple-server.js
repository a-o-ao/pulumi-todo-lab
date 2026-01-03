const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Received ${req.method} request for ${req.url}`);

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple HTTP server running on port ${PORT}`);
  console.log(`Visit http://0.0.0.0:${PORT}/health`);
});

// Keep process alive
setInterval(() => {
  console.log('Server still alive:', new Date().toISOString());
}, 30000);
