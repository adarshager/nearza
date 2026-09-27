/**
 * Nearza — Main Layout
 * Responsive layout container integrating Navbar, Footer, and Mobile Bottom Navigation.
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BottomNav } from '../components/layout/BottomNav';
import { LocationSelectorModal } from '../components/location/LocationSelectorModal';
import { useLocation } from '../contexts/LocationContext';

export default function MainLayout() {
  const { isLocationModalOpen, closeLocationModal } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-800">
      {/* Global Top Navbar */}
      <Navbar />

      {/* Main Content Area with smooth transition */}
      <main className="flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Global Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />

      {/* Global Desktop & Tablet Footer */}
      <Footer />

      {/* Persistent Mobile Bottom Navigation Dock */}
      <BottomNav />
    </div>
  );
}
