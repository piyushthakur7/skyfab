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
  Play
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
    { name: 'Processes', href: '/processes' },
    { name: 'Specialties', href: '/services' },
    { name: 'Heritage', href: '/about' },
    { name: 'Inquiry', href: '/contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6",
        isScrolled 
          ? "bg-paper/90 backdrop-blur-xl border-b border-ink/5 py-3 shadow-sm" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="flex flex-col items-start group">
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-brand animate-pulse-slow" />
              <span className="text-2xl font-bold tracking-tighter">
                <span className="text-ink">SKY</span>
                <span className="text-brand">FAB</span>
              </span>
            </div>
            <span className="text-[7px] tracking-[0.4em] font-bold text-ink/40 -mt-1 ml-8">OVERSEAS WORLDWIDE</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div 
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.4 + i * 0.1 }}
              >
                <Link 
                  to={link.href}
                  className="relative text-xs uppercase tracking-[0.2em] font-medium hover:text-gold transition-colors duration-300 group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 hover:bg-ink/5 rounded-full transition-all duration-300 hidden sm:block hover:rotate-12">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <a 
            href={`${import.meta.env.VITE_WC_URL || '#'}/cart`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 hover:bg-ink/5 rounded-full transition-all duration-300 relative"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
          </a>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 bg-ink text-paper px-7 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand transition-all duration-500 group overflow-hidden relative shadow-lg shadow-ink/10"
          >
            <span className="relative z-10 flex items-center gap-2">
              Inquiry
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <div className="absolute inset-0 bg-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 w-full bg-paper/95 backdrop-blur-xl border-b border-ink/5 overflow-hidden md:hidden"
          >
            <div className="p-8 flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-serif border-b border-ink/5 pb-4 flex justify-between items-center group"
                  >
                    {link.name}
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              ))}
              <button className="bg-ink text-paper px-6 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-bold mt-4">
                Start Inquiry
              </button>
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
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <section ref={ref} className="relative h-screen min-h-[800px] flex items-center overflow-hidden bg-ink">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 z-0 origin-center" style={{ y, scale, rotate, opacity }}>
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000" 
          alt="Abstract Textiles"
          className="w-full h-full object-cover grayscale brightness-75 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/60 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/20 to-transparent" />
      </motion.div>

      <DigitalLoom />
      
      <div className="absolute inset-0 z-[1] grain-overlay opacity-30" />
      <div className="vignette z-[2]" />

      <FloatingThreads />

      <motion.div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3.2 }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 3.4 }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="w-16 h-px bg-brand" />
              <span className="text-paper/60 text-[10px] uppercase tracking-[0.5em] font-bold">
                Pioneering Global Textiles Since 2006
              </span>
            </motion.div>

            {/* Main Title with staggered letters or words */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: '100%', skewY: 10 }}
                animate={{ y: 0, skewY: 0 }}
                transition={{ duration: 1.2, delay: 3.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-7xl md:text-9xl lg:text-[12rem] text-paper leading-[0.8] tracking-tighter"
              >
                CRAFTING
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-12 flex items-center gap-8">
              <motion.h1
                initial={{ y: '100%', skewY: 10 }}
                animate={{ y: 0, skewY: 0 }}
                transition={{ duration: 1.2, delay: 3.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-7xl md:text-9xl lg:text-[12rem] text-brand leading-[0.8] tracking-tighter italic font-light"
              >
                CONNECTIONS
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 4.5, duration: 1 }}
                className="hidden lg:block w-32 h-32 rounded-full border border-paper/10 flex items-center justify-center italic text-paper/30 text-xs"
              >
                World Class
              </motion.div>
            </div>

            {/* Description and CTA Row */}
            <div className="flex flex-col md:flex-row md:items-end gap-12 mt-16">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 4.2 }}
                className="text-paper/50 text-base md:text-xl font-light max-w-sm leading-relaxed"
              >
                We bridge the gap between heritage looms and global latitudes, 
                delivering premium textile solutions to the modern world.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 4.4 }}
                className="flex items-center gap-6"
              >
                <button className="group relative bg-brand text-paper h-16 px-10 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand/40">
                  <span className="relative z-10 flex items-center gap-3">
                    Our Heritage
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-paper scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold z-20">
                    Explore Now
                  </span>
                </button>
                <button className="w-16 h-16 rounded-full border border-paper/20 flex items-center justify-center text-paper hover:bg-paper hover:text-ink transition-all duration-500 group">
                  <Play size={20} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.5, duration: 1 }}
        className="absolute bottom-12 right-12 flex items-center gap-4 origin-right rotate-90"
      >
        <span className="text-paper/20 text-[9px] uppercase tracking-[0.5em] font-bold">Scroll to discover</span>
        <div className="w-24 h-px bg-paper/10" />
      </motion.div>
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
                <div className="text-5xl md:text-6xl font-serif mb-3 tabular-nums group-hover:text-brand transition-colors duration-300">
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
        <span className="text-[20vw] font-serif font-bold text-ink/[0.02] leading-none">
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
              <h3 className="text-xl mb-2 font-serif group-hover:text-gold transition-colors">{cat.title}</h3>
              <p className="text-[10px] text-paper/30 uppercase tracking-widest leading-loose">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Services / Divisions ---
const Services = () => {
  const services = [
    {
      icon: <Globe className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Print Solution One Roof",
      desc: "Digital Print, Position Print with Foil, and Polyester Print all under one roof.",
      features: ["Digital & Pos", "Foil Printing", "Polyester Experts"]
    },
    {
      icon: <Sparkles className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Value Addition Devesion",
      desc: "In-house Tikli, Stone, Bonding, Folk, Handprint, and Technical Crushing.",
      features: ["Stone/Bonding", "Handprint", "Tikli Process"]
    },
    {
      icon: <Star className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Full Corian Process",
      desc: "Comprehensive in-house coating and technical fabric enhancements.",
      features: ["Full Coating", "Emboss Work", "Technical Gear"]
    },
    {
      icon: <ShoppingBag className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Fabric Sales & Value",
      desc: "Complete fabric supply solutions with all types of value-added processes.",
      features: ["Bulk Supply", "Process Ready", "Global Shipping"]
    },
    {
      icon: <ArrowUpRight className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Stitch & Garment",
      desc: "Our ready-to-sell division, delivering finished garments and stitched excellence.",
      features: ["Ready-for-Sell", "Quality Control", "Export Grade"]
    },
    {
      icon: <ChevronRight className="text-gold" size={28} strokeWidth={1.5} />,
      title: "Custom Development",
      desc: "Specialized in all types of bespoke textile and garment development.",
      features: ["R&D Team", "Prototyping", "Bespoke Solutions"]
    }
  ];

  return (
    <section id="services" className="py-32 md:py-40 bg-paper relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-champagne/30 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="golden-line" />
            <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">What We Do</span>
            <div className="golden-line" style={{ transform: 'scaleX(-1)' }} />
          </div>
          <h2 className="text-5xl md:text-7xl leading-[0.95]">
            Excellence at{' '}
            <span className="italic font-light">Every Step</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="service-card group"
            >
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold/20 transition-colors duration-500">
                {service.icon}
              </div>
              <h3 className="text-3xl mb-4">{service.title}</h3>
              <p className="text-ink/60 leading-relaxed mb-8">
                {service.desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {service.features.map((feature, i) => (
                  <span key={i} className="text-[9px] uppercase tracking-[0.15em] font-bold bg-ink/5 px-3 py-1.5 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
              <a href="#" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-gold transition-colors duration-300">
                Learn More <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
  const imgY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section id="network" ref={ref} className="py-32 md:py-40 bg-midnight text-paper overflow-hidden relative">
      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl">
              <motion.img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" 
                alt="Global Network"
                className="w-full h-auto"
                style={{ y: imgY }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
            </div>
            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -right-6 bg-paper/10 backdrop-blur-xl border border-paper/10 rounded-2xl p-6 animate-border-glow"
            >
              <div className="text-4xl font-serif mb-1">12</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-paper/50 font-bold">Strategic Hubs</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="golden-line" />
              <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Our Reach</span>
            </div>
            <h2 className="text-5xl md:text-7xl mb-8 leading-[0.95]">
              A Seamless{' '}
              <br />
              <span className="italic font-light">Global Network</span>
            </h2>
            <p className="text-lg text-paper/50 mb-12 leading-relaxed">
              With offices in Mumbai, Dubai, London, and New York, our local presence ensures we understand regional market nuances while maintaining a unified global standard of excellence.
            </p>
            <div className="space-y-6">
              {[
                { city: 'Strategic Hubs in 12 Major Cities', detail: 'From Mumbai to Manhattan' },
                { city: 'Real-time Shipment Tracking', detail: 'GPS-enabled logistics' },
                { city: 'Multilingual Support Teams', detail: '14 languages supported' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse-gold" />
                  <div>
                    <span className="text-sm font-medium tracking-wide group-hover:text-gold transition-colors duration-300">
                      {item.city}
                    </span>
                    <span className="text-paper/30 text-xs ml-3">{item.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
            <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed mb-10 text-ink/80 italic">
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
  return (
    <footer className="py-24 bg-paper border-t border-ink/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-champagne/20 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 lg:col-span-1">
            <div className="text-2xl font-serif font-bold tracking-tight mb-6">
              SKY<span className="text-gold">FAB</span>
            </div>
            <p className="text-ink/50 text-sm leading-relaxed mb-8">
              Excellence in textile commerce for over 20 years. Bridging the gap between global craft and international demand.
            </p>
            <div className="flex gap-3">
              {[Instagram, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center hover:bg-ink hover:text-paper hover:border-ink transition-all duration-500 hover:-translate-y-1">
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Quick Links</h4>
            <ul className="space-y-4 text-sm text-ink/50">
              {[
                { name: 'Collections', href: '/collections' },
                { name: 'Our Services', href: '/services' },
                { name: 'Global Network', href: '#network' },
                { name: 'Shop All', href: `${import.meta.env.VITE_WC_URL || '#'}/shop` }
              ].map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold transition-all duration-300 group-hover:w-4" />
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold transition-all duration-300 group-hover:w-4" />
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>

          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Support</h4>
            <ul className="space-y-4 text-sm text-ink/50">
              {['Inquiry Form', 'Shipping Policy', 'Terms of Trade', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-0 h-px bg-gold transition-all duration-300 group-hover:w-4" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8">Newsletter</h4>
            <p className="text-sm text-ink/50 mb-6">Stay updated with global textile trends and market insights.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-ink/5 border border-ink/5 rounded-full px-5 py-3 text-sm outline-none w-full focus:border-gold/30 transition-colors duration-300 placeholder:text-ink/30" 
              />
              <button className="bg-ink text-paper p-3 rounded-full hover:bg-gold transition-all duration-500 hover:shadow-lg hover:shadow-gold/20 shrink-0">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase tracking-[0.3em] font-bold text-ink/30">
          <div>© 2026 Skyfab. All Rights Reserved.</div>
          <div className="flex gap-8">
            {['Cookies', 'Legal', 'Sitemap'].map((link) => (
              <a key={link} href="#" className="hover:text-gold transition-colors duration-300">{link}</a>
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
    <About />
    <Network />
    <div className="bg-paper py-32 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      <Link to="/collections" className="group text-4xl md:text-6xl font-serif hover:text-brand transition-colors inline-block relative px-12 py-6">
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
  <Materials />
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
