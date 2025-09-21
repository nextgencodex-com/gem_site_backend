const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');

// GET all jewelry types
const getJewelryTypes = async (req, res) => {
  try {
    const db = getFirestore();
    let query = db.collection('jewelryTypes');

    // Filtering
    if (req.query.isActive !== undefined) {
      query = query.where('isActive', '==', req.query.isActive === 'true');
    }
    if (req.query.type) {
      // Firestore doesn't support regex, so use simple case-insensitive match
      // This will fetch all and filter in JS (not efficient for large collections)
      const snapshot = await query.get();
      const filtered = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type && data.type.toLowerCase().includes(req.query.type.toLowerCase())) {
          filtered.push({ id: doc.id, ...data });
        }
      });
      return res.status(200).json({ success: true, data: filtered });
    }

    // Sorting (by type or createdAt)
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      query = query.orderBy(parts[0], parts[1] === 'desc' ? 'desc' : 'asc');
    } else {
      query = query.orderBy('type', 'asc');
    }

    const snapshot = await query.get();
    const jewelryTypes = [];
    snapshot.forEach(doc => {
      jewelryTypes.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: jewelryTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single jewelry type
const getJewelryType = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('jewelryTypes').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Jewelry type not found' });
    }
    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE new jewelry type
const createJewelryType = async (req, res) => {
  try {
    const { type, description } = req.body;
    let image = req.body.image;

    // If an image file was uploaded, set the image path
    if (req.file) {
      image = `/uploads/type/${req.file.filename}`;
    }

    if (!type || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'type, description, and image are required fields.'
      });
    }

    const db = getFirestore();
    const data = {
      type,
      description,
      image,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('jewelryTypes').add(data);
    const doc = await docRef.get();
    res.status(201).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE jewelry type
const updateJewelryType = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('jewelryTypes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Jewelry type not found' });
    }
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.status(200).json({ success: true, data: { id: updatedDoc.id, ...updatedDoc.data() }, message: 'Jewelry type updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE jewelry type
const deleteJewelryType = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('jewelryTypes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Jewelry type not found' });
    }
    await docRef.delete();
    res.status(200).json({ success: true, message: 'Jewelry type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE jewelry type status
const toggleJewelryTypeStatus = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('jewelryTypes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Jewelry type not found' });
    }
    const currentStatus = doc.data().isActive;
    await docRef.update({
      isActive: !currentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const updatedDoc = await docRef.get();
    res.status(200).json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: `Jewelry type ${!currentStatus ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEARCH jewelry types (simple case-insensitive search)
const searchJewelryTypes = async (req, res) => {
  try {
    const db = getFirestore();
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    const snapshot = await db.collection('jewelryTypes').get();
    const results = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (
        (data.type && data.type.toLowerCase().includes(q.toLowerCase())) ||
        (data.description && data.description.toLowerCase().includes(q.toLowerCase()))
      ) {
        results.push({ id: doc.id, ...data });
      }
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJewelryTypes,
  getJewelryType,
  createJewelryType,
  updateJewelryType,
  deleteJewelryType,
  toggleJewelryTypeStatus,
  searchJewelryTypes
};