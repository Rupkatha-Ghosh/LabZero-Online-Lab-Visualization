import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface FloatingBrainProps {
  onClick: () => void;
}

const FloatingBrain: React.FC<FloatingBrainProps> = ({ onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 }
      }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] z-[120] group"
    >
      <Brain size={28} className="group-hover:animate-pulse" />
      <div className="absolute -top-12 right-0 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
        Memory Map
      </div>
    </motion.button>
  );
};

export default FloatingBrain;
