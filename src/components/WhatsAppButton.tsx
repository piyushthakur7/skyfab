import React from 'react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const phoneNumber = '919924896888';
  const defaultMessage = 'Hello Skyfab, I would like to inquire about your products and services.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba5a] transition-colors group cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Chat on WhatsApp"
    >
      {/* Ripple/Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

      {/* SVG Icon */}
      <svg
        className="w-7 h-7 relative z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.639zM6.604 18.966c1.696.993 3.32 1.488 5.395 1.49 5.33.003 9.68-4.321 9.684-9.629.002-2.571-1.002-4.98-2.83-6.797C16.984 4.226 14.58 3.22 12.015 3.22 6.69 3.22 2.34 7.541 2.336 12.852c-.001 2.106.549 3.659 1.584 5.343l-.991 3.625 3.675-.954zm12.39-4.814c-.313-.156-1.854-.915-2.133-1.017-.279-.101-.482-.152-.684.152-.202.304-.78.982-.957 1.185-.177.203-.355.228-.668.072-1.293-.65-2.158-1.122-2.997-2.56-.222-.38.222-.353.636-1.178.114-.228.057-.428-.028-.58-.085-.152-.684-1.649-.938-2.259-.247-.597-.5-.515-.684-.525-.177-.009-.38-.011-.582-.011-.202 0-.532.076-.811.38-.279.304-1.065 1.039-1.065 2.532s1.09 2.939 1.242 3.141c.152.202 2.144 3.273 5.195 4.59.726.313 1.291.5 1.731.64.73.232 1.393.197 1.917.12.584-.085 1.854-.757 2.115-1.45.261-.692.261-1.287.183-1.411-.078-.124-.279-.2-.591-.356z" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-16 bg-ink text-paper text-xs py-2 px-3 rounded-xl border border-paper/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap shadow-xl">
        Inquire on WhatsApp
      </span>
    </motion.a>
  );
}
