const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../middleware/imageuploadtype');

const {
  getJewelryTypes,
  getJewelryType,
  createJewelryType,
  updateJewelryType,
  deleteJewelryType,
  toggleJewelryTypeStatus,
  searchJewelryTypes
} = require('../controllers/jeweloryTypeController');

// All routes are public (no authentication required)
router.get('/', getJewelryTypes);
router.get('/search', searchJewelryTypes);
router.get('/:id', getJewelryType);
router.post('/', upload.single('image'), createJewelryType);
router.put('/:id', updateJewelryType);
router.delete('/:id', deleteJewelryType);
router.patch('/:id/toggle', toggleJewelryTypeStatus);

module.exports = router;