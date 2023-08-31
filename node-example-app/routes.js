const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Message</title></head>');
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message" placeholder="enter a message"><button type="submit">Send</button></form></body>'
    );
    res.write('</html>');
    return res.end(); //exit out of func
  }
  if (url === '/message' && method === 'POST') {
    const body = [];
    // .on event listener
    req.on('data', chunk => {
      body.push(chunk); // Buffer object
    });
    return req.on('end', () => {
      // Buffer is similar to a bus stop, stops for the data before continuing
      // If we dont buffer and have a longer body, then it will print multiple times as opposed to once
      const parsedBody = Buffer.concat(body).toString(); // message={user message}
      const message = parsedBody.split('=')[1];
      // fs.writeFileSync('message.txt', message); // blocks code execution
      fs.writeFile('message.txt', message, err => {
        // asynchrounouly runs (non-blocking)
        //status 302 === redirection
        // bottom runs once file is done
        res.writeHead(302, { Location: '/' });
        // OR
        // res.statusCode = 302;
        // res.setHeader('Location', '/');
        return res.end();
      });
    });
  }
  // console.log(req.url, req.method, req.headers); // most important request values
  // process.exit(); // quit the server
  res.setHeader('Content-Type', 'text/html'); // attach header to response
  res.write(
    '<html><head><title>My First Page</title></head><body><h1>Hello from my Node.js Server!</h1></body></html>' // can write on seperate lines as well
  ); // write data
  res.end(); // sends back to client
};

// Ways to Export in NODEJS
// exporting one function (import as requestHandler to use function)
module.exports = requestHandler;

// exporting many things
// module.exports = { requestHandler }; import file.requestHandler to get access

// module.exports.requestHandler = requestHandler;

// shortcut
// exports.requestHandler = requestHandler;
