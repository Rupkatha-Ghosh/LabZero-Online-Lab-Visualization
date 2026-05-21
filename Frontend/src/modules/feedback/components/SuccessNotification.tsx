import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessNotificationProps {
  message: string | null;
}

const SuccessNotification = ({ message }: SuccessNotificationProps) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="fixed right-4 top-4 z-[230] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl"
      >
        <CheckCircle2 size={18} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

export default SuccessNotification;
