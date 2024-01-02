const { getCredentials } = require("../utils/requestUtils");
//const { getUser } = require("../utils/users");
const User = require("../models/user");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request Incoming message
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
    const credentials = getCredentials(request);
    
    if (!credentials) {
        return null;
    }
    const user = await User.findOne({ email: credentials[0] });
    //console.log(user);
    if (!user) {
        return null;
    }
    const isPasswordValid = await user.checkPassword(credentials[1]);
    //console.log(isPasswordValid);
    if (isPasswordValid) {
        return user;
    }
    //console.log("A");
    return null;
};

module.exports = { getCurrentUser };