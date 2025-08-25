import bcrypt from 'bcrypt';

export const validatePassword = async (
  inputPassword: string,
  storedPasswordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPasswordHash);
};
