import { motion } from 'framer-motion';
import { CheckCard } from './CheckCard';
import type { CheckState } from '../types';

interface DashboardProps {
  checks: CheckState[];
}

export function Dashboard({ checks }: DashboardProps) {
  if (checks.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-xl h-24 shimmer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center gap-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Verification Checks
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-navy-600 to-transparent" />
        <span className="text-xs text-slate-500">
          {checks.filter((c) => ['green', 'yellow', 'red'].includes(c.status)).length}/{checks.length} complete
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check, i) => (
          <CheckCard key={check.id} check={check} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
