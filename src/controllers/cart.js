const config = require('../config/app-config.js');
const mysql = require('mysql');

const controller = class ProductsController {
    constructor() {
        // mysql connection
        this.con = mysql.createConnection(config.sqlCon);
    }

    getContent(user) {
        return new Promise((resolve,reject) => {
            this.con.query('SELECT content FROM `cart` WHERE `user_id` ="'+user+'"', function (err, result) {
                if(err) throw err;
                if(result.length < 1) {
                    reject(result[0]);
                } else {
                    resolve(result[0]);
                }
            });
        });
    }

    addToCart(newProducts, user){
        return new Promise( async(resolve,reject) => {

            try {
                let cartContent = await this.getContent(user);
                let cartProducts = JSON.parse(cartContent.content);

                for(let cartProduct of cartProducts) {
                    for(let newProduct of newProducts) {
                        if (cartProduct.id == newProduct.id && cartProduct.size == newProduct.size) {
                            cartProduct.quantity = newProduct.quantity + cartProduct.quantity;
                            let index = newProducts.indexOf(newProduct);
                            newProducts.splice(index, 1);
                        }
                    }
                }

                cartProducts = JSON.stringify(cartProducts.concat(newProducts));

                this.con.query('UPDATE `cart` SET `content` = ? WHERE `user_id` = ?', [cartProducts,user], function (err, result) {
                    if(err) throw err;
                    resolve('Added to the cart!');
                });

            } catch {
                let cartRow = {user_id: user, content: JSON.stringify(newProducts)};
                this.con.query('INSERT INTO `cart` SET ?', cartRow, function (err, result) {
                    if(err) throw err;
                    resolve('Added to the cart!');
                });
            }
        });
    }
}

module.exports = controller;













/* INSERT INTO products (title,description) values
('The Original','Hamburger 100% Beef 🐂, american cheese 🧀, bacon 🥓, tomato 🍅, lettuce 🥗 and our famous sauce.');

INSERT INTO sizes (product_id,price,size,stock) values
(1, 9.50 ,'L', 20),
(1, 8.50 ,'M', 33),
(1, 7.50 ,'P', 10);

create table products (
id INT AUTO_INCREMENT PRIMARY KEY,
title varchar(20),
description varchar(200)
); */

/* create table sizes (
    product_id INT,
    size varchar(3),
    price DECIMAL(10,2),
    stock int(10),
    FOREIGN KEY(product_id) REFERENCES products(id)
); */