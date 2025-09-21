const express = require('express');
const router = express.Router();
const upload = require('../middleware/imagesUpload');
const {
  getAllJewelry,
  createJewelry
} = require('../controllers/jeweloryController');

router.route('/')
   .post(upload.array('images', 5), createJewelry)

router.route('/')
  .get(getAllJewelry);


module.exports = router;