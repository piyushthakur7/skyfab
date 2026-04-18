import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-[120px] pb-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-serif font-bold text-ink">Your Cart</h1>
          <p className="text-gray-500 font-sans">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ink mb-2">Cart is empty</h2>
            <p className="text-gray-500 font-sans mb-10 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Explore our collections to find something you love.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-ink text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div 
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-6"
                  >
                    <div className="w-32 h-40 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img 
                          src={item.product.images[0].src} 
                          alt={item.product.images[0].alt} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between gap-4 mb-2">
                        <Link to={`/product/${item.product.id}`} className="text-xl font-serif font-bold text-ink hover:text-brand transition-colors">
                          {item.product.name}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 font-sans mb-auto line-clamp-2" dangerouslySetInnerHTML={{ __html: item.product.short_description || '' }} />

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:text-ink rounded-md transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-ink">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:text-ink rounded-md transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-ink">
                          ₹{ (parseFloat(item.product.price || '0') * item.quantity).toFixed(2) }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-32">
                <h3 className="text-xl font-serif font-bold text-ink mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-ink">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600 font-bold">Calculated at checkout</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between pt-2">
                    <span className="text-ink font-bold">Total</span>
                    <span className="text-2xl font-bold text-ink">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-5 bg-ink text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand transition-colors flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="mt-6 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Secure checkout powered by WooCommerce
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
