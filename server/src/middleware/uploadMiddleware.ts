// src/middleware/uploadMiddleware.ts
import multer from "multer";
import path from "path";

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: "./uploads/", // Directory to save uploaded files (relative to project root)
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Check file type
const checkFileType = (
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed ext (example for images)
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

export default upload; // <--- Export the configured Multer instance
