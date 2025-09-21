const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// @desc    Get all gems
// @route   GET /api/gems
// @access  Public
const getGems = async (req, res) => {
  try {
    const db = getFirestore();
    const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 15; // <-- REMOVE THIS LINE
    // const offset = (page - 1) * limit; // <-- REMOVE THIS LINE

    let query = db.collection('gems');

    // Apply filters
    if (req.query.category) {
      query = query.where('category', '==', req.query.category);
    }
    if (req.query.treatment) {
      query = query.where('treatment', '==', req.query.treatment);
    }
    if (req.query.inStock !== undefined) {
      query = query.where('inStock', '==', req.query.inStock === 'true');
    }
    if (req.query.minPrice) {
      query = query.where('price', '>=', parseFloat(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query = query.where('price', '<=', parseFloat(req.query.maxPrice));
    }

    // Apply ordering
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      const direction = parts[1] === 'desc' ? 'desc' : 'asc';
      query = query.orderBy(parts[0], direction);
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    // Do not apply .limit() or .offset()

    const snapshot = await query.get();
    const gems = [];

    snapshot.forEach(doc => {
      gems.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get total count
    const total = gems.length;

    res.status(200).json({
      success: true,
      data: gems,
      total
    });
  } catch (error) {
    console.error('Error fetching gems:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single gem
// @route   GET /api/gems/:id
// @access  Public
const getGem = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('gems').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Gem not found'
      });
    }
   
    
    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching gem:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new gem
// @route   POST /api/gems
// @access  Public
const createGem = async (req, res) => {
  try {
    const db = getFirestore();

    // Parse data
    const gemData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle multiple gem images if they exist
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/src/uploads/gem/${file.filename}`);
    } else if (req.file) {
      imagePaths = [`/src/uploads/gem/${req.file.filename}`];
    }
    gemData.images = imagePaths;
    gemData.imageCount = imagePaths.length;

    // Create document
    const docRef = await db.collection('gems').add(gemData);

    // Update document to include its own ID
    await docRef.update({ id: docRef.id });

    // Fetch the updated document
    const doc = await docRef.get();

    // Check if category exists and add to gemTypes collection if needed
    if (doc.data()['category']) {
      const existingTypes = await db.collection('gemTypes')
        .where('name', '==', doc.data()['category'])
        .get();
      
      if (existingTypes.empty) {
        const types = await db.collection('gemTypes').add({
          id: doc.id,
          gemName: doc.data()['name'],
          name: doc.data()['category'],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('New gem type added:', doc.data()['category']);
      } else {
        console.log('Category already exists:', doc.data()['category']);
      }
    }
    if(res.statusCode === 200) {
      console.log('Gem created successfully:', doc.id);
    }

    res.status(201).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        uploadedImages: imagePaths
      },
      message: `Gem created successfully with ${imagePaths.length} images`
    });
  } catch (error) {
    console.error('Error creating gem:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update gem
// @route   PUT /api/gems/:id
// @access  Public
const updateGem = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('gems').doc(req.params.id);
    
    // Check if gem exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Gem not found'
      });
    }
    
    // Update data with timestamp
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await docRef.update(updateData);
    
    // Get updated document
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating gem:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete gem
// @route   DELETE /api/gems/:id
// @access  Public
const deleteGem = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('gems').doc(req.params.id);
    
    // Check if gem exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Gem not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Gem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gem:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search gems
// @route   GET /api/gems/search
// @access  Public
const searchGems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const db = getFirestore();
    
    // Simple search by name (Firestore doesn't have full-text search built-in)
    // For better search, consider using Algolia or Elasticsearch
    const snapshot = await db.collection('gems')
      .where('name', '>=', q)
      .where('name', '<=', q + '\uf8ff')
      .get();
    
    const gems = [];
    snapshot.forEach(doc => {
      gems.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      data: gems
    });
  } catch (error) {
    console.error('Error searching gems:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add gem to cart
// @route   POST /api/gems/:id/cart
// @access  Public
const addToCart = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('gems').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Gem not found'
      });
    }
    
    const gemData = doc.data();
    
    if (!gemData.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Gem is out of stock'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Gem added to cart successfully',
      data: {
        gemId: doc.id,
        name: gemData.name,
        price: gemData.price,
        caratWeight: gemData.caratWeight,
        color: gemData.color,
        image: gemData.images && gemData.images[0] || null
      }
    });
  } catch (error) {
    console.error('Error adding gem to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getGems,
  getGem,
  createGem,
  updateGem,
  deleteGem,
  searchGems,
  addToCart
};