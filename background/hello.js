var http = require('http');

http.createServer(function (req, res) {
  res.write('I am a background service!');
  res.end();
}).listen(3000);