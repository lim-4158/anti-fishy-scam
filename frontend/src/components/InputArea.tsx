import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Briefcase, Mail, ShoppingBag, MessageCircle, Heart } from 'lucide-react';

interface InputAreaProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  compact?: boolean;
  initialMessage?: string;
}

const quickChips = [
  { label: 'Job Posting', icon: Briefcase, prompt: 'I received this job offer and it seems too good to be true:\n\n' },
  { label: 'Suspicious Email', icon: Mail, prompt: 'I got this suspicious email:\n\n' },
  { label: 'Online Deal', icon: ShoppingBag, prompt: 'I found this deal online that seems too good:\n\n' },
  { label: 'WhatsApp/SMS', icon: MessageCircle, prompt: 'I received this message from an unknown number:\n\n' },
  { label: 'Romance Scam', icon: Heart, prompt: 'Someone I met online is asking me to:\n\n' },
];

export function InputArea({ onSubmit, isLoading, compact = false, initialMessage = '' }: InputAreaProps) {
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleChipClick = (prompt: string) => {
    setMessage(prompt);
  };

  if (compact) {
    return (
      <motion.div
        className="glass-card rounded-xl px-5 py-3 flex items-center gap-3 mx-auto max-w-3xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-sm text-slate-300 truncate flex-1">
          {initialMessage || 'Analyzing...'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Main input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-cyan-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="relative glass-card rounded-2xl p-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a suspicious URL, message, or job posting..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-5 py-4 rounded-xl resize-none text-base leading-relaxed focus:ring-0 min-h-[140px] max-h-[300px]"
            rows={5}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs text-slate-600 pl-2">
              {message.length > 0 ? `${message.length} chars` : 'Cmd+Enter to submit'}
            </span>
            <motion.button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
                bg-gradient-to-r from-cyan-500 to-cyan-600 text-white
                hover:from-cyan-400 hover:to-cyan-500
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-cyan-500/20
                hover:shadow-cyan-400/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-4 h-4" />
              Analyze
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick-action chips */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {quickChips.map((chip, i) => (
              <motion.button
                key={chip.label}
                onClick={() => handleChipClick(chip.prompt)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs
                  bg-navy-800/80 border border-navy-600/50 text-slate-400
                  hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-navy-700/60
                  transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.03 }}
              >
                <chip.icon className="w-3 h-3" />
                {chip.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
