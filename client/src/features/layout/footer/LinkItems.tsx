// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Link } from 'react-router-dom';

import BackToTopButton from './BackToTopButton';

export default function LinkItems() {
  return (
    <div className="grid  gap-x-12 gap-y-4 text-sm justify-items-center grid-cols-1 md:grid-cols-2">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/faq" className="hover:underline">
        FAQ
      </Link>
      <Link to="/about" className="hover:underline">
        About
      </Link>
      <Link to="/privacy" className="hover:underline">
        Privacy Policies
      </Link>
      <Link to="/contact" className="hover:underline">
        Contact
      </Link>
      <Link to="/auth/login" className="hover:underline">
        Login
      </Link>
      <div className="md:hidden">
        <BackToTopButton />
      </div>
    </div>
  );
}
