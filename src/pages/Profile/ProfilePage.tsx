import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerOrders, WCOrder } from '../../services/woocommerce';
import { User, LogOut, Package, Clock, CheckCircle, RotateCcw, Star, ChevronRight } from 'lucide-react';
import ReviewModal from '../../components/Modals/ReviewModal';
import ReturnFormModal from '../../components/Modals/ReturnFormModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // We use either user ID if returned from WP, or fallback to fetching all locally mocked for testing, 
        // since headless Woocommerce uses WP User IDs. For the sake of the mock, assuming ID 1 if not present.
        const custId = user.id || 1;
        const data = await getCustomerOrders(custId, user.token);
        
        // Ensure data is array
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openReviewModal = (productId: number, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setReviewModalOpen(true);
  };

  const openReturnModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setReturnModalOpen(true);
  };

  // Filter orders
  // Active: pending, processing, on-hold
  // Past: completed, cancelled, refunded
  const activeOrders = orders.filter(o => ['pending', 'processing', 'on-hold'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled', 'refunded', 'failed'].includes(o.status));

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="min-h-screen pt-[120px] pb-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={32} className="text-brand" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-ink capitalize">{user?.displayName}</h2>
                <p className="text-sm font-sans text-gray-500">{user?.username}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('active')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors",
                  activeTab === 'active' ? "bg-ink text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Clock size={18} /> Active Orders
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{activeOrders.length}</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('past')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors",
                  activeTab === 'past' ? "bg-ink text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <CheckCircle size={18} /> Past Orders
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{pastOrders.length}</span>
              </button>
            </nav>

            <hr className="my-6 border-gray-100" />
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-serif font-bold text-ink mb-8">
            {activeTab === 'active' ? 'Active Orders' : 'Order History'}
          </h1>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <Loader2 size={40} className="text-brand animate-spin mb-4" />
              <p className="text-gray-500 font-sans">Loading your orders...</p>
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
              <Package size={64} className="text-gray-200 mb-6" />
              <h3 className="font-serif font-bold text-2xl text-ink mb-2">No {activeTab} orders found</h3>
              <p className="text-gray-500 font-sans mb-8">
                {activeTab === 'active' 
                  ? "You don't have any orders currently processing." 
                  : "You haven't completed any orders yet."}
              </p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-ink text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {displayOrders.map((order, i) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
                        <p className="font-sans font-semibold text-ink">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-sans font-semibold text-ink">{new Date(order.date_created).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="font-sans font-semibold text-ink">{order.currency} {parseFloat(order.total).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          order.status === 'completed' ? "bg-green-100 text-green-700" :
                          order.status === 'processing' ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        )}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="space-y-6">
                        {order.line_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package size={24} className="text-gray-400" />
                              </div>
                              <div>
                                <h4 className="font-sans font-semibold text-ink">{item.name}</h4>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-ink mr-4">{order.currency} {parseFloat(item.total).toFixed(2)}</p>
                              
                              {/* Post-Delivery Actions */}
                              {order.status === 'completed' && activeTab === 'past' && (
                                <button 
                                  onClick={() => openReviewModal(item.product_id, item.name)}
                                  className="px-4 py-2 border border-yellow-400 text-yellow-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-yellow-50 transition-colors flex items-center gap-2"
                                >
                                  <Star size={14} className="fill-yellow-600" /> Rate
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Return Request Button */}
                      {order.status === 'completed' && activeTab === 'past' && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                          <button 
                            onClick={() => openReturnModal(order.id)}
                            className="px-5 py-2.5 bg-gray-100 text-ink rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <RotateCcw size={16} /> Request Return
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)} 
        productId={selectedProductId || 0}
        productName={selectedProductName}
      />
      
      <ReturnFormModal 
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        orderId={selectedOrderId || 0}
      />
    </div>
  );
};

export default ProfilePage;
