import Footer from '@/components/layout/footer/Footer';
import Navbar from '@/components/layout/navbar/Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar always visible */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content fills space */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer only appears after content ends */}
      <Footer />
    </div>
  );
}
