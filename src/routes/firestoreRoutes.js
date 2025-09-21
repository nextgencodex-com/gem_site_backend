const express = require('express');
const router = express.Router();
const { firestoreController } = require('../controllers');

// Collection routes - no authentication required
router.get('/:collection', firestoreController.getCollection);
router.post('/:collection', firestoreController.createDocument);

// Document routes - no authentication required
router.get('/:collection/:documentId', firestoreController.getDocument);
router.put('/:collection/:documentId', firestoreController.updateDocument);
router.delete('/:collection/:documentId', firestoreController.deleteDocument);

module.exports = router;
