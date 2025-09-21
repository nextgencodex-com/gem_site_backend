const express = require('express');
const router = express.Router();
const {
  createCustomization,
  getAllCustomizations,
  getCustomization,
  updateCustomization,
  deleteCustomization
} = require('../controllers/customizationController'); // Changed to lowercase 'c'

// Public routes
router.route('/')
  .get(getAllCustomizations)
  .post(createCustomization);

router.route('/:id')
  .get(getCustomization)
  .put(updateCustomization)
  .delete(deleteCustomization);

module.exports = router;