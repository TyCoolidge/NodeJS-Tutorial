// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
// });

// module.exports = User;

const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    async save() {
        try {
            const db = getDb();
            const user = await db.collection('users').insertOne(this);
            return user;
        } catch (err) {
            console.log(err);
        }
    }

    async addToCart(product) {
        try {
            const db = getDb();
            const cartProductIndex = this.cart.items.findIndex(item => {
                return item.productId.toString() === product._id.toString();
            });
            let newQuantity = 1;
            const updatedCartItems = [...this.cart.items];

            if (cartProductIndex >= 0) {
                newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                updatedCartItems[cartProductIndex].quantity = newQuantity;
            } else {
                updatedCartItems.push({ productId: product._id, quantity: newQuantity });
            }

            const updatedCart = { items: updatedCartItems };
            return await db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
        } catch (err) {
            console.log(err);
        }
    }

    async getCart() {
        try {
            const db = getDb();
            const productIds = this.cart.items.map(item => item.productId);
            const products = await db
                .collection('products')
                .find({ _id: { $in: productIds } })
                .toArray();
            console.log(products);
            const cartProducts = products.map(product => {
                const { quantity } = this.cart.items.find(item => item.productId.toString() === product._id.toString());
                return {
                    ...product,
                    quantity,
                };
            });
            return cartProducts;
        } catch (err) {}
        return this.cart;
    }

    static async findById(userId) {
        try {
            const db = getDb();
            const user = await db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
            console.log({ user });
            return user;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = User;
