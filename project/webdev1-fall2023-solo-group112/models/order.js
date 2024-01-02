const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
        type: String,
        ref: 'User', // Reference to the User model
        required: true,
        trim: true
    },
    items: [
        {
            product: {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product', // Reference to the Product model
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
});


orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);

module.exports = Order;