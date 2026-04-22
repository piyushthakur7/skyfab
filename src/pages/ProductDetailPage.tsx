import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowLeft,
  Star,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';
import { getProduct, WCProduct } from '../services/woocommerce';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<WCProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProduct(id);
        if (data) {
          setProduct(data);
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Could not load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-ink/20 mb-4" />
        <h2 className="text-3xl font-serif mb-4">{error || "Product Not Found"}</h2>
        <Link to="/" className="text-brand font-sans uppercase tracking-widest text-xs border-b border-brand pb-1">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="pt-24 pb-20 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-ink/40 text-[10px] uppercase tracking-widest font-sans mb-12">
          <Link to="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to={`/${product.categories[0]?.slug}`} className="hover:text-brand transition-colors">
            {product.categories[0]?.name || 'Collection'}
          </Link>
          <ChevronRight size={10} />
          <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-ink/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]?.src}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === i ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-brand text-[10px] font-sans font-bold uppercase tracking-widest mb-4">
                <Star size={12} fill="currentColor" />
                <span>Featured Collection</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-ink mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-ink">
                  {product.price ? `₹${product.price}` : 'Contact for Price'}
                </span>
                {product.regular_price && product.regular_price !== product.price && (
                  <span className="text-xl text-ink/30 line-through font-sans">
                    ₹{product.regular_price}
                  </span>
                )}
              </div>
              <div 
                className="text-ink/60 text-lg font-sans leading-relaxed mb-8 prose prose-ink max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
              />
            </div>

            <div className="space-y-8 mt-auto">
              <button 
                onClick={() => addToCart(product)}
                className="w-full py-6 bg-ink text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-brand transition-all flex items-center justify-center gap-3 group shadow-xl shadow-ink/10"
              >
                <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform" />
                Add to Shopping Bag
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-ink/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink">Quality</div>
                    <div className="text-[10px] text-ink/40 font-sans uppercase">Certified Export</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink">Shipping</div>
                    <div className="text-[10px] text-ink/40 font-sans uppercase">Global Logistics</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink">Returns</div>
                    <div className="text-[10px] text-ink/40 font-sans uppercase">7 Day Policy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
