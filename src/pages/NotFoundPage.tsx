import React from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -ml-64 -mb-64" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[120px] md:text-[180px] font-serif font-light text-ink/5 leading-none select-none">
            404
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-ink mt-[-40px] mb-6">
            Something is <span className="italic">missing</span>
          </h1>
          <p className="text-ink/60 font-sans text-lg max-w-md mx-auto mb-12">
            The collection you are looking for has been moved or doesn't exist. Let's get you back to the showroom.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-ink text-paper rounded-full font-sans font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 hover:bg-brand transition-all group"
          >
            <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 border border-ink/10 text-ink rounded-full font-sans font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 hover:bg-ink hover:text-paper transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-20 pt-12 border-t border-ink/5"
        >
          <div className="flex items-center justify-center gap-8 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink/30">
            <Link to="/indian-wear" className="hover:text-brand transition-colors">Indian Wear</Link>
            <Link to="/export-fabrics" className="hover:text-brand transition-colors">Export Fabrics</Link>
            <Link to="/contact" className="hover:text-brand transition-colors">Get Support</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
