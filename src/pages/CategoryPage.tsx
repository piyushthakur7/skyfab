import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, AlertCircle, ShoppingCart, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { getProducts, getCategories, WCProduct } from '../services/woocommerce';
import { useCart } from '../context/CartContext';

export const CategoryPage = ({ title, desc, items: staticItems, image, categoryId }: { title: string; desc: string; items: string[]; image: string; categoryId?: number }) => {
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [selectedSubCat, setSelectedSubCat] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all categories for sub-category filtering
        const allCats = await getCategories();
        const subs = allCats.filter((c: any) => c.parent === categoryId);
        setAllSubCategories(subs);

        // 1. Try fetching products from this specific category
        let data = await getProducts({ category: categoryId, per_page: 50 });

        // 2. If empty, fetch from all child sub-categories
        if (data.length === 0) {
          const childIds = subs.map((c: any) => c.id);
          
          if (childIds.length > 0) {
            const subResults = await Promise.all(
              childIds.map((id: number) => getProducts({ category: id, per_page: 20 }))
            );
            data = subResults.flat();
          }
        }

        // 3. If STILL empty, fetch ALL products as fallback
        if (data.length === 0) {
          data = await getProducts({ per_page: 50 });
        }

        setProducts(data);
      } catch (err) {
        console.error(`Failed to load ${title} products:`, err);
        setError("Could not connect to the product catalog.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, title]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by sub-category
    if (selectedSubCat) {
      result = result.filter(p => p.categories.some(c => c.id === selectedSubCat));
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
    }

    return result;
  }, [products, selectedSubCat, sortBy]);

  return (
    <div className="pt-20">
      <section className="relative h-[40vh] md:h-[60vh] min-h-[300px] overflow-hidden flex items-center">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-serif text-paper mb-4">{title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-paper/60 text-sm md:text-lg font-sans max-w-2xl mx-auto">{desc}</motion.p>
        </div>
      </section>

      <section className="py-12 bg-paper border-b border-ink/5 sticky top-20 z-40 backdrop-blur-md bg-paper/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-ink/40 text-[10px] uppercase tracking-widest font-bold">
              <SlidersHorizontal size={14} />
              <span>Filter By</span>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setSelectedSubCat(null)}
                className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border transition-all ${
                  selectedSubCat === null ? 'bg-ink text-white border-ink' : 'bg-transparent text-ink/40 border-ink/10 hover:border-ink/20'
                }`}
              >
                All
              </button>
              {allSubCategories.map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.id)}
                  className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border transition-all ${
                    selectedSubCat === sub.id ? 'bg-ink text-white border-ink' : 'bg-transparent text-ink/40 border-ink/10 hover:border-ink/20'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-transparent border-none text-[10px] uppercase tracking-widest font-bold text-ink pr-8 py-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-ink/40" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-paper">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
              <p className="text-ink/40 font-sans uppercase tracking-widest text-xs">Loading Collection...</p>
            </div>
          ) : error || (categoryId && products.length === 0) ? (
            <div className="text-center py-20 bg-beige/30 rounded-3xl border border-ink/5">
              <AlertCircle className="w-12 h-12 text-ink/20 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-ink mb-2">Collection Not Available</h3>
              <p className="text-ink/60 font-sans mb-8">We are currently updating our online catalog. Please see our featured products below.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                {staticItems.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="bg-white p-8 rounded-2xl border border-ink/5 hover:border-brand/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand mb-4">
                      <Check size={20} />
                    </div>
                    <h3 className="text-lg font-serif mb-1">{item}</h3>
                    <p className="text-ink/40 text-sm font-sans">Premium quality, export-ready</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40">
                  Showing {filteredAndSortedProducts.length} Results
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAndSortedProducts.map((product, i) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} 
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-ink/5 overflow-hidden hover:shadow-2xl transition-all group flex flex-col"
                  >
                    <Link to={`/product/${product.id}`} className="aspect-[3/4] overflow-hidden relative block">
                      <img 
                        src={product.images[0]?.src || image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider text-ink">
                        {product.categories[0]?.name || title}
                      </div>
                    </Link>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Link to={`/product/${product.id}`} className="hover:text-brand transition-colors">
                          <h3 className="text-xl font-serif">{product.name}</h3>
                        </Link>
                        <span className="text-lg font-bold text-ink">{product.price ? `₹${product.price}` : 'Contact'}</span>
                      </div>
                      <div 
                        className="text-ink/60 text-sm font-sans mb-6 line-clamp-2 flex-grow"
                        dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
                      />
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full py-4 bg-ink text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand transition-colors flex items-center justify-center gap-2 group mb-6"
                      >
                        <ShoppingCart size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                        Add to Cart
                      </button>
                      <div className="flex items-center justify-between border-t border-ink/5 pt-4">
                        <span className="text-brand text-[11px] font-sans font-bold uppercase tracking-widest italic">Available Primary</span>
                        <Check size={16} className="text-brand" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// Note: Indian Wear has no dedicated WooCommerce category yet. When products are added
// under an "Indian Wear" parent category, set categoryId here to enable dynamic loading.
export const IndianWearPage = () => <CategoryPage title="Indian Wear" desc="Exquisite ethnic wear crafted from India's finest textiles." image="/images/indian-wear.png"
  items={['Sarees', 'Lehengas', 'Kurtas & Kurtis', 'Salwar Kameez', 'Dupattas & Stoles', 'Sherwanis', 'Palazzo Sets', 'Anarkali Suits', 'Bridal Wear', 'Chaniya Choli', 'Dhoti Kurta', 'Nehru Jackets']} />;

export const ExportFabricsPage = () => <CategoryPage title="Export Fabric Material" desc="World-class fabrics for international fashion houses and retailers." image="/images/export-fabric.png" categoryId={16}
  items={['Cotton & Organic', 'Pure Silk', 'Viscose & Rayon', 'Polyester', 'Nylon & Technical', 'Jacquard Weaves', 'Embroidered Fabrics', 'Printed Fabrics', 'Linen Blends', 'Knitted Fabrics', 'Lycra & Stretch', 'Curtain Fabrics']} />;

export const ExportGarmentsPage = () => <CategoryPage title="Export Garments" desc="Ready-to-wear excellence for global shoppers and retailers." image="/images/export-garment.png" categoryId={29}
  items={['Signature Kaftans', 'Hijab & Scarves', 'Western Casual', 'Formal Wear', 'Maxy Gowns', 'Business Attire', 'Active Wear', 'Burakha Collection', 'Kids Garment', 'Loungewear', 'Denim Collection', 'Uniform Programs']} />;
