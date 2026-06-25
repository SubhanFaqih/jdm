import multer from 'multer';
import path from 'path';

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the backend/public/uploads directory
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Define file filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diizinkan!'), false);
  }
};

// Initialize multer middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB file size limit
  },
  fileFilter: fileFilter
});
