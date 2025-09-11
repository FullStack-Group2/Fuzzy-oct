// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri,
// ID: 4010989,

import Footer from '@/components/layout/footer/Footer';
import Navbar from '@/components/layout/navbar/Navbar';
import { Outlet } from 'react-router-dom';
import AIChatbox from '@/features/AIChatbox/AIChatbox';
import ScrollToTop from '@/components/ScrollToTop';

export default function Layout() {
  return (
    <section className="flex flex-col min-h-screen w-full">
      {/* Navbar always visible */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content fills space */}
      <main className="flex-1 w-full min-h-0">
        <ScrollToTop />
        <Outlet />
        <AIChatbox />
      </main>

      {/* Footer only appears after content ends */}
      <footer className="mt-auto w-full">
        <Footer />
      </footer>
    </section>
  );
}
