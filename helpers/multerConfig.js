import path from 'path';
import multer from 'multer';

const tmpDir = path.join(process.cwd(), 'tmp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});