import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Ask a follow-up question...' }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setMessage('');
    }
  }, [message, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <motion.div
      className="glass-card rounded-xl border border-navy-600/30 p-1.5 flex items-end gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600
          px-3 py-2 rounded-lg resize-none focus:ring-0 focus:outline-none
          min-h-[36px] max-h-[120px]"
        style={{ lineHeight: '1.4' }}
      />
      <motion.button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          bg-cyan-500/80 text-white
          hover:bg-cyan-400/90
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUp className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
