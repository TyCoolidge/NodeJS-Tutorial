const products = [];
console.log(products);
module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        products.push(this);
    }

    static fetchAll() {
        return products;
    }
};

// module.exports = function Product(title) {
//     this.title = title;
//     console.log(this.title);
//     const save = function () {
//         products.push(this);
//     };

//     const fetchAll = function () {
//         return this.products;
//     };
// };
