import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Define upload directory path
export const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
export const initializeUploadDir = async () => {
  try {
    await fs.access(uploadDir);
    return true;
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
    return true;
  }
};

// Initialize upload directory
initializeUploadDir();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});
