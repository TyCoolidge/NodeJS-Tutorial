const express = require('express');

const app = express();

app.use('/users', (req, res) => {
  console.log('hit users middleware');
  res.send('<h1>Users route</h1>');
});

app.use('/', (req, res) => {
  console.log('hit home middleware');
  res.send('<h1>home route</h1>');
});
app.listen(3200);
