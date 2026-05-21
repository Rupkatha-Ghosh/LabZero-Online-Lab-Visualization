import React from 'react';
import { AnimatePresence } from 'framer-motion';

const AnimationShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
};

export default AnimationShell;
