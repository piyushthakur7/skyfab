import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Instagram, Linkedin, Mail, ShoppingBag, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Indian Wear', href: '/indian-wear' },
    { name: 'Export Fabrics', href: '/export-fabrics' },
    { name: 'Export Garments', href: '/export-garments' },
    { name: 'About Us', href: '/about' },
    { name: 'Facilities', href: '/facilities' },
    { name: 'Certifications', href: '/certifications' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 lg:px-10",
          isScrolled ? "bg-white/95 backdrop-blur-xl border-b border-ink/5 py-3" : "bg-transparent py-5"
        )}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex flex-col items-start text-decoration-none z-10">
            <span className={cn("text-2xl font-serif font-bold tracking-wide transition-colors",
              isScrolled ? "text-ink" : "text-ink"
            )}>
              SKY<span className="text-brand">FAB</span>
            </span>
            <span className={cn("text-[8px] tracking-[0.4em] font-sans font-semibold uppercase transition-colors",
              isScrolled ? "text-ink/40" : "text-ink/40"
            )}>Overseas Worldwide</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 6).map(link => (
              <Link key={link.name} to={link.href}
                className={cn("text-[11px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors hover:text-brand",
                  isScrolled ? "text-ink/70" : "text-ink/70"
                )}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart Icon */}
            <Link to="/cart" className={cn(
              "relative p-2.5 rounded-full transition-all border",
              isScrolled 
                ? "border-ink/10 text-ink hover:bg-gray-100" 
                : "border-ink/10 text-ink hover:bg-gray-100"
            )}>
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile Icon */}
            <Link to={isAuthenticated ? "/profile" : "/login"} className={cn(
              "p-2.5 rounded-full transition-all border",
              isScrolled 
                ? "border-ink/10 text-ink hover:bg-gray-100" 
                : "border-ink/10 text-ink hover:bg-gray-100"
            )}>
              <User size={18} />
            </Link>

            <Link to="/contact"
              className={cn("hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all border",
                isScrolled 
                  ? "border-ink/10 text-ink hover:bg-ink hover:text-paper" 
                  : "border-ink/10 text-ink hover:bg-ink hover:text-paper"
              )}>
              Contact Us
            </Link>
            <button onClick={() => setMenuOpen(true)}
              className={cn("menu-btn !w-12 !h-12 !text-[8px]",
                isScrolled ? "!bg-ink" : "!bg-ink"
              )}>
              MENU
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fullscreen-menu">
            <button onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-8 w-14 h-14 rounded-full border border-paper/20 flex items-center justify-center text-paper hover:bg-paper/10 transition-colors z-10">
              <X size={24} />
            </button>
            <div className="flex flex-col items-center gap-2">
              {navLinks.map((link, i) => (
                <motion.div key={link.name}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}>
                  <Link to={link.href} onClick={() => setMenuOpen(false)}
                    className="fullscreen-menu-link">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="absolute bottom-8 flex items-center gap-6">
              <a href="#" className="text-paper/30 hover:text-paper transition-colors"><Linkedin size={20}/></a>
              <a href="#" className="text-paper/30 hover:text-paper transition-colors"><Instagram size={20}/></a>
              <a href="mailto:chamundatrends1@gmail.com" className="text-paper/30 hover:text-paper transition-colors"><Mail size={20}/></a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
