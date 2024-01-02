
const path = require('path');
const mongoose = require('mongoose');
const dotEnvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotEnvPath });

/**
 * Get database connect URL.
 *
 * Returns the MongoDB connection URL from DBURL environment variable,
 * or if the environment variable is not defined, return the default URL
 * mongodb://localhost:27017/WebShopDb
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  // TODO: 9.4 Implement this
    return process.env.DBURL || 'mongodb://localhost:27017/WebShopDb';
};
/**
 * Connects to database
 */
function connectDB() {
    
  // Do nothing if already connected
  
    
    if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
        .then(() => {
            console.log("Success");
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
            .catch(handleCriticalError);
        
  }
}
/**
 * Handles errors
 * 
 * @param {any} err error so it can be printed
 */
function handleCriticalError(err) {
  console.error(err);
  throw err;
}

/**
 * Disconnects form database;
 */
function disconnectDB() {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };