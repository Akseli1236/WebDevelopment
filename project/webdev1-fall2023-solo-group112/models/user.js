const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// You can use SALT_ROUNDS when hashing the password with bcrypt.hashSync()
const SALT_ROUNDS = 10;


// You can use these SCHEMA_DEFAULTS when setting the validators for the User Schema. For example the default role can be accessed with 
// SCHEMA_DEFAULTS.role.defaultValue
const SCHEMA_DEFAULTS = {
  name: {
    minLength: 1,
    maxLength: 50
  },
  email: {
    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {
    minLength: 10
  },
  role: {
    values: ['admin', 'customer'],
    defaultValue: 'customer'
  }
};

// TODO: 9.5 Implement the userSchema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1, // Replace with your desired minimum length
        maxlength: 50, // Replace with your desired maximum length
    },

    // For 'email'
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: SCHEMA_DEFAULTS.email.match,
    },

    // For 'password'
    password: {
        type: String,
        required: true,
        minlength: 10
        , // Replace with your desired minimum length
        set: password => {
            const passwordString = password.toString();
            if (passwordString.startsWith('$2a$')) {
                // Password is already hashed, no need to re-hash
                return passwordString;
            }
            if (password.length >= 10) {
                return bcrypt.hashSync(password, SALT_ROUNDS);

            } else {
                return password;
            }
        },
    },

    // For 'role'
    role: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ['admin', 'customer'], // Replace with your desired roles
        default: 'customer', // Default role if not provided
    }
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password Pasword that is given by the user
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function(password) {
    if (!password) throw new Error('No password');

    const result = await bcrypt.compare(password, this.password);
    return result;
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;