import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as uploadController from '../controllers/UploadController';
const router = Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });
router.post('/image', upload.single('image'), uploadController.uploadImage);

export default router;
