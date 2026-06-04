import React from 'react';
import { Lock, Compass, FlaskConical, GraduationCap, Rocket, Award } from 'lucide-react';
import { AwardTier, TIER_META } from '../../utils/awardTiers';
import { motion } from 'motion/react';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  lock: Lock,
  compass: Compass,
  flask: FlaskConical,
  'graduation-cap': GraduationCap,
  rocket: Rocket,
  award: Award,
};

interface AwardBadgeProps {
  tier: AwardTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const AwardBadge: React.FC<AwardBadgeProps> = ({ tier, size = 'sm', showLabel = false }) => {
  const meta = TIER_META[tier];
  const Icon = ICONS[meta.icon] ?? Award;
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  const iconSizes = { sm: 14, md: 18, lg: 24 };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="inline-flex items-center gap-2"
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20`}
        style={{ background: meta.ribbonGradient }}
        title={`${meta.title} — ${meta.subtitle}`}
      >
        <Icon size={iconSizes[size]} className="text-white drop-shadow" />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
            style={{ color: meta.accent }}
          >
            Tier {meta.ordinal}
          </span>
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {meta.title}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default AwardBadge;
