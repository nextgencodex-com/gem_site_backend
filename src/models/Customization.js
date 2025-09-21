const { getFirestore } = require('../config/firebase');
const admin = require('firebase-admin');

class CustomizationModel {
  constructor() {
    // Don't initialize db here - use lazy initialization
    this.collection = 'customizations';
  }

  // Lazy initialization of database connection
  getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  // Create new customization
  async create(customizationData) {
    try {
      const db = this.getDb();
      const docRef = await db.collection(this.collection).add({
        ...customizationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return docRef;
    } catch (error) {
      throw new Error(`Error creating customization: ${error.message}`);
    }
  }

  // Get all customizations
  async getAll(filters = {}) {
    try {
      const db = this.getDb();
      let query = db.collection(this.collection);
      
      // Apply filters
      if (filters.gemId) {
        query = query.where('gemId', '==', filters.gemId);
      }
      if (filters.jewelryId) {
        query = query.where('jewelryId', '==', filters.jewelryId);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      const snapshot = await query.get();
      return snapshot;
    } catch (error) {
      throw new Error(`Error fetching customizations: ${error.message}`);
    }
  }

  // Get customization by ID
  async getById(id) {
    try {
      const db = this.getDb();
      const doc = await db.collection(this.collection).doc(id).get();
      return doc;
    } catch (error) {
      throw new Error(`Error fetching customization: ${error.message}`);
    }
  }

  // Update customization
  async update(id, updateData) {
    try {
      const db = this.getDb();
      await db.collection(this.collection).doc(id).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating customization: ${error.message}`);
    }
  }

  // Delete customization
  async delete(id) {
    try {
      const db = this.getDb();
      await db.collection(this.collection).doc(id).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting customization: ${error.message}`);
    }
  }
}

module.exports = new CustomizationModel();