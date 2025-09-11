// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import { Request, Response } from 'express';
import ImageModel from '../models/Image';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    // Check if a file was uploaded by multer
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { path, filename } = req.file;

    // Save image info to database
    const image = new ImageModel({ path, filename });
    const savedImage = await image.save();

    // Construct the full URL to access the uploaded file
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log('File uploaded successfully:', fileUrl);

    // Send back the image data with proper URL
    res.status(200).json({
      message: 'File uploaded successfully.',
      image: {
        id: savedImage._id,
        filename: filename,
        url: fileUrl,
        path: path,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      message: 'Failed to upload image.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
