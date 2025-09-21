const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');
const path = require('path');

// @access  Public
const createJewelry = async (req, res) => {
  try {
    const db = getFirestore();
    
    // Process uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`Jewelry image ${index}:`, file.filename);
        // Create relative path for serving jewelry images
        const imageUrl = `/uploads/jewelry/${file.filename}`;
        imageUrls.push(imageUrl);
      });
    }
    
    console.log('Processed jewelry image URLs:', imageUrls);
    
    const jewelryData = {
      ...req.body,
      images: imageUrls, // Store array of jewelry image URLs
      imageCount: imageUrls.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
     
    const docRef = await db.collection('jewelry').add(jewelryData);
    const doc = await docRef.get();
    
    if (doc.data()['category']) {
      // Check if category already exists
      const existingTypes = await db.collection('jewelryTypes')
        .where('name', '==', doc.data()['category'])
        .get();
      
      if (existingTypes.empty) {
        const types = await db.collection('jewelryTypes').add({
          id: doc.id,
          gemName: doc.data()['name'],
          name: doc.data()['category'],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('New jewelry type added:', doc.data()['category']);
      } else {
        console.log('Category already exists:', doc.data()['category']);
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        uploadedImages: imageUrls
      }
    });
  } catch (error) {
    console.error('Error creating jewelry:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @access  Public
const getAllJewelry = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('jewelry').get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No jewelry items found'
      });
    }
    
    const jewelryItems = [];
    snapshot.forEach(doc => {
      jewelryItems.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      data: jewelryItems,
      count: jewelryItems.length
    });
  } catch (error) {
    console.error('Error fetching all jewelry items:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createJewelry,
  getAllJewelry
};