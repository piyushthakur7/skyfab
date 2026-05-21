import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { VisionMission, Facilities as FacilitiesSection, Certifications as CertificationsSection, Testimonials } from './HomePage';

export const Contact = () => (
  <section className="py-24 md:py-32 bg-ink text-paper relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[150px]" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="bg-paper/[0.04] rounded-3xl p-8 md:p-16 border border-paper/10 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[1px] bg-brand" />
              <span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Get in Touch</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif mb-8">Start a<br/><span className="italic font-light">Partnership</span></h2>
            <div className="space-y-6">
              {[
                { icon: <Mail size={18}/>, label: 'Email', value: 'chamundatrends1@gmail.com', href: 'mailto:chamundatrends1@gmail.com' },
                { icon: <Phone size={18}/>, label: 'Nikunj Gabani', value: '+91 99098 96888', href: 'tel:+919909896888', whatsapp: 'https://wa.me/919909896888?text=Hello%20Nikunj%2C%20I%20would%20like%20to%20inquire%20about%20Skyfab.' },
                { icon: <Phone size={18}/>, label: 'Jaydeep Gabani', value: '+91 99793 96888', href: 'tel:+919979396888' },
                { icon: <MapPin size={18}/>, label: 'Location', value: 'House No 38, Aavishkar Texpa, Saroli Kadodara Road, 394325', href: 'https://maps.google.com/?q=House+No+38,+Aavishkar+Texpa,+Saroli+Kadodara+Road,+394325' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="w-10 h-10 rounded-full border border-paper/10 flex items-center justify-center text-brand hover:border-brand/40 hover:bg-brand/10 transition-all cursor-pointer">
                    {item.icon}
                  </a>
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-paper/30 font-sans font-bold">{item.label}</div>
                      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-sm hover:text-brand transition-colors font-sans cursor-pointer">{item.value}</a>
                    </div>
                    {item.whatsapp && (
                      <a 
                        href={item.whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] transition-all font-sans text-xs font-bold uppercase tracking-wider shadow-lg shadow-green-500/10 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.639zM6.604 18.966c1.696.993 3.32 1.488 5.395 1.49 5.33.003 9.68-4.321 9.684-9.629.002-2.571-1.002-4.98-2.83-6.797C16.984 4.226 14.58 3.22 12.015 3.22 6.69 3.22 2.34 7.541 2.336 12.852c-.001 2.106.549 3.659 1.584 5.343l-.991 3.625 3.675-.954zm12.39-4.814c-.313-.156-1.854-.915-2.133-1.017-.279-.101-.482-.152-.684.152-.202.304-.78.982-.957 1.185-.177.203-.355.228-.668.072-1.293-.65-2.158-1.122-2.997-2.56-.222-.38.222-.353.636-1.178.114-.228.057-.428-.028-.58-.085-.152-.684-1.649-.938-2.259-.247-.597-.5-.515-.684-.525-.177-.009-.38-.011-.582-.011-.202 0-.532.076-.811.38-.279.304-1.065 1.039-1.065 2.532s1.09 2.939 1.242 3.141c.152.202 2.144 3.273 5.195 4.59.726.313 1.291.5 1.731.64.73.232 1.393.197 1.917.12.584-.085 1.854-.757 2.115-1.45.261-.692.261-1.287.183-1.411-.078-.124-.279-.2-.591-.356z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-paper/30">Full Name</label>
                <input type="text" className="w-full bg-transparent border-b border-paper/10 py-3 focus:border-brand outline-none text-paper placeholder:text-paper/20 font-sans" placeholder="John Doe" /></div>
              <div><label className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-paper/30">Company</label>
                <input type="text" className="w-full bg-transparent border-b border-paper/10 py-3 focus:border-brand outline-none text-paper placeholder:text-paper/20 font-sans" placeholder="Textile Corp" /></div>
            </div>
            <div><label className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-paper/30">Email</label>
              <input type="email" className="w-full bg-transparent border-b border-paper/10 py-3 focus:border-brand outline-none text-paper placeholder:text-paper/20 font-sans" placeholder="john@company.com" /></div>
            <div><label className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-paper/30">Inquiry Type</label>
              <select className="w-full bg-transparent border-b border-paper/10 py-3 focus:border-brand outline-none text-paper font-sans appearance-none">
                <option className="bg-ink">Indian Wear Inquiry</option><option className="bg-ink">Export Fabric Inquiry</option>
                <option className="bg-ink">Export Garment Inquiry</option><option className="bg-ink">Custom Sourcing</option>
              </select></div>
            <div><label className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-paper/30">Message</label>
              <textarea rows={3} className="w-full bg-transparent border-b border-paper/10 py-3 focus:border-brand outline-none resize-none text-paper placeholder:text-paper/20 font-sans" placeholder="Tell us about your requirements..." /></div>
            <button className="w-full bg-brand text-paper py-4 rounded-full text-[11px] uppercase tracking-[0.2em] font-sans font-bold hover:bg-brand-light transition-all">
              Send Inquiry <ArrowRight size={14} className="inline ml-2" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  </section>
);

export const AboutPage = () => (<div className="pt-20"><VisionMission/><FacilitiesSection/><CertificationsSection/><Testimonials/></div>);
export const FacilitiesPage = () => (<div className="pt-20"><FacilitiesSection/><CertificationsSection/></div>);
export const CertificationsPage = () => (<div className="pt-20"><CertificationsSection/></div>);
export const ContactPage = () => (<div className="pt-20"><Contact/></div>);
