// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import { RiArrowUpDoubleLine } from 'react-icons/ri';

export default function BackToTopButton() {
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
