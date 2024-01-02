const User = require('../models/user');
const responseUtils = require('../utils/responseUtils');
/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 */
const getAllUsers = async response => {
    const allUsers = await User.find();
    return responseUtils.sendJson(response, allUsers);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 * @param {string} userId UserId
 * @param {object} currentUser (mongoose document object)
 */
const deleteUser = async (response, userId, currentUser) => {
    const test = await User.findOne({ _id: userId });

    if (!test) {
        return responseUtils.notFound(response);
    }
    else if (userId === currentUser.id) {
        return responseUtils.badRequest(response, "Updating own data is not allowed");
    }
    else if (currentUser.role === 'admin') {
        // Admin can delete users
        await User.deleteOne({ _id: userId }).exec();
        return responseUtils.sendJson(response, test);
    }
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 * @param {string} userId UserId
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
    const test = await User.findOne({ _id: userId });

    if (!test) {
        return responseUtils.notFound(response);
    }
    if (currentUser.id === userId) {
        return responseUtils.badRequest(response, "Updating own data is not allowed");
    }
    else if (currentUser.role === 'admin' && (userData.role === 'admin' || userData.role === 'customer')) {
        //existingUser.name = "My New Name";
        //await existingUser.save();
        test.role = userData.role;
        await test.save();
        return responseUtils.sendJson(response, test);

    } 
    else if (userData.role === 'customer') {
        console.log(test);
        return responseUtils.sendJson(response, test);
    } else {
        return responseUtils.badRequest(response, "BAD");
    }
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 * @param {string} userId UserId
 * @param {object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
    const test = await User.findOne({ _id: userId });

    if (!test) {
        return responseUtils.notFound(response);
    } else if (currentUser.id === userId) {
        return responseUtils.badRequest(response, "BAD");
    }
    if (currentUser.role === 'admin') {
        return responseUtils.sendJson(response, test);

    }
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response The HTTP response object.
 * @param {object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
    if (!userData) {

        return responseUtils.badRequest(response, "Invalid user data");
    }
    if (userData.email && userData.name && userData.password) {




        try {
            const newUser = new User({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: 'customer', // Set the user's role
            });

            // Save the new user to the database
            await newUser.save();
            // Send a response indicating that the user was created successfully
            return responseUtils.createdResource(response, newUser);
        } catch (error) {
            // Handle the error (e.g., validation error or database error)
            return responseUtils.badRequest(response, "Failed to create user.");
        }
    }
    return responseUtils.badRequest(response, "Failed to create user.");
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };