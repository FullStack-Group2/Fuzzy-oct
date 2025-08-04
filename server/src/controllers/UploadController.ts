import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  // Check if a file was uploaded by multer
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Construct the URL to access the uploaded file
  // for testing in a local environment
  const fileUrl = `http://localhost:5001/api/upload/image/${req.file.filename}`;
  console.log('File uploaded successfully:', fileUrl);
  // Send back the URL of the uploaded file
  res.status(200).json({
    message: 'File uploaded successfully.',
    url: fileUrl,
    path: req.file.path, // Also return the internal path if needed
  });
};
