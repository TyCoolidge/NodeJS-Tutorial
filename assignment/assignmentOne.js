const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Assignment One</title></head>');
    res.write(
      '<body><form action="/create-user" method="POST"><input type="username" name="username" placeholder="Enter user name"><button type="submit">Send</button></form></body>'
    );
    res.write('</html>');
    // return if additional code runs outside of if statement
    return res.end();
  }
  if (url === '/users') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Assignment One</title></head>');
    res.write('<body><ul><li>User One</li><li>User Two</li></ul></body>');
    res.write('</html>');
    return res.end();
  }
  if (url === '/create-user' && req.method === 'POST') {
    const body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });

    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log('username: ', parsedBody.split('=')[1]);
      res.writeHead(302, { Location: '/' });
      return res.end();
    });
  }
  res.setHeader('Content-Type', 'text/html');
  res.end();
});

server.listen(3100);
