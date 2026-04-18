import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { getProducts, WCProduct } from '../services/woocommerce';
import { useCart } from '../context/CartContext';

export const CategoryPage = ({ title, desc, items: staticItems, image, categoryId }: { title: string; desc: string; items: string[]; image: string; categoryId?: number }) => {
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ category: categoryId });
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

  return (
    <div className="pt-20">
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden flex items-center">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-paper mb-4">{title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-paper/60 text-lg font-sans max-w-2xl mx-auto">{desc}</motion.p>
        </div>
      </section>
      <section className="py-20 bg-paper">
        <div className="max-w-6xl mx-auto px-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(products.length > 0 ? products : []).map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-ink/5 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img 
                      src={product.images[0]?.src || image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider text-ink">
                      {product.categories[0]?.name || title}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-xl font-serif">{product.name}</h3>
                      <span className="text-lg font-bold text-ink">₹{product.price}</span>
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
          )}
        </div>
      </section>
    </div>
  );
};

export const IndianWearPage = () => <CategoryPage title="Indian Wear" desc="Exquisite ethnic wear crafted from India's finest textiles." image="/images/indian-wear.png" categoryId={15}
  items={['Sarees', 'Lehengas', 'Kurtas & Kurtis', 'Salwar Kameez', 'Dupattas & Stoles', 'Sherwanis', 'Palazzo Sets', 'Anarkali Suits', 'Bridal Wear', 'Chaniya Choli', 'Dhoti Kurta', 'Nehru Jackets']} />;

export const ExportFabricsPage = () => <CategoryPage title="Export Fabric Material" desc="World-class fabrics for international fashion houses and retailers." image="/images/export-fabric.png" categoryId={16}
  items={['Cotton & Organic', 'Pure Silk', 'Viscose & Rayon', 'Polyester', 'Nylon & Technical', 'Jacquard Weaves', 'Embroidered Fabrics', 'Printed Fabrics', 'Linen Blends', 'Knitted Fabrics', 'Lycra & Stretch', 'Curtain Fabrics']} />;

export const ExportGarmentsPage = () => <CategoryPage title="Export Garments" desc="Ready-to-wear excellence for global shoppers and retailers." image="/images/export-garment.png" categoryId={17}
  items={['Signature Kaftans', 'Hijab & Scarves', 'Western Casual', 'Formal Wear', 'Maxy Gowns', 'Business Attire', 'Active Wear', 'Burakha Collection', 'Kids Garment', 'Loungewear', 'Denim Collection', 'Uniform Programs']} />;
