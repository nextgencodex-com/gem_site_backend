const express = require('express');
const router = express.Router();
const upload = require('../middleware/customJewelleryUpload');
const { handleCustomJewelleryRequest } = require('../controllers/customJewelleryController');

router.post('/', upload.single('image'), handleCustomJewelleryRequest);
console.log('Received custom jewellery request:');

module.exports = router;