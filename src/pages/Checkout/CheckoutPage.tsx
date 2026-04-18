import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/woocommerce';
import { CheckCircle2, Loader2, Lock, ArrowLeft, Package, CreditCard } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
  });

  if (items.length === 0 && !success) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: 'IN',
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: 'IN',
        },
        line_items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        customer_id: user?.id || 0,
      };

      await createOrder(orderData, user?.token);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-[120px] flex items-center justify-center p-6 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 font-sans mb-10">
            Thank you for your purchase. We'll send you an email confirmation with your order details and tracking link shortly.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full py-4 bg-ink text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand transition-colors"
          >
            Track Your Order
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] pb-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-500 hover:text-ink transition-colors mb-8 font-bold uppercase tracking-wider text-[10px]"
        >
          <ArrowLeft size={14} /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-serif font-bold text-ink mb-8">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="John" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="+91 00000 00000" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="House no, Street, Area" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">City</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="Mumbai" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">State</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="Maharashtra" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Postcode</label>
                    <input type="text" name="postcode" required value={formData.postcode} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all" placeholder="400001" />
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-xl font-serif font-bold text-ink mb-6">Payment Method</h3>
                  <div className="flex items-center gap-4 p-5 border-2 border-brand/20 bg-brand/5 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-brand/20 shadow-sm">
                      <CreditCard size={20} className="text-brand" />
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm">Cash on Delivery</p>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">Pay when your order arrives</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full border-4 border-brand bg-white" />
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-32">
              <h3 className="text-xl font-serif font-bold text-ink mb-8">Order Overview</h3>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 mb-8 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                      <img src={item.product.images?.[0]?.src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow pt-1">
                      <h4 className="text-sm font-bold text-ink line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-ink mt-1">₹{ (parseFloat(item.product.price || '0') * item.quantity).toFixed(2) }</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-ink">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                  <span className="text-green-700 text-xs font-bold uppercase tracking-wider">Shipping</span>
                  <span className="text-green-700 font-bold text-sm">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-ink font-bold">Payable Total</span>
                  <span className="text-3xl font-bold text-ink font-serif">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider rounded-xl border border-red-100 text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                form="checkout-form"
                disabled={loading}
                className="w-full py-5 mt-8 bg-ink text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-ink/10"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Finalizing...</> : 'Confirm Order Now'}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                <Lock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
