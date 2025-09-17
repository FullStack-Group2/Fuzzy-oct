// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { MdOutlinePerson } from 'react-icons/md';

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-[32px]">
      <button onClick={() => setOpen(!open)}>
        <MdOutlinePerson className="size-8" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <Link
            to="/auth/logout"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
