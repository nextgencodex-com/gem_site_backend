const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');
const jewelryType = require('./jewelryType');

// Jewelry data structure and validation rules
const jewelrySchema = {
  // Basic Information
  name: {
    type: 'string',
    required: true
  },
  
  description: {
    type: 'string',
  },
  
  // Physical Properties
  material: {
    type: 'string',
    required: true,
  },
  
  size: {
    type: Number,
    required: true,
  },
  
  settings: {
    type: 'string',
    required: true,
  },
  
  weight: {
    type: 'number',
    required: true,
  },
  
  finish: {
    type: 'string',
    required: true,
  },
  
  stone: {
    type: 'string',
    required: false,
  },
  
  images: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
      // URLs to images
    },
    maxItems: 10
  },
  
  jewelryType:{
    type: 'string',
  ref: 'jewelryType'

  },
  
  price: {
    type: 'number',
    required: true,
    min: 0
  },
  
  inStock: {
    type: 'boolean',
    default: true
  },
  
  // Metadata
  createdAt: {
    type: 'timestamp',
    default: 'serverTimestamp'
  },
  
  updatedAt: {
    type: 'timestamp',
    default: 'serverTimestamp'
  }
};

module.exports = {
  jewelrySchema
};