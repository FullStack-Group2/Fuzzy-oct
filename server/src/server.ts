// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import app from './app';
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv to find the .env file in the root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
