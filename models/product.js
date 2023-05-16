// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     title: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false,
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
// });

// module.exports = Product;

// // const db = require('../util/database');
// // const Cart = require('./cart');

// // module.exports = class Product {
// //     constructor(id, title, imageUrl, description, price) {
// //         this.id = id;
// //         this.title = title;
// //         this.imageUrl = imageUrl;
// //         this.description = description;
// //         this.price = price;
// //     }

// //     save() {
// //         return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
// //             this.title,
// //             this.price,
// //             this.imageUrl,
// //             this.description,
// //         ]);
// //     }

// //     static deleteById(id) {}

// //     static fetchAll() {
// //         return db.execute('SELECT * FROM products');
// //     }

// //     static findById(id) {
// //         return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
// //     }
// // };
const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class Product {
    constructor(title, imageUrl, description, price, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }

    async save() {
        try {
            const db = getDb();
            let dbOp;
            if (this._id) {
                dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
            } else {
                dbOp = db.collection('products').insertOne(this);
            }
            const result = await dbOp;
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    static async fetchAll() {
        try {
            const db = getDb();
            const products = await db.collection('products').find().toArray();
            return products;
        } catch (err) {
            console.log(err);
        }
    }

    static async fetchOne(productId) {
        try {
            const db = getDb();
            const product = await db.collection('products').findOne({ _id: new mongodb.ObjectId(productId) });
            console.log({ product });
            return product;
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteById(productId) {
        try {
            const db = getDb();
            const result = await db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) });
            console.log({ result });
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Product;
