const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create jewelry upload directory if it doesn't exist
const jewelryUploadDir = path.join(__dirname, '../uploads/gem');
if (!fs.existsSync(jewelryUploadDir)) {
  fs.mkdirSync(jewelryUploadDir, { recursive: true });
}

// Configure multer storage for jewelry images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save jewelry images in uploads/jewelry folder
    cb(null, jewelryUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fileName = 'gem-' + uniqueSuffix + extension;
    cb(null, fileName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: fileFilter
});

module.exports = upload;