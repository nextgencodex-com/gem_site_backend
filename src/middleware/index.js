const morgan = require('morgan');

// Simple logging middleware
const logging = morgan('dev');

// Custom middleware for additional logging
const customLogging = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

module.exports = {
    logging,
    customLogging
};
