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
                { icon: <Mail size={18}/>, label: 'Email', value: 'chamundatrends1@gmail.com' },
                { icon: <Phone size={18}/>, label: 'Nikunj Gabani', value: '+91 99098 96888' },
                { icon: <Phone size={18}/>, label: 'Jaydeep Gabani', value: '+91 99793 96888' },
                { icon: <MapPin size={18}/>, label: 'Location', value: 'House No 38, Aavishkar Texpa, Saroli Kadodara Road, 394325' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full border border-paper/10 flex items-center justify-center text-brand group-hover:border-brand/40 group-hover:bg-brand/10 transition-all">{item.icon}</div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-paper/30 font-sans font-bold">{item.label}</div>
                    <div className="text-sm group-hover:text-brand transition-colors font-sans">{item.value}</div>
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
