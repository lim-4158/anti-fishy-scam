import { motion } from 'framer-motion';
import { Fish, Menu, Shield, Code } from 'lucide-react';

interface HeaderProps {
  compact?: boolean;
  onMenuClick?: () => void;
  devMode?: boolean;
  onToggleDevMode?: () => void;
}

export function Header({ compact = false, onMenuClick, devMode = false, onToggleDevMode }: HeaderProps) {
  return (
    <motion.header
      className="relative z-10 flex items-center pt-6 pb-2 px-4"
      layout
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Dev mode indicator bar */}
      {devMode && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Hamburger menu button */}
      <motion.button
        onClick={onMenuClick}
        className="absolute left-4 top-6 p-2 rounded-lg text-slate-400
          hover:text-cyan-400 hover:bg-navy-800/60
          transition-colors duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open history"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Centered logo */}
      <div className="flex-1 flex items-center justify-center gap-3">
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
      </div>

      {/* Dev mode toggle */}
      <motion.button
        onClick={onToggleDevMode}
        className={`absolute right-4 top-6 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
          transition-all duration-200 border
          ${devMode
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-sm shadow-cyan-500/10'
            : 'text-slate-500 bg-transparent border-transparent hover:text-slate-300 hover:bg-navy-800/60 hover:border-navy-600/30'
          }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle developer mode"
      >
        <Code className="w-3.5 h-3.5" />
        <span className="font-medium">Dev</span>
      </motion.button>
    </motion.header>
  );
}
