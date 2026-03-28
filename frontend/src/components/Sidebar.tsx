import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Clock, Loader2 } from 'lucide-react';
import type { ConversationSummary, ConversationDetail, VerdictLevel, ScamType } from '../types';
import { fetchConversations, fetchConversation } from '../lib/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadConversation: (conversation: ConversationDetail) => void;
}

const verdictColors: Record<VerdictLevel, { bg: string; text: string; border: string }> = {
  likely_safe: {
    bg: 'bg-safe/15',
    text: 'text-safe',
    border: 'border-safe/30',
  },
  suspicious: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  likely_scam: {
    bg: 'bg-danger/15',
    text: 'text-danger',
    border: 'border-danger/30',
  },
};

const verdictLabels: Record<VerdictLevel, string> = {
  likely_safe: 'Safe',
  suspicious: 'Suspicious',
  likely_scam: 'Scam',
};

function formatScamType(type: ScamType | string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateInput(input: string, maxLen = 60): string {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen).trimEnd() + '...';
}

export function Sidebar({ isOpen, onClose, onLoadConversation }: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    fetchConversations()
      .then(setConversations)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const handleSelectConversation = async (id: string) => {
    setLoadingId(id);
    try {
      const detail = await fetchConversation(id);
      onLoadConversation(detail);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.aside
            className="fixed top-0 left-0 z-50 h-full w-[320px] max-w-full
              bg-navy-900/95 backdrop-blur-xl border-r border-navy-600/30
              flex flex-col shadow-2xl shadow-black/40"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">History</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white
                  hover:bg-navy-700/50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              )}

              {error && !isLoading && (
                <div className="px-3 py-4 text-sm text-danger/80">{error}</div>
              )}

              {!isLoading && !error && conversations.length === 0 && (
                <div className="px-3 py-12 text-center">
                  <p className="text-sm text-slate-500">No conversations yet.</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Analyze something to get started.
                  </p>
                </div>
              )}

              {!isLoading &&
                conversations.map((conv) => {
                  const vColors = verdictColors[conv.verdict] || verdictColors.suspicious;
                  const isLoadingThis = loadingId === conv.id;

                  return (
                    <motion.button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      disabled={isLoadingThis}
                      className="w-full text-left px-3.5 py-3 rounded-xl
                        bg-navy-800/40 border border-navy-600/20
                        hover:border-cyan-500/20 hover:bg-navy-800/70
                        transition-all duration-200 group
                        disabled:opacity-60 disabled:cursor-wait"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {/* Input snippet */}
                      <p className="text-sm text-slate-300 leading-snug mb-2 group-hover:text-white transition-colors">
                        {isLoadingThis && (
                          <Loader2 className="w-3 h-3 inline mr-1.5 animate-spin text-cyan-400" />
                        )}
                        {truncateInput(conv.input)}
                      </p>

                      {/* Badges row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Verdict badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            border ${vColors.bg} ${vColors.text} ${vColors.border}`}
                        >
                          {verdictLabels[conv.verdict] || conv.verdict}
                        </span>

                        {/* Scam type label */}
                        <span className="text-xs text-slate-500">
                          {formatScamType(conv.scam_type)}
                        </span>

                        {/* Spacer */}
                        <span className="flex-1" />

                        {/* Time */}
                        <span className="text-xs text-slate-600" title={formatDate(conv.created_at)}>
                          {formatRelativeTime(conv.created_at)}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
