// server/src/types/express.d.ts

// This extends the Express Request interface to include properties added by Multer.
// It's crucial for TypeScript to recognize req.file and req.files.

declare namespace Express {
  export interface Request {
    // For single file uploads (multer.single)
    file?: Multer.File;
    // For multiple file uploads (multer.array or multer.fields)
    files?:
      | {
          [fieldname: string]: Multer.File[];
        }
      | Multer.File[];
  }
}

// You might also need to explicitly import Multer types if they are not globally available
// This line ensures that the Multer namespace is recognized.
import { Multer } from "multer";
