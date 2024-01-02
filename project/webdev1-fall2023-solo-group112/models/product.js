const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// You can use SALT_ROUNDS when hashing the password with bcrypt.hashSync()

// You can use these SCHEMA_DEFAULTS when setting the validators for the User Schema. For example the default role can be accessed with 
// SCHEMA_DEFAULTS.role.defaultValue
const SCHEMA_DEFAULTS = {
    name: {
        minLength: 1,
        maxLength: 50
    },
    description: {
        minLength: 1,
        maxLength: 1000
    },
    price: {
        min: 0
    },
    _id: {
        minlength: 1
    }
};

// TODO: 9.5 Implement the userSchema
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1, // Replace with your desired minimum length
        maxlength: 50, // Replace with your desired maximum length
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    image: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    }

    // For 'role'
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;