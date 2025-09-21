# Firebase Storage Integration Setup Guide

This guide will help you set up Firebase as a storage solution (Firestore) with your Node.js backend application. **No authentication required** - this is for storage operations only.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Node.js and npm installed

## Setup Steps

### 1. Install Dependencies

Firebase Admin SDK has already been installed. If you need to install it manually:

```bash
npm install firebase-admin
```

### 2. Configure Firebase

#### Option A: Using Service Account Key File (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and save it securely in your project (e.g., `config/serviceAccountKey.json`)
6. Add to your `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/serviceAccountKey.json
   ```

#### Option B: Using Environment Variables

1. Open the downloaded service account JSON file
2. Copy the values to your `.env` file:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

### 3. Configure Firestore Security Rules

Since we're not using authentication, you'll need to configure Firestore rules to allow public access. **Warning: This makes your database publicly accessible!**

#### Public Access Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access to all documents
    match /{document=**} {
      allow read, write: true;
    }
  }
}
```

#### More Secure Alternative (IP-based or time-based restrictions):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow access only during certain hours or add other conditions
    match /{document=**} {
      allow read, write: if request.time.hour >= 9 && request.time.hour <= 17;
    }
  }
}
```

## Available API Endpoints

### Firestore Storage Endpoints (No Authentication Required)

- `GET /api/firestore/:collection` - Get all documents from a collection
- `POST /api/firestore/:collection` - Create a new document
- `GET /api/firestore/:collection/:documentId` - Get a specific document
- `PUT /api/firestore/:collection/:documentId` - Update a document
- `DELETE /api/firestore/:collection/:documentId` - Delete a document

### Example Usage

#### Create a Document
```javascript
const response = await fetch('/api/firestore/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    }
  })
});

const result = await response.json();
console.log('Created document:', result);
```

#### Get All Documents from Collection
```javascript
const response = await fetch('/api/firestore/users?limit=10&orderBy=createdAt&direction=desc');
const result = await response.json();
console.log('Users:', result.data);
```

#### Get Specific Document
```javascript
const response = await fetch('/api/firestore/users/document-id-here');
const result = await response.json();
console.log('User:', result.data);
```

#### Update Document
```javascript
const response = await fetch('/api/firestore/users/document-id-here', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      name: 'Jane Doe Updated',
      age: 31
    }
  })
});
```

#### Delete Document
```javascript
const response = await fetch('/api/firestore/users/document-id-here', {
  method: 'DELETE'
});
```

## Testing

1. Start your server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. You should see a response indicating Firebase is connected.

## Security Best Practices

1. Never commit your service account key or `.env` file to version control
2. Use environment variables for all sensitive configuration
3. **Important**: Since authentication is disabled, your Firestore database will be publicly accessible
4. Consider implementing your own API key system if you need some level of access control
5. Set up appropriate Firebase security rules (even for public access, you can add time-based or other restrictions)
6. Use HTTPS in production
7. Validate and sanitize all input data
8. Consider rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **"Error initializing Firebase"**: Check your environment variables and service account key
2. **"Permission denied"**: Check your Firebase security rules - they should allow public access
3. **"Project not found"**: Verify your project ID is correct
4. **"Collection not found"**: Firestore creates collections automatically when you add the first document

### Debug Mode

You can enable debug logging by setting:
```
DEBUG=firebase*
```

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
