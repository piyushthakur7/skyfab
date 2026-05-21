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
                className="text-ink/60 text-lg font-sans leading-relaxed mb-10 prose prose-ink max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
              />

              {/* Attributes Selection */}
              <div className="space-y-8 mb-10">
                {product.attributes?.map(attr => (
                  <div key={attr.id || attr.name}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink">{attr.name}</h4>
                      {attr.name.toLowerCase() === 'size' && (
                        <button className="text-[10px] text-brand border-b border-brand/20 pb-0.5 font-bold uppercase tracking-widest hover:text-ink hover:border-ink transition-all">
                          Size Guide
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map(option => (
                        <button
                          key={option}
                          className="px-6 py-3 border border-ink/10 text-[10px] font-bold uppercase tracking-widest hover:border-ink hover:bg-ink hover:text-white transition-all rounded-xl min-w-[60px] text-center"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 mt-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-1 py-6 bg-ink text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-brand transition-all flex items-center justify-center gap-3 group shadow-xl shadow-ink/10 cursor-pointer"
                >
                  <ShoppingCart size={18} className="group-hover:-translate-y-1 transition-transform" />
                  Add to Shopping Bag
                </button>
                <a 
                  href={`https://wa.me/919909896888?text=Hello%20Skyfab%2C%20I%27m%20interested%20in%20inquiring%20about%20the%20product%20*${encodeURIComponent(product.name)}*%20(Link%3A%20${encodeURIComponent(window.location.origin + '/product/' + product.id)})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-6 bg-[#25D366] text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/10 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.639zM6.604 18.966c1.696.993 3.32 1.488 5.395 1.49 5.33.003 9.68-4.321 9.684-9.629.002-2.571-1.002-4.98-2.83-6.797C16.984 4.226 14.58 3.22 12.015 3.22 6.69 3.22 2.34 7.541 2.336 12.852c-.001 2.106.549 3.659 1.584 5.343l-.991 3.625 3.675-.954zm12.39-4.814c-.313-.156-1.854-.915-2.133-1.017-.279-.101-.482-.152-.684.152-.202.304-.78.982-.957 1.185-.177.203-.355.228-.668.072-1.293-.65-2.158-1.122-2.997-2.56-.222-.38.222-.353.636-1.178.114-.228.057-.428-.028-.58-.085-.152-.684-1.649-.938-2.259-.247-.597-.5-.515-.684-.525-.177-.009-.38-.011-.582-.011-.202 0-.532.076-.811.38-.279.304-1.065 1.039-1.065 2.532s1.09 2.939 1.242 3.141c.152.202 2.144 3.273 5.195 4.59.726.313 1.291.5 1.731.64.73.232 1.393.197 1.917.12.584-.085 1.854-.757 2.115-1.45.261-.692.261-1.287.183-1.411-.078-.124-.279-.2-.591-.356z" />
                  </svg>
                  Inquire on WhatsApp
                </a>
              </div>

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
