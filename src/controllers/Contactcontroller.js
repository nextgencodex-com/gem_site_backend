const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');

// Email validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation helper
const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const db = getFirestore();
    
    const { fullName, email, phoneNumber, message } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: {
          fullName: !fullName ? 'Full name is required' : null,
          email: !email ? 'Email is required' : null,
          phoneNumber: !phoneNumber ? 'Phone number is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Validate phone format
    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }
    
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be less than 1000 characters'
      });
    }
    
    // Prepare contact data
    const contactData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      message: message.trim(),
      status: 'new',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    };
    
    // Save to Firestore
    const docRef = await db.collection('contacts').add(contactData);
    const doc = await docRef.get();
    
    console.log(`📧 New contact submission from: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: doc.id,
        submittedAt: contactData.submittedAt
      }
    });
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact
// @access  Public (should be protected in production)
const getContacts = async (req, res) => {
  try {
    const db = getFirestore();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let query = db.collection('contacts');
    
    // Filter by status
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
    
    // Apply ordering (newest first)
    query = query.orderBy('submittedAt', 'desc');
    
    // Apply pagination
    query = query.offset(offset).limit(limit);
    
    const snapshot = await query.get();
    const contacts = [];
    
    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get total count
    const totalSnapshot = await db.collection('contacts').get();
    const total = totalSnapshot.size;
    
    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Public (should be protected in production)
const getContact = async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('contacts').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
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
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Public (should be protected in production)
const updateContactStatus = async (req, res) => {
  try {
    const db = getFirestore();
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const docRef = db.collection('contacts').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (status === 'replied') {
      updateData.respondedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    
    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
    
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Public (should be protected in production)
const deleteContact = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('contacts').doc(req.params.id);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact
};