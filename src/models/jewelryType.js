/**
 * Example Firestore jewelry type object structure
 */
const sampleJewelryType = {
  type: '',           // string, required
  description: '',    // string, required
  image: '',          // string (URL), required
  isActive: true,     // boolean, default true
  createdAt: null,    // Firestore timestamp
  updatedAt: null     // Firestore timestamp
};

module.exports = { sampleJewelryType };