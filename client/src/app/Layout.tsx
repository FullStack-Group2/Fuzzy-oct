import Footer from '@/components/layout/footer/Footer';
import Navbar from '@/components/layout/navbar/Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <section className="flex flex-col min-h-screen w-screen">
      {/* Navbar always visible */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content fills space */}
      <main className="w-screen">
        <Outlet />
      </main>

      {/* Footer only appears after content ends */}
      <Footer />
    </section>
  );
}
