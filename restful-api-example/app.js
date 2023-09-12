const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/is-auth');
const clearImage = require('./util/file');
// const feedRoutes = require('./routes/feed');
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user');

const app = express();

// place on top of file to prevent cors issue
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    cb(null, false);
};

// app.use(express.urlencoded()); // x-www-form-urlencoded default if submit through <form>
app.use(express.json()); //application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!' });
    }
    if (req.body.oldPath) {
        console.log(req.body.oldPath);
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
});

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes);
// app.use('/user', userRoutes);

app.use(
    '/graphql',
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true,
        customFormatErrorFn(err) {
            // originalError comes directly from graphql
            if (!err.originalError) {
                return err;
            }
            const data = err.originalError.data;
            const message = err.message || 'An error occurred.';
            const status = err.originalError.code || 500;
            return { message, status, data };
        },
    })
);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});

mongoose
    .connect('mongodb+srv://tyacoolidge:E6imS1oVko9dYP4L@cluster0.8ljpbvu.mongodb.net/restfulTest')
    .then(result => {
        const server = app.listen(8080, () => console.log('server started 8080 port.'));
        // const io = require('./socket').init(server);
        // io.on('connection', socket => {
        //     console.log('Client connected');
        //     socket.on('disconnect', () => {
        //         console.log('user disconnected');
        //     });
        // });
    })
    .catch(err => console.log(err));
