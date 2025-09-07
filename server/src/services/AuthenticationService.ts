// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import bcrypt from 'bcrypt';

export const validatePassword = async (
  inputPassword: string,
  storedPasswordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPasswordHash);
};
