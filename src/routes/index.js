const express = require('express');
const router = express.Router();
const firestoreRoutes = require('./firestoreRoutes');

// Firebase Firestore routes
router.use('/firestore', firestoreRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        firebase: 'Connected'
    });
});

module.exports = router;