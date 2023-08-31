const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(express.urlencoded()); // x-www-form-urlencoded default if submit through <form>
app.use(express.json()); //application/json
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message });
});

mongoose
    .connect('mongodb+srv://tyacoolidge:E6imS1oVko9dYP4L@cluster0.8ljpbvu.mongodb.net/restfulTest')
    .then(result => app.listen(8080))
    .catch(err => console.log(err));
