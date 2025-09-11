// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

const resetTokenMap = new Map<string, string>(); // email -> token

// Expire tokens after 10 minutes (600,000 ms)
const TOKEN_TTL_MS = 10 * 60 * 1000;

export function generateResetToken(email: string): string {
  const token = Math.random().toString(36).substring(2, 15); // simple random string
  resetTokenMap.set(email, token);
  setTimeout(() => resetTokenMap.delete(email), TOKEN_TTL_MS);
  return token;
}

export function verifyResetToken(email: string, token: string): boolean {
  const stored = resetTokenMap.get(email);
  return stored === token;
}

export function deleteResetToken(email: string) {
  resetTokenMap.delete(email);
}
