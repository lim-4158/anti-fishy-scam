import { motion } from 'framer-motion';
import { Fish, Shield } from 'lucide-react';

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  return (
    <motion.header
      className="relative z-10 flex items-center justify-center gap-3 pt-6 pb-2"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="relative">
          <Shield
            className={`text-cyan-400 transition-all duration-300 ${
              compact ? 'w-7 h-7' : 'w-10 h-10'
            }`}
            strokeWidth={1.8}
          />
          <Fish
            className={`absolute text-cyan-400 transition-all duration-300 ${
              compact
                ? 'w-3.5 h-3.5 top-1.5 left-1.5'
                : 'w-5 h-5 top-2.5 left-2.5'
            }`}
            strokeWidth={2}
          />
        </div>
      </motion.div>

      <div className="flex flex-col items-start">
        <motion.h1
          className={`font-bold tracking-tight text-white transition-all duration-300 leading-none ${
            compact ? 'text-xl' : 'text-3xl'
          }`}
          layout
        >
          Anti
          <span className="text-cyan-400">Fishy</span>
        </motion.h1>
        {!compact && (
          <motion.p
            className="text-sm text-slate-400 tracking-wide"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Don't get hooked.
          </motion.p>
        )}
      </div>
    </motion.header>
  );
}
