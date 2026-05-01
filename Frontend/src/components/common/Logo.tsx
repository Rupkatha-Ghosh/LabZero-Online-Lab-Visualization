import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', hideText = false }) => {
  const sizes = {
    sm: { box: 'w-6 h-6', text: 'text-lg', dot: 'w-1 h-1', stroke: 2 },
    md: { box: 'w-8 h-8', text: 'text-xl', dot: 'w-1.5 h-1.5', stroke: 2.5 },
    lg: { box: 'w-14 h-14', text: 'text-4xl', dot: 'w-2.5 h-2.5', stroke: 3 }
  };

  const current = sizes[size];

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
    >
      <div className={`${current.box} relative flex items-center justify-center`}>
        {/* The Mobius Glyph */}
        <svg
          viewBox="0 0 44 44"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Shadow/Glow Path */}
          <motion.path
            d="M12 12 L32 12 L12 32 L32 32"
            stroke="currentColor"
            strokeWidth={current.stroke * 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-primary)] opacity-10 blur-[2px]"
            variants={{
              hover: { opacity: 0.2, scale: 1.1 }
            }}
          />

          {/* Main Structural Z-Path */}
          <motion.path
            d="M10 12 H34 L10 32 H34"
            stroke="currentColor"
            strokeWidth={current.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0F172A]"
            variants={{
              initial: { pathLength: 1 },
              hover: { color: "var(--color-primary)" }
            }}
            transition={{ duration: 0.4 }}
          />

          {/* The "Zero" Cross-Refraction */}
          <motion.circle
            cx="22"
            cy="22"
            r="10"
            stroke="currentColor"
            strokeWidth={current.stroke * 0.8}
            className="text-[var(--color-primary)]"
            variants={{
              initial: { pathLength: 0.2, rotate: 0, opacity: 0.6 },
              hover: { pathLength: 1, rotate: 360, opacity: 1 }
            }}
            transition={{ duration: 1.2, ease: "circInOut" }}
          />

          {/* Precision Nodes */}
          <motion.circle
            cx="10" cy="12" r="2"
            fill="var(--color-secondary)"
            variants={{ hover: { scale: 1.5 } }}
          />
          <motion.circle
            cx="34" cy="32" r="2"
            fill="var(--color-primary)"
            variants={{ hover: { scale: 1.5 } }}
          />
        </svg>

        {/* Central Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-xl -z-10"
        />
      </div>

      {!hideText && (
        <div className="flex flex-col select-none">
          <motion.span
            className={`${current.text} font-display font-black tracking-tighter leading-none flex items-center`}
          >
            <span className="text-[#0F172A]">LAB</span>
            <span className="relative ml-0.5">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">ZERO</span>
              <motion.div
                className="absolute -bottom-1 left-0 h-[2px] bg-[var(--color-primary)]"
                initial={{ width: 0 }}
                variants={{
                  hover: { width: '100%' }
                }}
              />
            </span>
          </motion.span>
          {size === 'lg' && (
            <motion.span
              className="text-[10px] font-bold tracking-[0.4em] text-[#94A3B8] uppercase mt-1.5"
            >
              Synthesis of Thought
            </motion.span>
          )}
        </div>
      )}
    </motion.div>
  );
};
