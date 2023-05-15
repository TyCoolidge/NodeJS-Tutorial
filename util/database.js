// MYSQL
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'Yusuke98',
// });

// module.exports = pool.promise();

// SEQUELIZE
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'Yusuke98', { dialect: 'mysql', host: 'localhost' });

// module.exports = sequelize;

// MONGODB
const mongodb = require('mongodb');
require('dotenv').config();

const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect = async callback => {
    try {
        const client = await MongoClient.connect(
            `mongodb+srv://tyacoolidge:${process.env.MONGODB_PW}@cluster0.8ljpbvu.mongodb.net/?retryWrites=true&w=majority`
        );
        client && console.log('Connected!');
        _db = client.db();
        callback();
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
