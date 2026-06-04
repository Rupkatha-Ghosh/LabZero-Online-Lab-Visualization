import React, { useEffect, useMemo, useState } from 'react';
import { X, Printer, Download, Sparkles, Lock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAwards } from '../../store/awardsStore';
import { AwardTier, TIER_META, TIER_ORDER, computeEarnedTier } from '../../utils/awardTiers';
import AwardBadge from './AwardBadge';
import { openCertificatePrintWindow } from './CertificatePdfGenerator';

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subjectName: string;
  studentName: string;
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 1) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

const generateCertificateId = (topicId: string, issuedAt: number): string => {
  const slug = topicId.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8) || 'TOPIC';
  const ts = issuedAt.toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `LZ-${slug}-${ts}-${rand}`;
};

const CertificateModal: React.FC<CertificateModalProps> = ({
  open,
  onClose,
  topicId,
  topicName,
  subjectName,
  studentName,
}) => {
  const { getProgress, getEarnedTier, issueCertificate, hasCertificate } = useAwards();
  const progress = getProgress(topicId);
  const earnedTier = getEarnedTier(topicId);
  const isIssued = hasCertificate(topicId);
  const [issuedAtLocal, setIssuedAtLocal] = useState<number | null>(progress.certificateIssuedAt);

  useEffect(() => {
    setIssuedAtLocal(progress.certificateIssuedAt);
  }, [progress.certificateIssuedAt]);

  const issuedAt = issuedAtLocal ?? Date.now();
  const certificateId = useMemo(() => generateCertificateId(topicId, issuedAt), [topicId, issuedAt]);
  const meta = TIER_META[earnedTier];
  const canEarn = earnedTier !== 'none';

  const handleIssue = () => {
    issueCertificate(topicId);
    setIssuedAtLocal(Date.now());
  };

  const handlePrint = () => {
    if (!canEarn) return;
    if (!isIssued) handleIssue();
    openCertificatePrintWindow({
      studentName: studentName || 'Student',
      topicName,
      subjectName,
      tier: earnedTier,
      issuedAt: issuedAtLocal ?? Date.now(),
      certificateId,
    });
  };

  const handleDownload = () => {
    if (!canEarn) return;
    handlePrint();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="certificate-modal"
        >
          <motion.div
            className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-3">
                <AwardBadge tier={earnedTier} size="md" />
                <div>
                  <h2 className="text-base font-display font-bold tracking-tight text-[var(--text-primary)]">
                    LabZero Certificate
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-[0.2em]">
                    {topicName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {canEarn ? (
                <div
                  className="rounded-xl p-5 text-white shadow-lg"
                  style={{ background: meta.ribbonGradient }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} />
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-80">
                        Tier {meta.ordinal} Achievement
                      </div>
                      <div className="text-xl font-display font-bold">{meta.title}</div>
                      <div className="text-xs opacity-90 mt-0.5">{meta.subtitle}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-5 border border-dashed border-[var(--border-glass)] bg-white/2 flex items-center gap-3">
                  <Lock size={20} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      No certificate yet
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      Complete the milestones below to unlock Tier 1 and beyond.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-muted)] mb-3">
                  Milestone Progress
                </div>
                <div className="space-y-2">
                  {TIER_ORDER.map((t) => {
                    const tMeta = TIER_META[t];
                    const achieved = computeEarnedTier(progress) !== 'none' && TIER_ORDER.indexOf(computeEarnedTier(progress)) >= TIER_ORDER.indexOf(t);
                    const next = !achieved && TIER_ORDER.indexOf(t) === (TIER_ORDER.indexOf(earnedTier) + 1 || (earnedTier === 'none' ? 0 : 0));
                    return (
                      <div
                        key={t}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          achieved
                            ? 'border-[var(--border-glass)] bg-white/3'
                            : 'border-dashed border-[var(--border-glass)] bg-transparent opacity-70'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            achieved ? 'text-white' : 'bg-white/5 text-[var(--text-muted)]'
                          }`}
                          style={achieved ? { background: tMeta.ribbonGradient } : {}}
                        >
                          {achieved ? <Check size={14} /> : tMeta.ordinal}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            Tier {tMeta.ordinal} — {tMeta.title}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {tMeta.criteria}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-white/2 border border-[var(--border-glass)]">
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Theory
                  </div>
                  <div className={`text-sm font-bold ${progress.theoryRead ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                    {progress.theoryRead ? 'Done' : 'Pending'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/2 border border-[var(--border-glass)]">
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Lab
                  </div>
                  <div className={`text-sm font-bold ${progress.simulationRun ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                    {progress.simulationRun ? 'Done' : 'Pending'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/2 border border-[var(--border-glass)]">
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Time
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {formatDuration(progress.timeSpentMs)}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[var(--text-muted)] break-all">
                Certificate ID: {certificateId}
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-[var(--border-glass)] bg-black/10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              >
                Close
              </button>
              <div className="flex-1" />
              <button
                onClick={handleDownload}
                disabled={!canEarn}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-glass)] text-[var(--text-primary)] hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={14} />
                Save PDF
              </button>
              <button
                onClick={handlePrint}
                disabled={!canEarn}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: canEarn ? meta.ribbonGradient : 'gray' }}
              >
                <Printer size={14} />
                Print Certificate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
