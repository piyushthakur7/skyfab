import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ScrollToTop, Preloader } from './components/UI';

// Pages
import HomePage from './pages/HomePage';
import { IndianWearPage, ExportFabricsPage, ExportGarmentsPage } from './pages/CategoryPage';
import { AboutPage, FacilitiesPage, CertificationsPage, ContactPage } from './pages/StaticPages';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      <div className="min-h-screen relative">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/indian-wear" element={<IndianWearPage />} />
            <Route path="/export-fabrics" element={<ExportFabricsPage />} />
            <Route path="/export-garments" element={<ExportGarmentsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <div className="vignette" />
        <Footer />
      </div>
    </Router>
  );
}
