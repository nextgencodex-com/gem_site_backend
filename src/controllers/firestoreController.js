const { getFirestore } = require('../config/firebase');

// Example controller for Firestore operations
const firestoreController = {
  // Create a document
  createDocument: async (req, res) => {
    try {
      const { collection, data } = req.body;
      
      if (!collection || !data) {
        return res.status(400).json({ error: 'Collection and data are required' });
      }

      const db = getFirestore();
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        documentId: docRef.id,
        message: 'Document created successfully'
      });
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  },

  // Get a document by ID
  getDocument: async (req, res) => {
    try {
      const { collection, documentId } = req.params;
      
      const db = getFirestore();
      const doc = await db.collection(collection).doc(documentId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        success: true,
        data: {
          id: doc.id,
          ...doc.data()
        }
      });
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({ error: 'Failed to get document' });
    }
  },

  // Get all documents from a collection
  getCollection: async (req, res) => {
    try {
      const { collection } = req.params;
      const { limit, orderBy, direction = 'asc' } = req.query;
      
      const db = getFirestore();
      let query = db.collection(collection);

      // Add ordering if specified
      if (orderBy) {
        query = query.orderBy(orderBy, direction);
      }

      // Add limit if specified
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const snapshot = await query.get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      console.error('Error getting collection:', error);
      res.status(500).json({ error: 'Failed to get collection' });
    }
  },

  // Update a document
  updateDocument: async (req, res) => {
    try {
      const { collection, documentId } = req.params;
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }

      const db = getFirestore();
      await db.collection(collection).doc(documentId).update({
        ...data,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Document updated successfully'
      });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  },

  // Delete a document
  deleteDocument: async (req, res) => {
    try {
      const { collection, documentId } = req.params;
      
      const db = getFirestore();
      await db.collection(collection).doc(documentId).delete();

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
};

module.exports = firestoreController;
