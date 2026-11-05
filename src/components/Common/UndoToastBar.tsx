import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, X, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const UndoToastBar: React.FC = () => {
  const { activeUndo, triggerUndo, dismissUndo } = useCrm();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeUndo) {
      setProgress(100);
      return;
    }

    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    setProgress(100);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissUndo();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeUndo, dismissUndo]);

  return (
    <AnimatePresence>
      {activeUndo && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center shadow-xl shadow-stone-900/15"
        >
          <div className="relative overflow-hidden bg-[#14281D] text-stone-100 rounded-2xl px-5 py-3.5 flex items-center gap-4 border border-emerald-950/40 min-w-[340px] max-w-md">
            {/* Progress bar at the top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-900/40">
              <div
                className="h-full bg-emerald-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium text-stone-200 truncate">
                {activeUndo.message}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerUndo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer</span>
              </button>

              <button
                type="button"
                onClick={dismissUndo}
                aria-label="Cerrar notificación"
                className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
