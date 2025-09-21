const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');

// Contact data structure for Firebase Firestore
const contactSchema = {
  // Contact Information
  fullName: {
    type: 'string',
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 100
  },
  
  email: {
    type: 'string',
    required: true,
    // Email validation will be handled in controller
  },
  
  phoneNumber: {
    type: 'string',
    required: true,
    trim: true
  },
  
  message: {
    type: 'string',
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 1000
  },
  
  // Status tracking
  status: {
    type: 'string',
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  
  // Metadata
  submittedAt: {
    type: 'timestamp',
    default: 'serverTimestamp'
  },
  
  respondedAt: {
    type: 'timestamp',
    required: false
  },
  
  ipAddress: {
    type: 'string',
    required: false
  }
};


module.exports = {
  contactSchema,
  sampleContact
};