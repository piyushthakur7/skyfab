import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, updateOrderPaymentStatus } from '../../services/woocommerce';
import { CheckCircle2, Loader2, Lock, ArrowLeft, Package, CreditCard, Smartphone } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const MERCHANT_NAME = import.meta.env.VITE_MERCHANT_NAME || 'Skyfab Overseas';

const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  
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

  // Delhivery Logistics State
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'serviceable' | 'unserviceable' | 'error'>('idle');
  const [codSupported, setCodSupported] = useState(true);
  const [shippingRate, setShippingRate] = useState(0);
  const [shippingZone, setShippingZone] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Auto-verify serviceability and auto-fill city/state when pincode is 6 digits
  useEffect(() => {
    const verifyPincode = async () => {
      const pin = formData.postcode.trim();
      if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        setPincodeStatus('idle');
        setShippingRate(0);
        setShippingZone('');
        setPincodeMessage('');
        return;
      }

      setPincodeChecking(true);
      setPincodeStatus('checking');
      setPincodeMessage('');

      try {
        const { checkPincode, getShippingRate } = await import('../../services/delhivery');
        const res = await checkPincode(pin);

        if (res.serviceable) {
          setPincodeStatus('serviceable');
          setCodSupported(res.cod);

          // Auto-fill city and state retrieved from the Delhivery API
          setFormData(prev => ({
            ...prev,
            city: prev.city || res.city,
            state: prev.state || res.state,
          }));

          // Disable COD if not supported for this pincode
          if (!res.cod && paymentMethod === 'cod') {
            setPaymentMethod('online');
          }

          // Calculate shipping weight: 500g default, 250g per additional item
          const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
          const weightGrams = 500 + Math.max(0, totalQty - 1) * 250;

          // Fetch shipping rate
          const rateRes = await getShippingRate(pin, weightGrams);
          setShippingRate(rateRes.totalAmount);
          setShippingZone(rateRes.zone);
          setPincodeMessage(`✓ Serviceable: ${res.city}, ${res.state}`);
        } else {
          setPincodeStatus('unserviceable');
          setShippingRate(0);
          setShippingZone('');
          setPincodeMessage('Delhivery does not deliver to this pincode.');
        }
      } catch (err: any) {
        console.error('[Checkout] Delhivery verify error:', err);
        setPincodeStatus('error');
        setPincodeMessage('Unable to verify pincode. Please try again.');
      } finally {
        setPincodeChecking(false);
      }
    };

    verifyPincode();
  }, [formData.postcode, items]);

  if (items.length === 0 && !success) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only digits and max 6 characters for postcode
    if (name === 'postcode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRazorpayPayment = async (orderId: number) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round((cartTotal + shippingRate) * 100), // Amount in paise including shipping
        currency: 'INR',
        name: MERCHANT_NAME,
        description: `Order #${orderId}`,
        image: '/logo.png', // Update with your logo
        order_id: '',
        handler: async (response: any) => {
          try {
            setLoading(true);
            await updateOrderPaymentStatus(orderId, response.razorpay_payment_id);
            resolve(response);
          } catch (err: any) {
            reject(new Error('Payment successful but failed to update order status. Please contact support.'));
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#020E21',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled by user');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check pincode serviceability
    if (pincodeStatus === 'unserviceable') {
      setError('Cannot place order. Selected delivery location is unserviceable.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)',
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
        shipping_lines: [
          {
            method_id: 'delhivery_shipping',
            method_title: `Delhivery Standard ${shippingZone ? `(Zone ${shippingZone})` : ''}`,
            total: shippingRate.toString(),
          }
        ],
        meta_data: [
          {
            key: '_delhivery_zone',
            value: shippingZone,
          },
          {
            key: '_delhivery_cod_serviceable',
            value: codSupported ? 'yes' : 'no',
          },
          {
            key: '_delhivery_charged_shipping',
            value: shippingRate.toString(),
          }
        ],
        customer_id: user?.id || 0,
      };

      const order = await createOrder(orderData, user?.token);
      
      if (paymentMethod === 'online') {
        await handleRazorpayPayment(order.id);
      }

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check your data.');
    } finally {
      if (paymentMethod === 'cod') setLoading(false);
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
                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm font-sans" placeholder="Mumbai" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">State</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm font-sans" placeholder="Maharashtra" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Postcode</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="postcode" 
                        required 
                        maxLength={6}
                        value={formData.postcode} 
                        onChange={handleInputChange} 
                        className={cn(
                          "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm font-sans pr-10",
                          pincodeStatus === 'serviceable' && "border-green-300 focus:border-green-500",
                          pincodeStatus === 'unserviceable' && "border-red-300 focus:border-red-500"
                        )} 
                        placeholder="400001" 
                      />
                      {pincodeChecking && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <Loader2 size={16} className="animate-spin text-brand" />
                        </div>
                      )}
                    </div>
                    {pincodeMessage && (
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider pl-1 mt-1.5 flex items-center gap-1",
                        pincodeStatus === 'serviceable' && "text-green-600",
                        pincodeStatus === 'unserviceable' && "text-red-500",
                        pincodeStatus === 'error' && "text-amber-600"
                      )}>
                        {pincodeMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-xl font-serif font-bold text-ink mb-6">Payment Method</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all",
                        paymentMethod === 'online' ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border shadow-sm",
                        paymentMethod === 'online' ? "bg-white border-brand/20 text-brand" : "bg-gray-50 border-gray-200 text-gray-400"
                      )}>
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <p className={cn("font-bold text-sm", paymentMethod === 'online' ? "text-ink" : "text-gray-500")}>Online Payment</p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-sans mt-0.5">Fast & Secure via Razorpay</p>
                      </div>
                      <div className="ml-auto">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-4",
                          paymentMethod === 'online' ? "border-brand bg-white" : "border-gray-200 bg-white"
                        )} />
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={!codSupported}
                      onClick={() => setPaymentMethod('cod')}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all",
                        paymentMethod === 'cod' ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200",
                        !codSupported && "opacity-45 cursor-not-allowed bg-gray-50 border-gray-100 hover:border-gray-100"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border shadow-sm",
                        paymentMethod === 'cod' ? "bg-white border-brand/20 text-brand" : "bg-gray-50 border-gray-200 text-gray-400"
                      )}>
                        <CreditCard size={20} />
                      </div>
                      <div className="text-left">
                        <p className={cn("font-bold text-sm flex items-center gap-2", paymentMethod === 'cod' ? "text-ink" : "text-gray-500")}>
                          Cash on Delivery
                          {!codSupported && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Prepaid Only
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-sans mt-0.5">
                          {!codSupported ? "COD is not serviceable for this pincode" : "Pay when your order arrives"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-4",
                          paymentMethod === 'cod' ? "border-brand bg-white" : "border-gray-200 bg-white"
                        )} />
                      </div>
                    </button>
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
                  <span className="text-gray-500 font-sans text-sm">Subtotal</span>
                  <span className="font-bold text-ink">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-center px-4 py-3 rounded-xl border transition-all",
                  shippingRate > 0 
                    ? "bg-brand/5 border-brand/20 text-brand" 
                    : "bg-green-50 border-green-100 text-green-700"
                )}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Shipping {shippingZone ? `(Delhivery Zone ${shippingZone})` : ''}
                  </span>
                  <span className="font-bold text-sm uppercase">
                    {shippingRate > 0 ? `₹${shippingRate.toFixed(2)}` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-ink font-bold font-serif">Payable Total</span>
                  <span className="text-3xl font-bold text-ink font-serif">₹{(cartTotal + shippingRate).toFixed(2)}</span>
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
                disabled={loading || pincodeChecking || pincodeStatus === 'unserviceable'}
                className="w-full py-5 mt-8 bg-ink text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ink/10"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {paymentMethod === 'online' ? 'Initiating Payment...' : 'Finalizing...'}</>
                ) : pincodeChecking ? (
                  <><Loader2 size={18} className="animate-spin" /> Verifying Postcode...</>
                ) : pincodeStatus === 'unserviceable' ? (
                  'Postcode Unserviceable'
                ) : (
                  paymentMethod === 'online' ? 'Pay & Confirm Order' : 'Confirm Cash Order'
                )}
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
