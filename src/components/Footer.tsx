import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const Footer = () => (
  <footer className="bg-ink text-paper">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <Link to="/" className="flex flex-col mb-6">
            <span className="text-2xl font-serif font-bold text-paper">SKY<span className="text-brand">FAB</span></span>
            <span className="text-[8px] tracking-[0.4em] font-sans text-paper/30 uppercase">Overseas Worldwide</span>
          </Link>
          <p className="text-paper/40 text-sm font-sans leading-relaxed mb-6">
            Crafting textile excellence since 2006. From our hub in Surat to fashion markets globally.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-paper/30 hover:text-brand transition-colors"><Instagram size={18}/></a>
            <a href="#" className="text-paper/30 hover:text-brand transition-colors"><Linkedin size={18}/></a>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-brand mb-6">Products</h4>
          <ul className="space-y-3">
            {['Indian Wear', 'Export Fabrics', 'Export Garments'].map(l => (
              <li key={l}><Link to={`/${l.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-paper/50 hover:text-paper font-sans transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-brand mb-6">Company</h4>
          <ul className="space-y-3">
            {[['About Us','/about'],['Facilities','/facilities'],['Certifications','/certifications'],['Contact','/contact']].map(([l,h]) => (
              <li key={l}><Link to={h} className="text-sm text-paper/50 hover:text-paper font-sans transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-brand mb-6">Contact</h4>
          <div className="space-y-3 text-sm text-paper/50 font-sans">
            <p>chamundatrends1@gmail.com</p>
            <p>+91 99098 96888</p>
            <p>Saroli Kadodara Road, Surat 394325</p>
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom-bar">
      <span className="font-sans text-[10px] tracking-wider">Skyfab Overseas © {new Date().getFullYear()} All rights reserved</span>
      <a href="https://webtotalsolution.com" target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] tracking-wider text-paper/70 hover:text-paper transition-colors">
        Developed by Web Total Solution
      </a>
    </div>
  </footer>
);

export default Footer;
