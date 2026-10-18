import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Wrench, Zap, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setStage(1), 600); // glowing logo
    const t2 = setTimeout(() => setStage(2), 1400); // tool circuit repair
    const t3 = setTimeout(() => setStage(3), 2400); // complete & ready
    const t4 = setTimeout(() => onComplete(), 3400); // smooth exit

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white overflow-hidden"
    >
      {/* Background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(2,132,199,0.18),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Skip button for instant entry */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-white uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/60 backdrop-blur-md transition-colors cursor-pointer"
      >
        Skip Intro ✕
      </button>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
        {/* Animated Phone & Repair Tools Animation */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Ambient glow rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="absolute inset-0 rounded-3xl bg-sky-500/30 blur-xl"
          />

          {/* Central Logo Box */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120 }}
            className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-700 p-0.5 shadow-2xl shadow-sky-500/40 flex items-center justify-center"
          >
            <div className="w-full h-full rounded-[14px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
              <Smartphone className="w-12 h-12 text-sky-400" />

              {/* Repair Spark Tool Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{
                  opacity: stage >= 1 ? 1 : 0,
                  scale: stage >= 1 ? 1 : 0,
                  rotate: stage >= 2 ? [0, 20, -10, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40"
              >
                <Wrench className="w-5 h-5 animate-pulse" />
              </motion.div>

              {/* Sparkles */}
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 left-2 text-amber-300"
                >
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Brand Name Typography Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-400 text-xs font-semibold tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Certified Mobile Care · Nepal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            PAWAN MOBILE <br />
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              REPAIRING CENTER
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm sm:text-base text-slate-400 font-medium tracking-wide"
          >
            “Your Trusted Mobile Repair & Accessories Partner”
          </motion.p>
        </motion.div>

        {/* Progress Bar Indicator */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: stage === 0 ? '25%' : stage === 1 ? '60%' : stage === 2 ? '90%' : '100%' }}
            transition={{ duration: 0.6 }}
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
          />
        </div>

        <p className="text-[11px] text-slate-500 mt-3 font-mono">
          {stage < 2 ? 'Initializing diagnostic lab...' : stage < 3 ? 'Loading genuine catalog...' : 'Ready! Welcome to Pawan Mobile'}
        </p>
      </div>
    </motion.div>
  );
};
