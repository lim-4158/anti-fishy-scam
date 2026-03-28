import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';
import type { VerdictLevel, CheckSummary } from '../types';
import { StatusBadge } from './StatusBadge';

interface VerdictBannerProps {
  overall: VerdictLevel;
  score: number;
  summary: string;
  checksSummary: CheckSummary[];
}

const verdictConfig = {
  likely_safe: {
    icon: ShieldCheck,
    label: 'Likely Safe',
    bgGradient: 'from-safe/10 via-safe/5 to-transparent',
    borderColor: 'border-safe/30',
    textColor: 'text-safe',
    iconColor: 'text-safe',
    glowClass: 'pulse-glow-green',
    ringColor: 'ring-safe/20',
  },
  suspicious: {
    icon: ShieldAlert,
    label: 'Suspicious',
    bgGradient: 'from-warning/10 via-warning/5 to-transparent',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
    iconColor: 'text-warning',
    glowClass: 'pulse-glow-yellow',
    ringColor: 'ring-warning/20',
  },
  likely_scam: {
    icon: ShieldX,
    label: 'Likely Scam',
    bgGradient: 'from-danger/10 via-danger/5 to-transparent',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
    iconColor: 'text-danger',
    glowClass: 'pulse-glow-red',
    ringColor: 'ring-danger/20',
  },
};

export function VerdictBanner({ overall, score, summary, checksSummary }: VerdictBannerProps) {
  const config = verdictConfig[overall];
  const Icon = config.icon;
  const [shaking, setShaking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShaking(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const scorePercent = Math.round(score * 100);

  return (
    <motion.div
      className={`w-full max-w-3xl mx-auto ${shaking ? 'screen-shake' : ''}`}
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Main verdict card */}
      <div
        className={`glass-card rounded-2xl border ${config.borderColor} ${config.glowClass} overflow-hidden`}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-5`}>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className={`p-3 rounded-xl bg-navy-900/60 ring-2 ${config.ringColor}`}>
                <Icon className={`w-8 h-8 ${config.iconColor}`} strokeWidth={1.8} />
              </div>
            </motion.div>
            <div className="flex-1">
              <motion.h2
                className={`text-2xl font-bold ${config.textColor}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {config.label}
              </motion.h2>
              <motion.div
                className="flex items-center gap-3 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-sm text-slate-400">
                  Confidence: <span className={`font-semibold ${config.textColor}`}>{scorePercent}%</span>
                </span>
                {/* Score bar */}
                <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-navy-700 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      overall === 'likely_safe'
                        ? 'bg-safe'
                        : overall === 'suspicious'
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePercent}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Alert icon for scam */}
            {overall === 'likely_scam' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <AlertTriangle className="w-6 h-6 text-danger animate-pulse" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Summary text */}
        <motion.div
          className="px-6 py-4 border-t border-navy-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
        </motion.div>

        {/* Checks summary table */}
        {checksSummary.length > 0 && (
          <motion.div
            className="px-6 pb-5 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Check Results
            </h4>
            <div className="space-y-2">
              {checksSummary.map((check, i) => (
                <motion.div
                  key={check.check_id}
                  className="flex items-center gap-3 py-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                >
                  <StatusBadge status={check.status} size="sm" />
                  <span className="text-sm text-slate-300 font-medium min-w-[140px]">
                    {check.name}
                  </span>
                  <span className="text-xs text-slate-500 flex-1">{check.one_liner}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
