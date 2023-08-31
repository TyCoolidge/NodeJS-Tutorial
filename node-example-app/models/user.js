// // const Sequelize = require('sequelize');

// // const sequelize = require('../util/database');

// // const User = sequelize.define('user', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true,
// //     },
// //     name: {
// //         type: Sequelize.STRING,
// //         allowNull: false,
// //     },
// //     email: {
// //         type: Sequelize.STRING,
// //         allowNull: false,
// //     },
// // });

// // module.exports = User;

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart; // {items: []}
//         this._id = id ? new mongodb.ObjectId(id) : null;
//     }

//     async save() {
//         try {
//             const db = getDb();
//             const user = await db.collection('users').insertOne(this);
//             return user;
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     async addToCart(product) {
//         try {
//             const db = getDb();
//             const cartProductIndex = this.cart.items.findIndex(item => {
//                 return item.productId.toString() === product._id.toString();
//             });
//             let newQuantity = 1;
//             const updatedCartItems = [...this.cart.items];

//             if (cartProductIndex >= 0) {
//                 newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//                 updatedCartItems[cartProductIndex].quantity = newQuantity;
//             } else {
//                 updatedCartItems.push({ productId: product._id, quantity: newQuantity });
//             }

//             const updatedCart = { items: updatedCartItems };
//             return await db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     async getCart() {
//         try {
//             const db = getDb();
//             const productIds = this.cart.items.map(item => item.productId);
//             const products = await db
//                 .collection('products')
//                 .find({ _id: { $in: productIds } })
//                 .toArray();
//             const cartProducts = products.map(product => {
//                 const { quantity } = this.cart.items.find(item => item.productId.toString() === product._id.toString());
//                 return {
//                     ...product,
//                     quantity,
//                 };
//             });
//             return cartProducts;
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     async deleteFromCart(productId) {
//         try {
//             const updatedCartItems = this.cart.items.filter(item => {
//                 return item.productId.toString() !== productId.toString();
//             });
//             const db = getDb();
//             const result = await db
//                 .collection('users')
//                 .updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems } } });
//             return result;
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     static async findById(userId) {
//         try {
//             const db = getDb();
//             const user = await db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
//             return user;
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     async getOrders() {
//         try {
//             const db = getDb();
//             const orders = await db.collection('orders').find({ 'user._id': this._id }).toArray();
//             return orders;
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     async addOrder() {
//         try {
//             const db = getDb();
//             const cartItems = await this.getCart();
//             const order = {
//                 items: cartItems,
//                 user: {
//                     _id: this._id,
//                     name: this.name,
//                 },
//             };
//             await db.collection('orders').insertOne(order);
//             // clear cart
//             const result = await db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
//             return result;
//         } catch (err) {}
//     }
// }

// module.exports = User;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpire: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.addToCart = async function (product) {
    try {
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

        this.cart = { items: updatedCartItems };
        return await this.save();
    } catch (err) {
        console.log(err);
    }
};

userSchema.methods.removeFromCart = async function (productId) {
    try {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        this.cart = { items: updatedCartItems };
        return await this.save();
    } catch (err) {
        console.log(err);
    }
};

userSchema.methods.clearCart = async function () {
    try {
        this.cart = { items: [] };
        return await this.save();
    } catch (err) {
        console.log(err);
    }
};

module.exports = mongoose.model('User', userSchema);
