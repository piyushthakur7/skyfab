import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { 
  ArrowRight, Globe, Shield, Award, ChevronRight, Factory, Sparkles, Zap, Truck, Star, ShieldCheck, Mail, Phone, MapPin
} from 'lucide-react';
import { useCounter } from '../components/UI';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- Split Screen Hero ---
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

// --- Product Categories ---
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
export const VisionMission = () => (
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
export const Certifications = () => {
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
export const Facilities = () => (
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
export const Testimonials = () => {
  const [active, setActive] = React.useState(0);
  const testimonials = [
    { quote: "Skyfab transformed our sourcing process. Their network of artisan mills is unmatched, and the quality consistency is remarkable.", author: "Priya Mehta", role: "Head of Procurement, Textile Corp", rating: 5 },
    { quote: "Working with them feels like having a trusted partner in every major textile hub. Their logistics team handles everything seamlessly.", author: "James Chen", role: "CEO, Pacific Fabrics", rating: 5 },
    { quote: "The attention to ethical sourcing and quality assurance gives us complete confidence in every shipment we receive.", author: "Sarah Williams", role: "Sustainability Director, Nordic Wear", rating: 5 }
  ];
  React.useEffect(() => { const t = setInterval(() => setActive(p => (p + 1) % testimonials.length), 5000); return () => clearInterval(t); }, []);

  return (
    <section className="py-24 md:py-32 bg-paper relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="teal-line" /><span className="text-brand text-[10px] uppercase tracking-[0.3em] font-sans font-bold">Testimonials</span><div className="teal-line" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif mb-12">Trusted by <span className="italic font-light">Industry Leaders</span></h2>
        <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="flex justify-center gap-1 mb-6">{[...Array(testimonials[active].rating)].map((_, i) => <Star key={i} size={16} fill="#C9A96E" className="text-gold" />)}</div>
          <blockquote className="text-xl md:text-2xl font-serif italic text-ink/70 mb-8 leading-relaxed">"{testimonials[active].quote}"</blockquote>
          <div className="font-sans font-semibold text-sm">{testimonials[active].author}</div>
          <div className="text-ink/40 text-xs uppercase tracking-wider font-sans mt-1">{testimonials[active].role}</div>
        </motion.div>
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

const HomePage = () => (
  <>
    <SplitHero/>
    <AboutStrip/>
    <Stats/>
    <ProductCategories/>
    <VisionMission/>
    <Certifications/>
    <Facilities/>
    <Testimonials/>
  </>
);

export default HomePage;
