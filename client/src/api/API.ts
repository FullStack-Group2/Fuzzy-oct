// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window?.location?.origin.includes('localhost')
    ? 'http://localhost:5001/api'
    : `${window.location.origin}/api`);

export default API_BASE;
