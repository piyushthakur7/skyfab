import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Info } from 'lucide-react';
import { requestOrderReturn } from '../../services/woocommerce';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

const ReturnFormModal: React.FC<ReturnModalProps> = ({ isOpen, onClose, orderId }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    "Damaged or Defective",
    "Wrong Item Received",
    "Size/Fit Issue",
    "Not as Described",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for the return');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const fullReason = `${reason}. Details: ${details || 'None provided.'}`;
      await requestOrderReturn(orderId, fullReason);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        setDetails('');
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit return request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink">Request Return</h3>
                <p className="text-sm text-gray-500 font-sans">For Order #{orderId}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="py-10 text-center text-ink flex flex-col items-center">
                  <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                    <Info size={32} className="text-brand" />
                  </div>
                  <h4 className="font-bold text-xl mb-2">Request Submitted</h4>
                  <p className="text-gray-500 max-w-sm">
                    Our team has been notified of your return request. We will contact you via email shortly with next steps and return shipping instructions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-3">
                      Reason for Return *
                    </label>
                    <div className="space-y-2">
                      {reasons.map((r) => (
                        <label key={r} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="radio" 
                            name="reason" 
                            value={r} 
                            checked={reason === r}
                            onChange={(e) => setReason(e.target.value)}
                            className="text-brand focus:ring-brand"
                          />
                          <span className="text-sm font-medium text-ink">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                      Additional Details
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none resize-none"
                      placeholder="Please provide any additional context (optional)"
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-ink text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReturnFormModal;
