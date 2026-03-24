import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'motion/react';
import { 
  Globe, 
  Truck, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone,
  MapPin,
  ChevronRight,
  Search,
  ShoppingBag,
  Star,
  Sparkles,
  ArrowUpRight,
  Play,
  Zap,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProducts, getCategories, type WCProduct } from './services/woocommerce';


// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Scroll To Top Utility ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Animated Counter Hook ---
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
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="preloader"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="preloader-logo flex flex-col items-center">
        <span className="text-4xl font-bold tracking-[0.2em] text-brand">SKYFAB</span>
        <span className="text-[8px] tracking-[0.6em] text-brand-light font-sans mt-2">OVERSEAS WORLDWIDE</span>
      </div>
      <div className="preloader-bar">
        <div className="preloader-bar-fill" />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-paper/40 text-[10px] uppercase tracking-[0.5em] font-sans"
      >
        Global Textile Excellence
      </motion.p>
    </motion.div>
  );
};

// --- Magnetic Button Hook ---
function useMagnetic(ref: React.RefObject<HTMLElement | null>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const calculateDistance = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        if (Math.abs(distanceX) < 100 && Math.abs(distanceY) < 100) {
          x.set(distanceX * 0.4);
          y.set(distanceY * 0.4);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };
    window.addEventListener('mousemove', calculateDistance);
    return () => window.removeEventListener('mousemove', calculateDistance);
  }, [ref, x, y]);

  return { x: springX, y: springY };
}

// --- Custom Hooks for WooCommerce ---
function useWooCommerce() {
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ per_page: 8, status: 'publish' }),
          getCategories()
        ]);
        
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        }
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load data from WooCommerce');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { products, categories, loading, error };
}


// --- Cursor Follower ---
const CursorFollower = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 100, damping: 30 });
  const springY = useSpring(cursorY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <>
      <motion.div
        className="fixed w-4 h-4 bg-brand rounded-full pointer-events-none z-[100] mix-blend-difference hidden lg:block"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        className="fixed w-64 h-64 rounded-full pointer-events-none z-0 hidden lg:block opacity-50"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(0,128,128,0.1) 0%, transparent 70%)',
        }}
      />
    </>
  );
};

// --- Navbar ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/collections' },
    { name: 'Divisions', href: '/#divisions' },
    { name: 'Processes', href: '/processes' },
    { name: 'Specialties', href: '/services' },
    { name: 'Heritage', href: '/about' },
    { name: 'Inquiry', href: '/contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 lg:px-12",
        isScrolled 
          ? "bg-white border-b border-black/10 py-4 shadow-sm" 
          : "bg-white/90 backdrop-blur-md border-b border-black/5 py-6"
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <a href="/" className="flex flex-col items-start group text-decoration-none">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-ink">
                SKY<span className="text-gold">FAB</span>
              </span>
            </div>
            <span className="text-[10px] tracking-widest font-bold text-ink/40 uppercase">Overseas Worldwide</span>
          </a>
          
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href}
                className="text-sm font-semibold text-ink/70 hover:text-gold transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <button className="text-ink/60 hover:text-gold transition-colors">
              <Search size={20} />
            </button>
            <a 
              href={`${import.meta.env.VITE_WC_URL || '#'}/cart`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink/60 hover:text-gold transition-colors relative"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
            </a>
          </div>

          <button 
            className="lg:hidden p-2 text-ink"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-brand transition-colors"
          >
            Inquiry
            <ArrowUpRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-paper/95 backdrop-blur-3xl border-b border-ink/5 overflow-hidden lg:hidden"
          >
            <div className="p-10 flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div key={link.name}>
                  <Link 
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-sans text-ink border-b border-ink/5 pb-6 flex justify-between items-center group"
                  >
                    {link.name}
                    <ArrowRight size={24} className="text-gold opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// --- Floating Threads (Decorative) ---
const FloatingThreads = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "absolute w-px bg-gradient-to-b from-brand/20 via-brand/5 to-transparent",
          i === 0 && "left-[10%] top-[20%] h-32 animate-float",
          i === 1 && "left-[30%] top-[60%] h-24 animate-float-delayed",
          i === 2 && "right-[20%] top-[30%] h-40 animate-float-slow",
          i === 3 && "right-[40%] top-[70%] h-20 animate-float",
          i === 4 && "left-[60%] top-[40%] h-28 animate-float-delayed",
        )}
      />
    ))}
  </div>
);

// --- Digital Loom Decoration ---
const DigitalLoom = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
    <div className="absolute inset-0" style={{ 
      backgroundImage: `linear-gradient(to right, rgba(0,128,128,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,128,128,0.05) 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />
    <motion.div 
      animate={{ 
        y: [0, 40],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent h-20"
      style={{ backgroundSize: '100% 400%' }}
    />
  </div>
);

// --- Hero ---
const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-screen min-h-[800px] flex items-center overflow-hidden bg-white">
      {/* Background with clean aesthetic */}
      <motion.div className="absolute inset-0 z-0" style={{ y, scale, opacity }}>
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2600" 
          alt="Modern Textile"
          className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.1]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-1 bg-gold rounded-full" />
              <span className="text-gold font-bold uppercase tracking-widest text-xs">
                Since 2006 • Surat, India
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl text-ink leading-tight mb-8 font-extrabold tracking-tight">
              Premium <br />
              <span className="text-gold">Textiles</span>
            </h1>

            <p className="text-xl md:text-2xl text-ink/70 leading-relaxed mb-12 max-w-2xl font-medium">
              We redefine global supply chains through artisanal heritage and technological precision, connecting master weavers to the world's finest fashion houses.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-16 px-10 bg-ink text-white rounded-xl text-base font-bold shadow-lg hover:bg-brand transition-colors"
              >
                View Collections
              </motion.button>
              <button className="flex items-center gap-3 text-ink/60 hover:text-ink transition-colors group">
                <div className="w-12 h-12 rounded-full border-2 border-ink/10 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Play Film</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Marquee Ticker ---
const MarqueeTicker = () => {
  const items = ['Raw Silk', 'Egyptian Cotton', 'Merino Wool', 'Linen', 'Cashmere', 'Bamboo Fiber', 'Organic Hemp', 'Mulberry Silk'];
  
  return (
    <div className="py-6 bg-ink overflow-hidden border-y border-paper/5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center">
            <span className="text-paper/30 text-sm md:text-base uppercase tracking-[0.3em] font-light mx-8 md:mx-12">
              {item}
            </span>
            <Sparkles size={10} className="text-gold/40" />
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Stats ---
const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { label: 'Countries Served', value: 45, suffix: '+' },
    { label: 'Annual Tonnage', value: 12, suffix: 'k' },
    { label: 'Artisan Partners', value: 200, suffix: '+' },
    { label: 'Years of Experience', value: 20, suffix: '+' },
  ];

  return (
    <section ref={ref} className="py-24 bg-ink text-paper relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, idx) => {
            const count = useCounter(stat.value, 2000, isInView);
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="text-center group cursor-pointer p-8 rounded-3xl hover:bg-white/5 transition-colors duration-500"
              >
                <div className="text-5xl md:text-6xl font-sans mb-3 tabular-nums group-hover:text-brand transition-colors duration-300">
                  {count}{stat.suffix}
                </div>
                <div className="golden-line mx-auto mb-4 group-hover:w-24 transition-all duration-500" />
                <div className="text-[9px] uppercase tracking-[0.3em] text-paper/40 font-bold group-hover:text-paper transition-colors delay-100">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- Collections ---
const Collections = () => {
  const { products, loading } = useWooCommerce();

  // Fallback items if WooCommerce is not connected or loading
  const fallbackItems = [
    {
      title: "Raw Silk",
      origin: "Varanasi, India",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=800",
      category: "Premium",
      desc: "Hand-spun silk from master artisans",
      link: "#"
    },
    {
      title: "Egyptian Cotton",
      origin: "Giza, Egypt",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800",
      category: "Industrial",
      desc: "The world's finest long-staple cotton",
      link: "#"
    },
    {
      title: "Merino Wool",
      origin: "Tasmania, Australia",
      image: "https://images.unsplash.com/photo-1520004434532-668416a08753?auto=format&fit=crop&q=80&w=800",
      category: "Luxury",
      desc: "Ultra-fine micron wool for premium garments",
      link: "#"
    },
    {
      title: "Linen Blends",
      origin: "Normandy, France",
      image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&q=80&w=800",
      category: "Sustainable",
      desc: "Eco-conscious blends from heritage mills",
      link: "#"
    }
  ];

  const displayItems = products.length > 0 
    ? products.map(p => ({
        id: p.id,
        title: p.name,
        origin: p.categories[0]?.name || 'Skyfab Original',
        image: p.images[0]?.src || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        category: p.type.toUpperCase(),
        desc: p.short_description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
        link: p.permalink
      }))
    : fallbackItems;

  return (
    <section id="collections" className="py-32 md:py-40 bg-paper relative">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="golden-line" />
              <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Our Portfolio</span>
            </div>
            <h2 className="text-5xl md:text-7xl leading-[0.95]">
              Curated Fabrics from{' '}
              <br />
              <span className="italic font-light">Every Corner</span> of the Globe
            </h2>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-gold transition-all duration-300"
          >
            <span>View Full Catalog</span>
            <div className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center group-hover:bg-ink group-hover:text-paper group-hover:border-ink transition-all duration-300">
              <ArrowRight size={12} />
            </div>
          </motion.button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayItems.map((item: any, idx) => (
              <motion.div 
                key={item.id || idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.8 }}
                className="group cursor-pointer"
                onClick={() => window.open(item.link, '_blank')}
              >
                <div className="collection-card aspect-[3/4] mb-6">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-paper/90 backdrop-blur-md text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full border border-ink/5">
                      {item.category}
                    </span>
                  </div>
                  <div className="collection-card-content">
                    <p className="text-paper/70 text-sm mb-3">{item.desc}</p>
                    <div className="flex items-center gap-2 text-gold text-[10px] uppercase tracking-widest font-bold">
                      <span>Explore</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl mb-1 group-hover:text-gold transition-colors duration-300">{item.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-medium">{item.origin}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>

  );
};

// --- About / Process ---
const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const steps = [
    { num: "01", title: "Source", desc: "Direct partnerships with artisan mills across 5 continents" },
    { num: "02", title: "Verify", desc: "Rigorous quality testing and ethical compliance verification" },
    { num: "03", title: "Ship", desc: "End-to-end logistics with real-time tracking globally" },
    { num: "04", title: "Deliver", desc: "Door-to-door delivery with customs clearance handled" },
  ];

  return (
    <section id="about" ref={ref} className="py-32 md:py-40 bg-champagne/30 relative overflow-hidden grain-overlay">
      {/* Large decorative text */}
      <motion.div
        style={{ x }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none"
      >
        <span className="text-[20vw] font-sans font-bold text-ink/[0.02] leading-none">
          CRAFT & COMMERCE
        </span>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="golden-line" />
              <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Our Process</span>
            </div>
            <h2 className="text-5xl md:text-7xl leading-[0.95] mb-8">
              From Loom{' '}
              <br />
              <span className="italic font-light">to Latitude</span>
            </h2>
            <p className="text-ink/60 text-lg leading-relaxed mb-12 max-w-lg">
              Two decades of perfecting the art of global textile commerce. 
              Every thread tells a story of heritage meeting innovation.
            </p>
          </motion.div>

          <div className="space-y-0">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="group flex gap-8 py-8 border-b border-ink/10 cursor-pointer hover:border-gold/30 transition-colors duration-500"
              >
                <span className="text-gold/40 text-sm font-mono font-bold group-hover:text-gold transition-colors duration-300">
                  {step.num}
                </span>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl mb-2 group-hover:text-gold transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-ink/50 text-sm leading-relaxed max-w-sm opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500">
                    {step.desc}
                  </p>
                </div>
                <ArrowUpRight 
                  size={20} 
                  className="text-ink/20 group-hover:text-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 mt-2" 
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Materials / Categories ---
const Materials = () => {
  const categories = [
    { title: "The House of Silk", desc: "Premium Cotton, Viscose, and Polyester collections", icon: "✨" },
    { title: "Print Solutions", desc: "Digital & Position Print with Foil and Polyester Print", icon: "🎨" },
    { title: "Corian Process", desc: "All Coating, Foil, Stone, and Technical Bonding", icon: "⚙️" },
    { title: "Value Techniques", desc: "In-house Tikli, Folk, Handprint, and Embossing", icon: "💎" },
    { title: "Texture Work", desc: "Full process Crushing and technical fabric finishing", icon: "🌊" },
    { title: "Finished Goods", desc: "All Type Ready-to-Garment and Unstitch All Fabrics", icon: "🧵" },
  ];

  return (
    <section className="py-32 bg-ink text-paper overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="golden-line" />
              <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">The House of Silk & Print</span>
            </div>
            <h2 className="text-5xl md:text-7xl">
              Specialized <span className="italic font-light">Processes</span>
            </h2>
          </div>
          <p className="text-paper/40 text-sm max-w-xs mt-8 md:mt-0">
            One Roof solution for all types of print, coating, and value addition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-paper/[0.03] border border-paper/10 p-8 rounded-3xl hover:bg-gold/10 hover:border-gold/30 transition-all duration-500 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{cat.icon}</div>
              <h3 className="text-xl mb-2 font-sans group-hover:text-gold transition-colors">{cat.title}</h3>
              <p className="text-[10px] text-paper/30 uppercase tracking-widest leading-loose">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


const Services = () => {
  const services = [
    {
      title: "Global Distribution",
      desc: "Comprehensive supply chain solutions reaching fashion houses from Milan to Manhattan.",
      icon: <Globe size={24} />,
      features: ["Real-time Tracking", "Customs Clearance", "Bulk Logistics"]
    },
    {
      title: "Artisanal Sourcing",
      desc: "Connecting traditional heritage weavers with contemporary design requirements.",
      icon: <Sparkles size={24} />,
      features: ["Certified Organic", "Heritage Preservation", "Quality Assurance"]
    },
    {
      title: "Custom Manufacturing",
      desc: "Tailored garment solutions from concept to finished export-ready products.",
      icon: <Zap size={24} />,
      features: ["Pattern Design", "Batch Production", "Ethical Standards"]
    }
  ];

  return (
    <section id="services" className="py-32 md:py-64 bg-paper relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mb-32"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-1px bg-gold" />
            <span className="text-gold text-[10px] uppercase tracking-[0.6em] font-black italic">Crafting Excellence</span>
          </div>
          <h2 className="text-7xl lg:text-[10rem] leading-[0.85] tracking-tighter mb-12">
            The World of <br />
            <span className="italic font-light text-gold-light">Skyfab Overseas</span>
          </h2>
          <p className="text-ink/40 text-2xl font-light leading-relaxed max-w-2xl border-l border-gold/20 pl-10 leading-relaxed font-sans">
            We provide an end-to-end ecosystem for the textile industry, merging artisanal craftsmanship with industrial-scale logistics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 1 }}
              className="relative group p-12 rounded-[50px] border border-ink/[0.03] hover:border-gold/20 hover:bg-gold/[0.01] transition-all duration-700 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.03)]"
            >
              <div className="w-16 h-16 bg-gold/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-gold group-hover:text-paper transition-all duration-700 shadow-xl shadow-gold/5">
                {service.icon}
              </div>
              <h3 className="text-4xl mb-6 font-sans">{service.title}</h3>
              <p className="text-ink/50 leading-relaxed mb-10 text-lg font-light">
                {service.desc}
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                {service.features.map((feature, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/30 border border-ink/5 px-4 py-2 rounded-full group-hover:border-gold/20 group-hover:text-gold transition-colors duration-500">
                    {feature}
                  </span>
                ))}
              </div>
              <a href="#" className="inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] font-black group-hover:text-gold transition-all duration-500 relative">
                Explore Solution
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-700" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Network ---
const Network = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section id="network" ref={ref} className="py-32 md:py-64 bg-[#050a0a] text-paper overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-ink via-transparent to-ink opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gold/5 rounded-full blur-[200px] opacity-30" />

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="lg:col-span-12 xl:col-span-5"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-[1px] bg-gold" />
              <span className="text-gold text-[10px] uppercase tracking-[0.8em] font-black">Global Reach</span>
            </div>
            <h2 className="text-7xl lg:text-9xl mb-12 leading-[0.85] tracking-tighter">
              Seamless <br />
              <span className="italic font-light text-gold-light">Operations</span>
            </h2>
            <p className="text-xl text-paper/40 mb-16 leading-relaxed max-w-xl font-light">
              From the historic textile hubs of Surat to the fashion runways of Dubai, London, and New York. Our intelligent network ensures quality and speed at every latitude.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { city: 'Strategic Hubs', val: '12+', detail: 'Global textile capitals' },
                { city: 'Logistics Precision', val: '0.1s', detail: 'Real-time sync' },
                { city: 'Expert Support', val: '24/7', detail: 'Multilingual concierge' },
                { city: 'Safe Transit', val: '100%', detail: 'Insured worldwide' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col gap-2 group cursor-pointer"
                >
                  <span className="text-4xl font-sans text-gold group-hover:scale-110 transition-transform origin-left">{item.val}</span>
                  <div className="h-[1px] w-12 bg-paper/10 group-hover:w-full transition-all duration-700" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-paper/30 group-hover:text-paper transition-colors">{item.city}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="lg:col-span-12 xl:col-span-7 relative"
          >
            <div className="relative overflow-hidden rounded-[80px] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.8)] border border-paper/5 h-[800px]">
              <motion.img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
                alt="Global Network"
                className="w-full h-full object-cover filter brightness-[0.4] saturate-[0.1]"
                style={{ y: imgY }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/0 transition-colors duration-1000" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[600px] h-[600px] rounded-full border border-gold/10 animate-spin-slow flex items-center justify-center">
                  <div className="w-[450px] h-[450px] rounded-full border border-brand/5 animate-pulse flex items-center justify-center">
                    <Globe size={80} className="text-gold opacity-40" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating marker */}
            <div className="absolute top-1/4 left-1/4 flex items-center gap-4 bg-paper/5 backdrop-blur-xl border border-paper/10 p-6 rounded-3xl animate-float">
                <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_15px_rgba(197,160,89,1)]" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Surat Hub</span>
                  <span className="text-[8px] tracking-widest text-paper/30">Headquarters</span>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Product Divisions (New Section for Fabrics and Garments) ---
const ProductDivisions = () => {
  const fabricCategories = [
    "Cotton & Organic",
    "Pure Silk Excellence",
    "Viscose & Rayon",
    "Nylon & Technical",
    "Knitted & Lycra",
    "Polyester Master",
    "Embroidery Arts",
    "Signature Curtains",
    "Western Garment Sub",
    "Hijab & Burakha"
  ];

  const garmentCategories = [
    "Signature Kaftan",
    "Luxe Hijab",
    "Artisan Scarf",
    "Contemporary Casual",
    "Formal Excellence",
    "Business Precision",
    "High-Performance Active",
    "Grand Maxy Gowns"
  ];

  return (
    <section id="divisions" className="py-32 md:py-64 bg-paper relative overflow-hidden lg:px-12">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand/[0.02] rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-[1800px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-12 h-0.5 bg-brand" />
              <span className="text-brand text-[10px] uppercase tracking-[0.6em] font-black">Our Ecosystem</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-7xl lg:text-9xl leading-[0.85] mb-10 tracking-tighter"
            >
              Bespoke <br />
              <span className="italic font-light text-gold-light">Solutions</span>
            </motion.h2>
            <p className="text-ink/40 text-lg leading-relaxed mb-12 max-w-sm">
              Explore our specialized divisions crafted to serve the distinct needs of fabric wholesalers and garment exporters worldwide.
            </p>
            <div className="flex flex-col gap-6">
              <div className="group cursor-pointer">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/20 group-hover:text-brand transition-colors">Path 01</div>
                <div className="text-2xl font-sans mt-1 flex items-center gap-3">
                  Raw Materials
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/20 group-hover:text-gold transition-colors">Path 02</div>
                <div className="text-2xl font-sans mt-1 flex items-center gap-3">
                  Finished Goods
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-16">
            {/* Fabrics Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="group relative h-[800px] rounded-[60px] overflow-hidden bg-ink shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1600" 
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] contrast-[1.1] transition-transform duration-[3s] group-hover:scale-110"
                alt="Fabric Wholesale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-brand/10 group-hover:bg-brand/0 transition-colors duration-1000" />
              
              <div className="absolute bottom-0 left-0 w-full p-12 lg:p-20 flex flex-col items-start z-10">
                <span className="bg-brand/20 backdrop-blur-md border border-brand/30 text-paper text-[10px] uppercase tracking-[0.4em] font-black px-6 py-2 rounded-full mb-8">
                  Commercial Wholesale
                </span>
                <h3 className="text-5xl lg:text-7xl text-paper mb-6 font-black italic">Fabric Hub</h3>
                <p className="text-paper/40 text-xl max-w-md mb-12 font-light">
                  Bridging the gap between the loom and global latitudes with premium textile bulk solutions.
                </p>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-16">
                  {fabricCategories.map((cat, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-4 group/item cursor-default"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(0,128,128,1)]" />
                      <span className="text-[11px] uppercase tracking-widest text-paper/30 group-hover/item:text-paper transition-colors font-bold">{cat}</span>
                    </motion.div>
                  ))}
                </div>
                <button className="h-14 px-10 bg-paper text-ink rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand hover:text-paper transition-all duration-700">
                  Bulk Catalog Access
                </button>
              </div>
            </motion.div>

            {/* Garments Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="group relative h-[800px] rounded-[60px] overflow-hidden bg-gold/10 shadow-[0_50px_100px_-20px_rgba(197,160,89,0.3)] mt-24 lg:mt-0"
            >
              <img 
                src="https://images.unsplash.com/photo-1520004434532-668416a08753?auto=format&fit=crop&q=80&w=1600" 
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] group-hover:brightness-[0.7] transition-all duration-[3s] group-hover:scale-110"
                alt="Garment Export"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-12 lg:p-20 flex flex-col items-start z-10">
                <span className="bg-gold/20 backdrop-blur-md border border-gold/30 text-paper text-[10px] uppercase tracking-[0.4em] font-black px-6 py-2 rounded-full mb-8">
                  Export Operations
                </span>
                <h3 className="text-5xl lg:text-7xl text-paper mb-6 font-black font-sans">Garment Unit</h3>
                <p className="text-paper/40 text-xl max-w-md mb-12 font-light">
                  Direct-from-factory ready-to-wear excellence tailored for international retailers.
                </p>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-16">
                  {garmentCategories.map((cat, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-4 group/item cursor-default"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gold group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(197,160,89,1)]" />
                      <span className="text-[11px] uppercase tracking-widest text-paper/30 group-hover/item:text-paper transition-colors font-bold">{cat}</span>
                    </motion.div>
                  ))}
                </div>
                <button className="h-14 px-10 bg-gold text-paper rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-paper hover:text-ink transition-all duration-700 shadow-xl shadow-gold/20">
                  Export Pricing Request
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Testimonials ---
const Testimonials = () => {
  const [active, setActive] = useState(0);
  const testimonials = [
    {
      quote: "Skyfab transformed our sourcing process. Their network of artisan mills is unmatched, and the quality consistency is remarkable.",
      author: "Priya Mehta",
      role: "Head of Procurement, Textile Corp",
      rating: 5
    },
    {
      quote: "Working with them feels like having a trusted partner in every major textile hub. Their logistics team handles everything seamlessly.",
      author: "James Chen",
      role: "CEO, Pacific Fabrics",
      rating: 5
    },
    {
      quote: "The attention to ethical sourcing and quality assurance gives us complete confidence in every shipment we receive.",
      author: "Sarah Williams",
      role: "Sustainability Director, Nordic Wear",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 md:py-40 bg-paper relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-champagne/30 rounded-full blur-[120px]" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="golden-line" />
            <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Testimonials</span>
            <div className="golden-line" style={{ transform: 'scaleX(-1)' }} />
          </div>
          <h2 className="text-5xl md:text-6xl mb-16 leading-[0.95]">
            Trusted by <span className="italic font-light">Industry Leaders</span>
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(testimonials[active].rating)].map((_, i) => (
                <Star key={i} size={16} fill="#c5a059" className="text-gold" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-sans leading-relaxed mb-10 text-ink/80 italic">
              "{testimonials[active].quote}"
            </blockquote>
            <div>
              <div className="font-medium text-sm tracking-wide">{testimonials[active].author}</div>
              <div className="text-ink/40 text-xs uppercase tracking-widest mt-1">{testimonials[active].role}</div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                i === active ? "bg-gold w-8" : "bg-ink/15 hover:bg-ink/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Contact ---
const Contact = () => {
  return (
    <section className="py-32 md:py-40 bg-ink text-paper relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-paper/[0.06] to-paper/[0.02] rounded-[40px] p-8 md:p-20 border border-paper/10 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Get in Touch</span>
              </div>
              <h2 className="text-5xl md:text-7xl mb-8 leading-[0.95]">
                Start a{' '}
                <br />
                <span className="italic font-light">Partnership</span>
              </h2>
              <p className="text-paper/40 mb-14 max-w-md leading-relaxed">
                Whether you're looking to source rare fabrics or expand your export reach, our team is ready to craft the perfect solution.
              </p>
              
              <div className="space-y-8">
                {[
                  { icon: <Mail size={18} strokeWidth={1.5} />, label: 'Email Us', value: 'chamundatrends1@gmail.com' },
                  { icon: <Phone size={18} strokeWidth={1.5} />, label: 'Nikunj Gabani', value: '+91 99098 96888' },
                  { icon: <Phone size={18} strokeWidth={1.5} />, label: 'Jaydeep Gabani', value: '+91 99793 96888' },
                  { icon: <MapPin size={18} strokeWidth={1.5} />, label: 'Our Facility', value: 'House No 38, Aavishkar Texpa, Saroli Kadodara Road, 394325' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-6 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full border border-paper/10 flex items-center justify-center group-hover:border-gold/40 group-hover:bg-gold/5 transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.3em] text-paper/30 font-bold">{item.label}</div>
                      <div className="text-lg group-hover:text-gold transition-colors duration-300">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/30">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-paper/10 py-4 focus:border-gold outline-none transition-colors duration-500 text-paper placeholder:text-paper/20"
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/30">Company</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-paper/10 py-4 focus:border-gold outline-none transition-colors duration-500 text-paper placeholder:text-paper/20"
                    placeholder="Textile Corp" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/30">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-transparent border-b border-paper/10 py-4 focus:border-gold outline-none transition-colors duration-500 text-paper placeholder:text-paper/20"
                  placeholder="john@textilecorp.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/30">Inquiry Type</label>
                <select className="w-full bg-transparent border-b border-paper/10 py-4 focus:border-gold outline-none transition-colors duration-500 appearance-none cursor-pointer text-paper">
                  <option className="bg-ink">Import Services</option>
                  <option className="bg-ink">Export Partnership</option>
                  <option className="bg-ink">Custom Sourcing</option>
                  <option className="bg-ink">Logistics Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/30">Message</label>
                <textarea 
                  rows={4} 
                  className="w-full bg-transparent border-b border-paper/10 py-4 focus:border-gold outline-none transition-colors duration-500 resize-none text-paper placeholder:text-paper/20"
                  placeholder="Tell us about your requirements..." 
                />
              </div>
              <button className="group relative w-full bg-gold text-paper py-5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold overflow-hidden transition-all duration-500">
                <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-ink transition-colors duration-500">
                  Send Inquiry
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-paper scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Footer ---
const Footer = () => {
  const commonLinks = [
    { name: 'Collections', href: '#collections' },
    { name: 'Our Processes', href: '/processes' },
    { name: 'Services', href: '/services' },
    { name: 'Fabric Division', href: '#divisions' },
    { name: 'Garment Division', href: '#divisions' },
    { name: 'About Skyfab', href: '/about' },
    { name: 'Global Network', href: '#network' },
  ];

  return (
    <footer className="bg-paper border-t border-ink/5 pt-32 pb-12 lg:px-12">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-4 translate-y-[-10px]">
            <a href="/" className="flex flex-col items-start group relative mb-10 text-decoration-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white">
                  <Globe size={20} strokeWidth={2} />
                </div>
                <span className="text-4xl font-sans font-black tracking-tighter text-ink flex items-baseline">
                  SKY<span className="text-gold">FAB</span>
                </span>
              </div>
              <span className="text-[9px] tracking-[0.6em] font-black text-ink/30 mt-2 ml-14 uppercase italic">Overseas Worldwide</span>
            </a>
            <p className="text-ink/40 text-lg leading-relaxed max-w-sm mb-12 font-light">
              Crafting excellence in every weave. From our strategic hub in Surat to fashion capitals globally, we are your partner in premium textile solutions.
            </p>
            <div className="flex gap-6">
              {['Instagram', 'LinkedIn', 'Vogue Business', 'Pinterest'].map((social) => (
                <a key={social} href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/30 hover:text-gold transition-colors">{social}</a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-brand">Navigation</h4>
            <ul className="space-y-5">
              {commonLinks.slice(0, 4).map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-sm font-semibold text-ink/60 hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold transition-all duration-500 group-hover:w-4" />
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm font-semibold text-ink/60 hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold transition-all duration-500 group-hover:w-4" />
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-brand">Divisions</h4>
            <ul className="space-y-5">
              {commonLinks.slice(4).map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm font-semibold text-ink/60 hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-0 h-px bg-gold transition-all duration-500 group-hover:w-4" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black mb-10 text-brand">Global Inquiries</h4>
            <p className="text-ink/40 text-sm mb-8 font-light">Join our exclusive network and receive seasonal catalog updates and market reports.</p>
            <div className="relative group overflow-hidden rounded-full p-[1px]">
               <div className="absolute inset-0 bg-gradient-to-r from-brand via-gold to-brand animate-spin-slow opacity-20 group-hover:opacity-100 transition-opacity" />
               <div className="relative bg-paper rounded-full flex gap-2 p-2">
                  <input 
                    type="email" 
                    placeholder="Concierge Email" 
                    className="bg-transparent px-6 py-3 text-sm outline-none w-full placeholder:text-ink/20 font-semibold" 
                  />
                  <button className="bg-ink text-paper h-12 px-8 rounded-full hover:bg-brand transition-all duration-500 hover:shadow-2xl hover:shadow-brand/20 font-black text-[10px] uppercase tracking-widest shrink-0">
                    Inquire
                  </button>
               </div>
            </div>
            <div className="mt-12 pt-12 border-t border-ink/5">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-ink/20 block mb-4">Official Developers</span>
              <a href="https://webtotalsolution.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-ink/40 hover:text-brand transition-colors">
                WEBTOTALSOLUTION.COM
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-[9px] uppercase tracking-[0.4em] font-black text-ink/20">
            © 2026 SKYFAB. ALL RIGHTS RESERVED. BEYOND TEXTILES, CRAFTING LEGACIES.
          </div>
          <div className="flex gap-10">
            {['Privacy', 'Trade Terms', 'Compliance', 'Security'].map((link) => (
              <a key={link} href="#" className="text-[9px] uppercase tracking-[0.4em] font-black text-ink/20 hover:text-gold transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Page Layouts ---
const HomePage = () => (
  <>
    <Hero />
    <MarqueeTicker />
    <Stats />
    <ProductDivisions />
    <About />
    <Network />
    <div className="bg-paper py-32 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      <Link to="/collections" className="group text-4xl md:text-6xl font-sans hover:text-brand transition-colors inline-block relative px-12 py-6">
        <span className="relative z-10 flex items-center gap-6">
          Explore Our World
          <ArrowRight size={40} className="group-hover:translate-x-4 transition-transform duration-500" />
        </span>
        <div className="absolute bottom-0 left-12 right-12 h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Link>
    </div>
    <Testimonials />
  </>
);

const CollectionsPage = () => (
  <Collections />
);

const ProcessesPage = () => (
  <>
    <div className="pt-20">
      <ProductDivisions />
      <Materials />
    </div>
  </>
);

const ServicesPage = () => (
  <Services />
);

const AboutPage = () => (
  <>
    <div className="pt-20"> {/* Offset for navbar */}
      <About />
      <Network />
      <Testimonials />
    </div>
  </>
);

const ContactPage = () => (
  <div className="pt-20">
    <Contact />
  </div>
);

// --- Main App ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <CursorFollower />

      <div className="min-h-screen selection:bg-brand/30 selection:text-ink relative perspective-1000">
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/processes" element={<ProcessesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        {/* Global Overlays */}
        <div className="vignette" />
        <div className="fixed inset-0 pointer-events-none z-[60] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.02]" />

        <Footer />
      </div>
    </Router>
  );
}
