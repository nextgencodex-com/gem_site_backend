const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/imagesUploadGem');
const {
  getGems,
  getGem,
  createGem,
  updateGem,
  deleteGem,
  searchGems,
  addToCart
} = require('../controllers/gemController');





// Public routes
router.get('/', getGems);
router.get('/search', searchGems);
router.get('/:id', getGem);

// Protected routes (require authentication)
router.post('/:id/cart', addToCart);

// Admin routes (require admin authentication)
//router.post('/', createGem);
router.post('/', upload.array('images',5), createGem);

router.put('/:id', updateGem);
router.delete('/:id', deleteGem);

module.exports = router;