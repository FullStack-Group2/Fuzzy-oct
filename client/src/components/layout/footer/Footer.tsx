// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import { Link } from 'react-router-dom';
import { RiArrowUpDoubleLine } from 'react-icons/ri';
import { useAuth } from '@/stores/AuthProvider';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1E7A5A] text-white px-6 md:px-12 lg:px-20 py-12">
      <div className="w-full">
        {/* Top Section */}
        <div className="flex items-center  flex-col md:flex-row md:justify-between md:items-start space-y-10 md:space-y-0">
          {/* Left: Logo + Description + Back to top */}
          <div className="flex flex-col max-w-md space-y-6 items-center md:items-start">
            <h2 className="text-3xl font-extrabold">FUZZY</h2>
            <p className="text-gray-100 text-sm leading-relaxed text-center md:text-start">
              At Fuzzy, we make furniture shopping simple and stress-free by
              connecting you with trusted sellers and reliable shippers for
              every order.
            </p>
            <div className="hidden md:block">
              <BackToTopButton />
            </div>
          </div>
          {/* Right: Links */}
          <LinkItems />
        </div>

        {/* Divider */}
        <hr className="border-white/70 my-8" />

        {/* Bottom Section */}
        <p className="text-center text-sm">
          © 2025 Fuzzy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function LinkItems() {
  const { user } = useAuth();
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
      {!user ? (
        <Link to="/auth/login" className="hover:underline">
          Login
        </Link>
      ) : (
        <Link to="/auth/logout" className="hover:underline">
          Logout
        </Link>
      )}
      <div className="md:hidden">
        <BackToTopButton />
      </div>
    </div>
  );
}

function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="flex items-center space-x-2 border border-white px-4 py-2 hover:bg-white hover:text-[#1E7A5A] transition"
    >
      <RiArrowUpDoubleLine size={24} />
      <span className="text-sm font-medium">BACK TO TOP</span>
    </button>
  );
}
