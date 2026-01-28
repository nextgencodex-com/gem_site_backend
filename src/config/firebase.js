const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const initializeFirebase = async () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Method 1: Using service account key file (recommended for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      }
      // Method 2: Using environment variables (alternative approach)
      else if (process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      }
      // Method 3: Using default credentials (for Google Cloud environments)
      else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      }

      console.log('✅ Firebase Admin SDK initialized successfully');
    }
    
    return admin;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
};

// Get Firebase services
const getFirestore = () => {
  return admin.firestore();
};

const getStorage = () => {
  return admin.storage();
};

const getDatabase = () => {
  return admin.database();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  getDatabase,
  admin
};
