const responseUtils = require('../utils/responseUtils');
const Product = require('../models/product');

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 */
const getAllProducts = async response => {
    const prod = await Product.find();
    // TODO: 10.2 Implement this
    return responseUtils.sendJson(response, prod);
};

/**
 * Views a single product
 * @param {any} response The HTTP response object.
 * @param {any} productId If for product
 * @param {any} currentUser User that wants to view product
 * @returns {Promise<void>}
 */
const viewProduct = async (response, productId, currentUser) => {

    if (currentUser.role === 'admin' || currentUser.role === 'customer') {
        const prod = await Product.findOne({ _id: productId });
        if (!prod) {
            return responseUtils.notFound(response);
        }
        return responseUtils.sendJson(response, prod);
    }
};
/**
 * Updates a product with data from user
 * @param {any} response Response for the server
 * @param {any} productId Id of the product
 * @param {any} currentUser User that wants to update product
 * @param {any} userData User imported data
 * @returns {Promise<void>}
 */

const updateProduct = async (response, productId, currentUser, userData) => {
    if (currentUser.role === 'customer') {
        return responseUtils.forbidden(response);
    }
    if (currentUser.role === 'admin') {
        if (userData.name !== '' && userData.price > 0) {
            const prod = await Product.findOne({ _id: productId });
            if (!prod) {
                return responseUtils.notFound(response);
            }
            prod.name = userData.name;
            prod.price = userData.price;
            if (userData.image) {
                prod.image = userData.image;
            }
            if (userData.description) {
                prod.description = userData.description;
            }
            await prod.save();
            return responseUtils.sendJson(response, prod);
        } else {
            return responseUtils.badRequest(response, "Updating own data is not allowed");
        }
    }
};
/**
 * Deletes a product from website and database.
 * @param {any} response The HTTP response object.
 * @param {any} productId Id of the product
 * @param {any} currentUser User that wants to delete product
 * @returns {Promise<void>}
 */
const deleteProduct = async (response, productId, currentUser) => {
    if (currentUser.role === 'customer') {
        return responseUtils.forbidden(response);
    }
    if (currentUser.role === 'admin') {
        const prod = await Product.findOne({ _id: productId });
        if (!prod) {
            return responseUtils.notFound(response);
        }
        await Product.deleteOne({ _id: productId }).exec();
        return responseUtils.sendJson(response, prod);
    }
};
module.exports = { getAllProducts, viewProduct, updateProduct, deleteProduct };