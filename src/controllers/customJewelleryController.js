const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');

const handleCustomJewelleryRequest = async (req, res) => {
  try {
    // Spread all fields from the request body
    const data = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // If an image file was uploaded, set the image path
    if (req.file) {
      data.image = `/uploads/custom/${req.file.filename}`;
    }

    const db = getFirestore();

    await db.collection('customJewelleryRequests').add(data);

    res.status(201).json({
      success: true,
      message: 'Custom jewellery request submitted successfully.',
      imageUrl: data.image || null
    });
  } catch (error) {
    console.error('Firestore error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handleCustomJewelleryRequest };