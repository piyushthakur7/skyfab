import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import { 
  Globe, Menu, X, ArrowRight, Instagram, Linkedin, Mail, Phone,
  MapPin, ChevronRight, Sparkles, ArrowUpRight, Play, Zap, Check,
  Award, Shield, Factory, Truck, Star, ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function useCounter(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// --- Preloader ---
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => { const t = setTimeout(onComplete, 2800); return () => clearTimeout(t); }, [onComplete]);
  return (
    <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <div className="preloader-logo flex flex-col items-center">
        <span className="text-4xl font-serif font-bold tracking-wider text-paper">SKYFAB</span>
        <span className="text-[9px] tracking-[0.5em] text-paper/40 font-sans mt-2 uppercase">Overseas Worldwide</span>
      </div>
      <div className="preloader-bar"><div className="preloader-bar-fill" /></div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
        className="text-paper/30 text-[10px] uppercase tracking-[0.4em] font-sans">
        Indian Wear • Export Fabrics • Export Garments
      </motion.p>
    </motion.div>
  );
};

// --- Navbar (Orbit Style) ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
              isScrolled ? "text-ink" : "text-paper"
            )}>
              SKY<span className="text-brand">FAB</span>
            </span>
            <span className={cn("text-[8px] tracking-[0.4em] font-sans font-semibold uppercase transition-colors",
              isScrolled ? "text-ink/40" : "text-paper/50"
            )}>Overseas Worldwide</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 6).map(link => (
              <Link key={link.name} to={link.href}
                className={cn("text-[11px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors hover:text-brand",
                  isScrolled ? "text-ink/70" : "text-paper/80"
                )}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/contact"
              className={cn("hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all border",
                isScrolled 
                  ? "border-ink/10 text-ink hover:bg-ink hover:text-paper" 
                  : "border-paper/30 text-paper hover:bg-paper hover:text-ink"
              )}>
              Contact Us
            </Link>
            <button onClick={() => setMenuOpen(true)}
              className={cn("menu-btn !w-12 !h-12 !text-[8px]",
                isScrolled ? "!bg-ink" : "!bg-paper/10 !backdrop-blur-sm !border !border-paper/20"
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

// --- Split Screen Hero (Orbit Style) ---
const SplitHero = () => {
  const panels = [
    { title: 'INDIAN', subtitle: 'Wear', image: '/images/indian-wear.png', link: '/indian-wear' },
    { title: 'EXPORT', subtitle: 'Fabrics', image: '/images/export-fabric.png', link: '/export-fabrics' },
    { title: 'EXPORT', subtitle: 'Garments', image: '/images/export-garment.png', link: '/export-garments' },
  ];

  return (
    <section className="split-hero">
      {panels.map((panel, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="split-hero-divider" style={{ left: `${(i / 3) * 100}%` }} />}
          <Link to={panel.link} className="split-hero-panel group block">
            <img src={panel.image} alt={`${panel.title} ${panel.subtitle}`} />
            <div className="split-hero-overlay">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}>
                <h2 className="text-paper text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-none mb-2">
                  {panel.title}
                </h2>
                <h3 className="text-paper/80 text-3xl md:text-5xl lg:text-6xl font-serif italic font-light">
                  {panel.subtitle}
                </h3>
              </motion.div>
              <div className="split-hero-cta mt-8">
                <span className="inline-flex items-center gap-2 text-paper/70 text-[11px] font-sans uppercase tracking-[0.3em] font-semibold border border-paper/30 px-6 py-3 rounded-full hover:bg-paper/10 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        </React.Fragment>
      ))}
      {/* Logo overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none hidden lg:block">
        <div className="bg-ink/60 backdrop-blur-lg rounded-full w-32 h-32 flex flex-col items-center justify-center border border-paper/10">
          <span className="text-paper text-lg font-serif font-bold">SKYFAB</span>
          <span className="text-paper/40 text-[6px] tracking-[0.3em] uppercase font-sans">Est. 2006</span>
        </div>
      </div>
    </section>
  );
};

// --- About Strip ---
const AboutStrip = () => (
  <section className="py-20 md:py-28 bg-paper relative">
    <div className="max-w-5xl mx-auto px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="text-lg md:text-2xl text-ink/60 leading-relaxed font-serif italic">
          Since its establishment in 2006, <span className="text-ink font-semibold not-italic">Skyfab Overseas Worldwide</span> has 
          evolved into one of India's leading exporters of Indian Wear, Fashion Fabrics, and Export-Ready Garments. 
          Our remarkable success is evident through our expansive global presence across the USA, Middle East, Africa, Europe, and South-East Asia.
        </p>
        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="teal-line" />
          <Link to="/about" className="text-brand text-[11px] uppercase tracking-[0.2em] font-sans font-bold hover:text-ink transition-colors flex items-center gap-2">
            Our Story <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- Stats ---
const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const stats = [
    { label: 'Countries Served', value: 45, suffix: '+' },
    { label: 'Annual Production', value: 12, suffix: 'k Mtrs' },
    { label: 'Artisan Partners', value: 200, suffix: '+' },
    { label: 'Years Legacy', value: 20, suffix: '+' },
  ];

  return (
    <section ref={ref} className="py-20 bg-ink text-paper relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[120px]" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const count = useCounter(stat.value, 2000, isInView);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="text-center py-6">
                <div className="text-4xl md:text-5xl font-serif mb-2">{count}{stat.suffix}</div>
                <div className="w-8 h-[1px] bg-brand mx-auto mb-3" />
                <div className="text-[10px] uppercase tracking-[0.2em] text-paper/40 font-sans font-semibold">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- Product Categories (Orbit Style Cards) ---
const ProductCategories = () => {
  const categories = [
    {
      title: 'Indian Wear',
      desc: 'Premium ethnic wear including Sarees, Lehengas, Kurtas, Salwar Kameez, and traditional Indian garments crafted with exquisite attention to detail.',
      image: '/images/indian-wear.png',
      link: '/indian-wear',
      items: ['Sarees', 'Lehengas', 'Kurtas', 'Salwar Kameez', 'Dupattas', 'Sherwanis']
    },
    {
      title: 'Export Fabrics',
      desc: 'World-class fabric material for international markets — Cotton, Silk, Polyester, Viscose, Jacquard, and specialty woven & printed fabrics.',
      image: '/images/export-fabric.png',
      link: '/export-fabrics',
      items: ['Cotton & Organic', 'Pure Silk', 'Viscose & Rayon', 'Polyester', 'Jacquard', 'Printed Fabrics']
    },
    {
      title: 'Export Garments',
      desc: 'Ready-to-wear excellence for global retailers — Kaftans, Hijabs, Western Wear, Formal Attire, and contemporary fashion garments.',
      image: '/images/export-garment.png',
      link: '/export-garments',
      items: ['Kaftans', 'Hijab & Scarves', 'Western Wear', 'Formal Wear', 'Maxy Gowns', 'Casual Fashion']
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-beige/50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="teal-line" /><span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Our Divisions</span><div className="teal-line" style={{ transform: 'scaleX(-1)' }} />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif">
            What We <span className="italic font-light">Offer</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.15 }}>
              <Link to={cat.link} className="category-card block group h-full">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl md:text-4xl font-serif text-paper mb-2">{cat.title}</h3>
                    <div className="flex items-center gap-2 text-paper/60 text-[11px] uppercase tracking-[0.2em] font-sans font-semibold group-hover:text-brand-light transition-colors">
                      Click To Explore <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-b-2xl border border-t-0 border-ink/5">
                  <p className="text-ink/60 text-sm mb-4 font-sans">{cat.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, i) => (
                      <span key={i} className="text-[9px] uppercase tracking-wider font-sans font-semibold text-ink/40 border border-ink/10 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Vision & Mission ---
const VisionMission = () => (
  <section className="py-24 md:py-32 bg-paper relative overflow-hidden grain-overlay">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="teal-line" />
            <span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Our Vision & Mission</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif mb-8">
            Best Quality Through<br/><span className="italic font-light">Continuous Innovation</span>
          </h2>
          <p className="text-ink/60 text-lg leading-relaxed mb-8 font-sans">
            At Skyfab Overseas, our method of achieving industry-leading quality starts with deep process 
            understanding and disciplined improvement at every stage — from sourcing raw materials to the final 
            garment reaching your customer.
          </p>
          <blockquote className="border-l-2 border-brand pl-6 text-ink/50 italic font-serif text-xl leading-relaxed">
            "We believe that the textile industry thrives when heritage craftsmanship meets global excellence."
          </blockquote>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="grid grid-cols-1 gap-6">
          {[
            { icon: <Globe size={24} />, title: 'Our Vision', desc: 'To be a global leader in textile exports, connecting the rich craft traditions of India with fashion markets worldwide.' },
            { icon: <Shield size={24} />, title: 'Our Mission', desc: 'Deliver exceptional quality, maintain ethical sourcing standards, and provide end-to-end solutions from loom to global latitude.' },
            { icon: <Award size={24} />, title: 'Our Values', desc: 'Integrity, innovation, sustainability, and unwavering commitment to customer satisfaction drive every decision we make.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="bg-white p-8 rounded-2xl border border-ink/5 hover:border-brand/20 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand/5 flex items-center justify-center text-brand mb-4 group-hover:bg-brand group-hover:text-paper transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif mb-2">{item.title}</h3>
              <p className="text-ink/50 text-sm font-sans">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

// --- Certifications ---
const Certifications = () => {
  const certs = ['ISO 9001:2015', 'GOTS Certified', 'Oeko-Tex Standard', 'BCI Member', 'SEDEX Approved', 'SA 8000'];
  return (
    <section className="py-20 bg-beige/30">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="teal-line" /><span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Quality Assurance</span><div className="teal-line" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif mb-12">Our <span className="italic font-light">Certifications</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {certs.map((cert, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="cert-item flex-col gap-2">
              <ShieldCheck size={28} className="text-brand" />
              <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/60">{cert}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Facilities ---
const Facilities = () => (
  <section className="py-24 md:py-32 bg-ink text-paper relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[200px]" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="w-12 h-[1px] bg-brand" /><span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Infrastructure</span><div className="w-12 h-[1px] bg-brand" />
        </div>
        <h2 className="text-4xl md:text-6xl font-serif">State-of-the-Art <span className="italic font-light text-brand-light">Facilities</span></h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Factory size={28}/>, title: 'Weaving Unit', desc: '200+ advanced looms for cotton, silk, polyester, and blended fabrics.' },
          { icon: <Sparkles size={28}/>, title: 'Processing Plant', desc: 'Full-range dyeing, printing, embroidery, and finishing capabilities.' },
          { icon: <Zap size={28}/>, title: 'Garment Unit', desc: 'Dedicated cutting, stitching, and quality control for export garments.' },
          { icon: <Truck size={28}/>, title: 'Logistics Hub', desc: 'In-house packing, warehousing, and direct port shipping operations.' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-paper/[0.04] border border-paper/10 rounded-2xl p-8 hover:bg-paper/[0.08] hover:border-brand/30 transition-all group">
            <div className="text-brand mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-xl font-serif mb-2">{item.title}</h3>
            <p className="text-paper/40 text-sm font-sans">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- Testimonials ---
const Testimonials = () => {
  const [active, setActive] = useState(0);
  const testimonials = [
    { quote: "Skyfab transformed our sourcing process. Their network of artisan mills is unmatched, and the quality consistency is remarkable.", author: "Priya Mehta", role: "Head of Procurement, Textile Corp", rating: 5 },
    { quote: "Working with them feels like having a trusted partner in every major textile hub. Their logistics team handles everything seamlessly.", author: "James Chen", role: "CEO, Pacific Fabrics", rating: 5 },
    { quote: "The attention to ethical sourcing and quality assurance gives us complete confidence in every shipment we receive.", author: "Sarah Williams", role: "Sustainability Director, Nordic Wear", rating: 5 }
  ];
  useEffect(() => { const t = setInterval(() => setActive(p => (p + 1) % testimonials.length), 5000); return () => clearInterval(t); }, []);

  return (
    <section className="py-24 md:py-32 bg-paper relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="teal-line" /><span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Testimonials</span><div className="teal-line" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif mb-12">Trusted by <span className="italic font-light">Industry Leaders</span></h2>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex justify-center gap-1 mb-6">{[...Array(testimonials[active].rating)].map((_, i) => <Star key={i} size={16} fill="#C9A96E" className="text-gold" />)}</div>
            <blockquote className="text-xl md:text-2xl font-serif italic text-ink/70 mb-8 leading-relaxed">"{testimonials[active].quote}"</blockquote>
            <div className="font-sans font-semibold text-sm">{testimonials[active].author}</div>
            <div className="text-ink/40 text-xs uppercase tracking-wider font-sans mt-1">{testimonials[active].role}</div>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={cn("w-2 h-2 rounded-full transition-all", i === active ? "bg-brand w-6" : "bg-ink/15 hover:bg-ink/30")} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Contact ---
const Contact = () => (
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

// --- Footer (Navy + Teal Bottom Bar) ---
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

// --- Pages ---
const HomePage = () => (<><SplitHero/><AboutStrip/><Stats/><ProductCategories/><VisionMission/><Certifications/><Facilities/><Testimonials/></>);

const CategoryPage = ({ title, desc, items, image }: { title: string; desc: string; items: string[]; image: string }) => (
  <div className="pt-20">
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden flex items-center">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-paper mb-4">{title}</h1>
        <p className="text-paper/60 text-lg font-sans max-w-2xl mx-auto">{desc}</p>
      </div>
    </section>
    <section className="py-20 bg-paper">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-white p-8 rounded-2xl border border-ink/5 hover:border-brand/20 hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand mb-4 group-hover:bg-brand group-hover:text-paper transition-all">
                <Check size={20} />
              </div>
              <h3 className="text-lg font-serif mb-1">{item}</h3>
              <p className="text-ink/40 text-sm font-sans">Premium quality, export-ready</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

const IndianWearPage = () => <CategoryPage title="Indian Wear" desc="Exquisite ethnic wear crafted from India's finest textiles." image="/images/indian-wear.png"
  items={['Sarees', 'Lehengas', 'Kurtas & Kurtis', 'Salwar Kameez', 'Dupattas & Stoles', 'Sherwanis', 'Palazzo Sets', 'Anarkali Suits', 'Bridal Wear', 'Chaniya Choli', 'Dhoti Kurta', 'Nehru Jackets']} />;
const ExportFabricsPage = () => <CategoryPage title="Export Fabric Material" desc="World-class fabrics for international fashion houses and retailers." image="/images/export-fabric.png"
  items={['Cotton & Organic', 'Pure Silk', 'Viscose & Rayon', 'Polyester', 'Nylon & Technical', 'Jacquard Weaves', 'Embroidered Fabrics', 'Printed Fabrics', 'Linen Blends', 'Knitted Fabrics', 'Lycra & Stretch', 'Curtain Fabrics']} />;
const ExportGarmentsPage = () => <CategoryPage title="Export Garments" desc="Ready-to-wear excellence for global shoppers and retailers." image="/images/export-garment.png"
  items={['Signature Kaftans', 'Hijab & Scarves', 'Western Casual', 'Formal Wear', 'Maxy Gowns', 'Business Attire', 'Active Wear', 'Burakha Collection', 'Kids Garment', 'Loungewear', 'Denim Collection', 'Uniform Programs']} />;
const AboutPage = () => (<div className="pt-20"><VisionMission/><Facilities/><Certifications/><Testimonials/></div>);
const FacilitiesPage = () => (<div className="pt-20"><Facilities/><Certifications/></div>);
const CertificationsPage = () => (<div className="pt-20"><Certifications/></div>);
const ContactPage = () => (<div className="pt-20"><Contact/></div>);

// --- Main App ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence>{isLoading && <Preloader onComplete={() => setIsLoading(false)} />}</AnimatePresence>
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
