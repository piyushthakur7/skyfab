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
            <p><a href="mailto:chamundatrends1@gmail.com" className="hover:text-paper transition-colors">chamundatrends1@gmail.com</a></p>
            <p className="flex items-center gap-2">
              <a href="tel:+919909896888" className="hover:text-paper transition-colors">+91 99098 96888</a>
              <a href="https://wa.me/919909896888?text=Hello%20Skyfab%2C%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:text-white transition-colors" title="Chat on WhatsApp">
                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.639zM6.604 18.966c1.696.993 3.32 1.488 5.395 1.49 5.33.003 9.68-4.321 9.684-9.629.002-2.571-1.002-4.98-2.83-6.797C16.984 4.226 14.58 3.22 12.015 3.22 6.69 3.22 2.34 7.541 2.336 12.852c-.001 2.106.549 3.659 1.584 5.343l-.991 3.625 3.675-.954zm12.39-4.814c-.313-.156-1.854-.915-2.133-1.017-.279-.101-.482-.152-.684.152-.202.304-.78.982-.957 1.185-.177.203-.355.228-.668.072-1.293-.65-2.158-1.122-2.997-2.56-.222-.38.222-.353.636-1.178.114-.228.057-.428-.028-.58-.085-.152-.684-1.649-.938-2.259-.247-.597-.5-.515-.684-.525-.177-.009-.38-.011-.582-.011-.202 0-.532.076-.811.38-.279.304-1.065 1.039-1.065 2.532s1.09 2.939 1.242 3.141c.152.202 2.144 3.273 5.195 4.59.726.313 1.291.5 1.731.64.73.232 1.393.197 1.917.12.584-.085 1.854-.757 2.115-1.45.261-.692.261-1.287.183-1.411-.078-.124-.279-.2-.591-.356z" />
                </svg>
              </a>
            </p>
            <p className="flex items-center gap-2">
              <a href="tel:+919924896888" className="hover:text-paper transition-colors">+91 99248 96888</a>
              <a href="https://wa.me/919924896888?text=Hello%20Skyfab%2C%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:text-white transition-colors" title="Chat on WhatsApp">
                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.639zM6.604 18.966c1.696.993 3.32 1.488 5.395 1.49 5.33.003 9.68-4.321 9.684-9.629.002-2.571-1.002-4.98-2.83-6.797C16.984 4.226 14.58 3.22 12.015 3.22 6.69 3.22 2.34 7.541 2.336 12.852c-.001 2.106.549 3.659 1.584 5.343l-.991 3.625 3.675-.954zm12.39-4.814c-.313-.156-1.854-.915-2.133-1.017-.279-.101-.482-.152-.684.152-.202.304-.78.982-.957 1.185-.177.203-.355.228-.668.072-1.293-.65-2.158-1.122-2.997-2.56-.222-.38.222-.353.636-1.178.114-.228.057-.428-.028-.58-.085-.152-.684-1.649-.938-2.259-.247-.597-.5-.515-.684-.525-.177-.009-.38-.011-.582-.011-.202 0-.532.076-.811.38-.279.304-1.065 1.039-1.065 2.532s1.09 2.939 1.242 3.141c.152.202 2.144 3.273 5.195 4.59.726.313 1.291.5 1.731.64.73.232 1.393.197 1.917.12.584-.085 1.854-.757 2.115-1.45.261-.692.261-1.287.183-1.411-.078-.124-.279-.2-.591-.356z" />
                </svg>
              </a>
            </p>
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
