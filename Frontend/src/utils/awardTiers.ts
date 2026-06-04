export type AwardTier = 'none' | 'tier1' | 'tier2' | 'tier3' | 'tier4';

export interface TierMeta {
  id: AwardTier;
  ordinal: number;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  ribbonGradient: string;
  sealGradient: string;
  icon: string;
  criteria: string;
}

export const TIER_META: Record<AwardTier, TierMeta> = {
  none: {
    id: 'none',
    ordinal: 0,
    title: 'Not yet earned',
    subtitle: 'Start the lab to begin',
    color: 'slate',
    accent: '#64748b',
    ribbonGradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    sealGradient: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
    icon: 'lock',
    criteria: 'Read the theory to earn Tier 1.',
  },
  tier1: {
    id: 'tier1',
    ordinal: 1,
    title: 'Explorer',
    subtitle: 'Theory mastered',
    color: 'amber',
    accent: '#b45309',
    ribbonGradient: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)',
    sealGradient: 'linear-gradient(135deg, #fde68a 0%, #b45309 100%)',
    icon: 'compass',
    criteria: 'Read the theory in full to earn Tier 1.',
  },
  tier2: {
    id: 'tier2',
    ordinal: 2,
    title: 'Investigator',
    subtitle: 'Theory + Lab experiment',
    color: 'slate',
    accent: '#475569',
    ribbonGradient: 'linear-gradient(135deg, #e2e8f0 0%, #475569 100%)',
    sealGradient: 'linear-gradient(135deg, #f1f5f9 0%, #475569 100%)',
    icon: 'flask',
    criteria: 'Tier 1 + run the simulation to earn Tier 2.',
  },
  tier3: {
    id: 'tier3',
    ordinal: 3,
    title: 'Scholar',
    subtitle: 'Theory + Lab + Quiz',
    color: 'yellow',
    accent: '#a16207',
    ribbonGradient: 'linear-gradient(135deg, #fef08a 0%, #a16207 100%)',
    sealGradient: 'linear-gradient(135deg, #fef9c3 0%, #ca8a04 100%)',
    icon: 'graduation-cap',
    criteria: 'Tier 2 + attempt the quiz to earn Tier 3.',
  },
  tier4: {
    id: 'tier4',
    ordinal: 4,
    title: 'Pioneer',
    subtitle: 'Deep mastery (1+ min)',
    color: 'sky',
    accent: '#0369a1',
    ribbonGradient: 'linear-gradient(135deg, #7dd3fc 0%, #0369a1 100%)',
    sealGradient: 'linear-gradient(135deg, #bae6fd 0%, #0c4a6e 100%)',
    icon: 'rocket',
    criteria: 'Tier 3 + spend 1+ minute on the topic.',
  },
};

export const TIER_ORDER: AwardTier[] = ['tier1', 'tier2', 'tier3', 'tier4'];

export const nextTier = (current: AwardTier): AwardTier => {
  if (current === 'none') return 'tier1';
  const idx = TIER_ORDER.indexOf(current);
  if (idx === -1 || idx === TIER_ORDER.length - 1) return current;
  return TIER_ORDER[idx + 1];
};

export const meetsTierCriteria = (
  tier: AwardTier,
  progress: { theoryRead: boolean; simulationRun: boolean; quizCompleted: boolean; timeSpentMs: number }
): boolean => {
  switch (tier) {
    case 'none':
      return false;
    case 'tier1':
      return progress.theoryRead;
    case 'tier2':
      return progress.theoryRead && progress.simulationRun;
    case 'tier3':
      return progress.theoryRead && progress.simulationRun && progress.quizCompleted;
    case 'tier4':
      return (
        progress.theoryRead &&
        progress.simulationRun &&
        progress.quizCompleted &&
        progress.timeSpentMs >= 60 * 1000
      );
  }
};

export const computeEarnedTier = (progress: {
  theoryRead: boolean;
  simulationRun: boolean;
  quizCompleted: boolean;
  timeSpentMs: number;
}): AwardTier => {
  for (let i = TIER_ORDER.length - 1; i >= 0; i -= 1) {
    if (meetsTierCriteria(TIER_ORDER[i], progress)) return TIER_ORDER[i];
  }
  return 'none';
};
