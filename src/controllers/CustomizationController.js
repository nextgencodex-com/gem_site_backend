const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');
const customizationModel = require('../models/Customization');

// @desc    Create new customization
// @route   POST /api/customizations
// @access  Public
const createCustomization = async (req, res) => {
  try {
    const db = getFirestore();
    const { gemId, gemName, jewelryId, jewelryName, ...otherData } = req.body;

    // Validate required fields
    if (!gemId || !jewelryId) {
      return res.status(400).json({
        success: false,
        message: 'gemId and jewelryId are required'
      });
    }

    // Verify gem exists
    const gemDoc = await db.collection('gems').doc(gemId).get();
    if (!gemDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Gem not found'
      });
    }

    // Verify jewelry exists
    const jewelryDoc = await db.collection('jewelry').doc(jewelryId).get();
    if (!jewelryDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Jewelry not found'
      });
    }

    // Create customization data
    const customizationData = {
      gemId,
      gemName: gemName || gemDoc.data().name,
      jewelryId,
      jewelryName: jewelryName || jewelryDoc.data().name,
      status: 'pending',
      ...otherData
    };

    const docRef = await customizationModel.create(customizationData);
    const doc = await docRef.get();

    res.status(201).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      message: 'Customization created successfully'
    });
  } catch (error) {
    console.error('Error creating customization:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all customizations
// @route   GET /api/customizations
// @access  Public
const getAllCustomizations = async (req, res) => {
  try {
    const filters = {
      gemId: req.query.gemId,
      jewelryId: req.query.jewelryId,
      status: req.query.status
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const snapshot = await customizationModel.getAll(filters);

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No customizations found'
      });
    }

    const customizations = [];
    snapshot.forEach(doc => {
      customizations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: customizations,
      count: customizations.length
    });
  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get customization by ID
// @route   GET /api/customizations/:id
// @access  Public
const getCustomization = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customization ID is required'
      });
    }

    const doc = await customizationModel.getById(id);

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Customization not found'
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
    console.error('Error fetching customization:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update customization
// @route   PUT /api/customizations/:id
// @access  Public
const updateCustomization = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customization ID is required'
      });
    }

    const doc = await customizationModel.update(id, req.body);

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Customization not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      message: 'Customization updated successfully'
    });
  } catch (error) {
    console.error('Error updating customization:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete customization
// @route   DELETE /api/customizations/:id
// @access  Public
const deleteCustomization = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Customization ID is required'
      });
    }

    // Check if customization exists
    const doc = await customizationModel.getById(id);
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Customization not found'
      });
    }

    await customizationModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Customization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customization:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createCustomization,
  getAllCustomizations,
  getCustomization,
  updateCustomization,
  deleteCustomization
};