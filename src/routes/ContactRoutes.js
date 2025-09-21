const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact');

// Use the contact controller for POST /
router.use('/', contactController);

module.exports = router;