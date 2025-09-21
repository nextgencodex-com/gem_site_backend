const mongoose = require('mongoose');

const gemSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  caratWeight: {
    type: Number,
    min: 0
  },
  clarity: {
    type: String,
    enum: ['Eye-Clean', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2']
  },
  color: {
    type: String
  },
  origin: {
    type: String
  },
  cut: {
    type: String
  },
  treatment: {
    type: String,
    enum: ['Unheated', 'Heated', 'Enhanced', 'Natural']
  },
  price: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    enum: ['Sapphire', 'Ruby', 'Emerald', 'Diamond', 'Other']
  },
  images: [{
    type: String // URLs to images
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  dimensions: {
    length: Number,
    width: Number,
    depth: Number
  },
  certificateNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  laboratory: {
    type: String
  },
  hardness: {
    type: Number,
    min: 1,
    max: 10,
    default: 9
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto update `updatedAt`
gemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

gemSchema.index({ name: 'text', description: 'text', color: 'text' });
gemSchema.index({ category: 1, inStock: 1 });
gemSchema.index({ price: 1 });

module.exports = mongoose.model('Gem', gemSchema);
