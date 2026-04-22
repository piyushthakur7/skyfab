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
  
  // Filter States
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [selectedSubCat, setSelectedSubCat] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allCats = await getCategories();
        const subs = allCats.filter((c: any) => c.parent === categoryId);
        setAllSubCategories(subs);

        let data = await getProducts({ category: categoryId, per_page: 50 });

        if (data.length === 0) {
          const childIds = subs.map((c: any) => c.id);
          if (childIds.length > 0) {
            const subResults = await Promise.all(
              childIds.map((id: number) => getProducts({ category: id, per_page: 20 }))
            );
            data = subResults.flat();
          }
        }

        if (data.length === 0) {
          data = await getProducts({ per_page: 50 });
        }

        setProducts(data);
        
        // Initialize price range based on products
        const prices = data.map(p => parseFloat(p.price || '0')).filter(p => p > 0);
        if (prices.length > 0) {
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
      } catch (err) {
        console.error(`Failed to load ${title} products:`, err);
        setError("Could not connect to the product catalog.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, title]);

  // Derived attributes for filters
  const availableFilters = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const materials = new Set<string>();

    products.forEach(p => {
      p.attributes?.forEach(attr => {
        if (attr.name.toLowerCase() === 'size') attr.options.forEach(o => sizes.add(o));
        if (attr.name.toLowerCase() === 'color') attr.options.forEach(o => colors.add(o));
        if (attr.name.toLowerCase() === 'material' || attr.name.toLowerCase() === 'fabric') attr.options.forEach(o => materials.add(o));
      });
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      materials: Array.from(materials).sort()
    };
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedSubCat) {
      result = result.filter(p => p.categories.some(c => c.id === selectedSubCat));
    }

    // Price Filter
    result = result.filter(p => {
      const price = parseFloat(p.price || '0');
      if (price === 0) return true; // Keep items with "Contact for Price"
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Attribute Filters
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.attributes?.some(attr => 
        attr.name.toLowerCase() === 'size' && attr.options.some(o => selectedSizes.includes(o))
      ));
    }
    if (selectedColors.length > 0) {
      result = result.filter(p => p.attributes?.some(attr => 
        attr.name.toLowerCase() === 'color' && attr.options.some(o => selectedColors.includes(o))
      ));
    }
    if (selectedMaterials.length > 0) {
      result = result.filter(p => p.attributes?.some(attr => 
        (attr.name.toLowerCase() === 'material' || attr.name.toLowerCase() === 'fabric') && 
        attr.options.some(o => selectedMaterials.includes(o))
      ));
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
    }

    return result;
  }, [products, selectedSubCat, sortBy, priceRange, selectedSizes, selectedColors, selectedMaterials]);

  const clearFilters = () => {
    setSelectedSubCat(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    const prices = products.map(p => parseFloat(p.price || '0')).filter(p => p > 0);
    if (prices.length > 0) setPriceRange([Math.min(...prices), Math.max(...prices)]);
  };

  const FilterSidebar = () => (
    <div className="space-y-12">
      {/* Categories */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-6 border-b border-ink/5 pb-2">Collections</h4>
        <div className="space-y-3">
          <button 
            onClick={() => setSelectedSubCat(null)}
            className={`block w-full text-left text-sm transition-colors ${selectedSubCat === null ? 'text-brand font-bold' : 'text-ink/60 hover:text-ink'}`}
          >
            All Items
          </button>
          {allSubCategories.map(sub => (
            <button 
              key={sub.id}
              onClick={() => setSelectedSubCat(sub.id)}
              className={`block w-full text-left text-sm transition-colors ${selectedSubCat === sub.id ? 'text-brand font-bold' : 'text-ink/60 hover:text-ink'}`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-6 border-b border-ink/5 pb-2">Price Range</h4>
        <div className="px-2">
          <input 
            type="range" 
            min="0" 
            max="50000" 
            step="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-brand mb-4 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-sans text-ink/40 uppercase tracking-widest font-bold">
            <span>₹{priceRange[0]}</span>
            <span>Up to ₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-6 border-b border-ink/5 pb-2">Size</h4>
        <div className="grid grid-cols-4 gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(size => {
            const isAvailable = availableFilters.sizes.includes(size) || availableFilters.sizes.length === 0;
            return (
              <button
                key={size}
                disabled={!isAvailable && availableFilters.sizes.length > 0}
                onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                className={`h-10 flex items-center justify-center border text-[10px] font-bold uppercase transition-all ${
                  selectedSizes.includes(size) 
                    ? 'bg-ink text-white border-ink shadow-lg' 
                    : isAvailable 
                      ? 'bg-transparent text-ink border-ink/10 hover:border-ink/20' 
                      : 'bg-paper text-ink/10 border-ink/5 cursor-not-allowed opacity-50'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      {availableFilters.colors.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-6 border-b border-ink/5 pb-2">Color Palette</h4>
          <div className="flex flex-wrap gap-2">
            {availableFilters.colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                className={`px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedColors.includes(color) ? 'bg-ink text-white border-ink' : 'bg-transparent text-ink/40 border-ink/10 hover:border-ink/20'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {availableFilters.materials.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink mb-6 border-b border-ink/5 pb-2">Material</h4>
          <div className="space-y-3">
            {availableFilters.materials.map(mat => (
              <label key={mat} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedMaterials.includes(mat)}
                    onChange={() => setSelectedMaterials(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat])}
                    className="w-5 h-5 rounded border-ink/10 accent-brand cursor-pointer"
                  />
                </div>
                <span className={`text-sm transition-colors ${selectedMaterials.includes(mat) ? 'text-brand font-bold' : 'text-ink/60 group-hover:text-ink'}`}>
                  {mat}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={clearFilters}
        className="w-full py-4 border border-ink/10 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all flex items-center justify-center gap-2 rounded-xl"
      >
        <X size={14} />
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="pt-20 bg-paper min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[60vh] min-h-[300px] overflow-hidden flex items-center">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-8xl font-serif text-paper mb-6">{title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-paper/60 text-sm md:text-xl font-sans max-w-3xl mx-auto leading-relaxed">{desc}</motion.p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-32">
                <FilterSidebar />
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-grow">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-ink/5">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="lg:hidden flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                  >
                    <SlidersHorizontal size={14} />
                    Filters
                  </button>
                  <div className="hidden sm:block h-4 w-px bg-ink/5 mx-2" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40">
                    {filteredAndSortedProducts.length} Pieces Found
                  </span>
                </div>
                
                <div className="relative group">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-transparent border-none text-[10px] uppercase tracking-widest font-bold text-ink pr-8 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-ink/40" />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <Loader2 className="w-12 h-12 text-brand animate-spin mb-6" />
                  <p className="text-ink/40 font-sans uppercase tracking-[0.3em] text-[10px] font-bold">Curating Collection...</p>
                </div>
              ) : error || (categoryId && products.length === 0) ? (
                <div className="text-center py-32 bg-beige/30 rounded-[40px] border border-ink/5">
                  <AlertCircle className="w-16 h-16 text-ink/10 mx-auto mb-6" />
                  <h3 className="text-3xl font-serif text-ink mb-4">Collection Under Update</h3>
                  <p className="text-ink/60 font-sans mb-12 max-w-md mx-auto">We're currently enriching this collection. Explore our core offerings below in the meantime.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-5xl mx-auto px-6">
                    {staticItems.slice(0, 6).map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        className="bg-white p-8 rounded-3xl border border-ink/5 hover:border-brand/20 transition-all group shadow-sm hover:shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand mb-6">
                          <Check size={24} />
                        </div>
                        <h3 className="text-xl font-serif mb-2">{item}</h3>
                        <p className="text-ink/40 text-[10px] font-sans uppercase tracking-widest font-bold">Premium Export Quality</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                  {filteredAndSortedProducts.map((product, i) => (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} 
                      transition={{ delay: i * 0.05 }}
                      className="group flex flex-col"
                    >
                      <Link to={`/product/${product.id}`} className="aspect-[3/4] rounded-[40px] overflow-hidden relative block shadow-lg group-hover:shadow-2xl transition-all duration-700">
                        <img 
                          src={product.images[0]?.src || image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-sans font-bold uppercase tracking-wider text-ink shadow-sm">
                          {product.categories[0]?.name || title}
                        </div>
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <span className="bg-white text-ink px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 shadow-xl">Quick View</span>
                        </div>
                      </Link>
                      <div className="mt-8 flex flex-col flex-grow px-2">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <Link to={`/product/${product.id}`} className="hover:text-brand transition-colors">
                            <h3 className="text-2xl font-serif leading-tight">{product.name}</h3>
                          </Link>
                          <span className="text-xl font-bold text-ink whitespace-nowrap">
                            {product.price ? `₹${product.price}` : 'Contact'}
                          </span>
                        </div>
                        <div 
                          className="text-ink/40 text-sm font-sans mb-10 line-clamp-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
                        />
                        <div className="mt-auto">
                          <button 
                            onClick={() => addToCart(product)}
                            className="w-full py-5 bg-ink text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-brand transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-ink/10"
                          >
                            <ShoppingCart size={16} />
                            Add to Shopping Bag
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-paper z-[101] shadow-2xl overflow-y-auto p-10"
            >
              <div className="flex items-center justify-between mb-16">
                <h3 className="text-3xl font-serif">Filters</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <FilterSidebar />
              <div className="mt-16 pt-8 border-t border-ink/5">
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-full py-6 bg-ink text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-ink/20"
                >
                  Apply Selection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
