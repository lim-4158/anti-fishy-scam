import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { TimelineMessage, VerdictLevel } from '../types';

interface ChatTimelineProps {
  messages: TimelineMessage[];
  isStreaming: boolean;
}

const verdictIcons: Record<VerdictLevel, React.ComponentType<{ className?: string }>> = {
  likely_safe: ShieldCheck,
  suspicious: ShieldAlert,
  likely_scam: ShieldX,
};

const verdictColors: Record<VerdictLevel, string> = {
  likely_safe: 'border-safe/30 bg-safe/5',
  suspicious: 'border-warning/30 bg-warning/5',
  likely_scam: 'border-danger/30 bg-danger/5',
};

const verdictTextColors: Record<VerdictLevel, string> = {
  likely_safe: 'text-safe',
  suspicious: 'text-warning',
  likely_scam: 'text-danger',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  green: CheckCircle,
  yellow: AlertTriangle,
  red: XCircle,
};

const statusColors: Record<string, string> = {
  green: 'text-safe',
  yellow: 'text-warning',
  red: 'text-danger',
};

function renderSimpleMarkdown(text: string): React.ReactNode {
  // Very simple bold markdown: **text** -> <strong>text</strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-200">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function TimelineBubble({ message, index }: { message: TimelineMessage; index: number }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Classification bubble — skip, already shown as badge above dashboard
  if (message.eventType === 'classification') {
    return null;
  }

  // Verdict bubble
  if (message.eventType === 'verdict' && message.metadata) {
    const overall = message.metadata.overall as VerdictLevel;
    const VerdictIcon = verdictIcons[overall] || ShieldAlert;
    const colorClass = verdictColors[overall] || '';
    const textColor = verdictTextColors[overall] || 'text-slate-300';

    return (
      <motion.div
        className="flex justify-start"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.03, duration: 0.4 }}
      >
        <div className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm border ${colorClass}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <VerdictIcon className={`w-4 h-4 ${textColor}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
              Verdict
            </span>
            {message.metadata.score != null && (
              <span className="text-xs text-slate-500">
                ({Math.round(Number(message.metadata.score) * 100)}% confidence)
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  // Check complete bubble
  if (message.eventType === 'check_complete' && message.metadata) {
    const status = message.metadata.status as string;
    const StatusIcon = statusIcons[status] || AlertCircle;
    const statusColor = statusColors[status] || 'text-slate-400';

    return (
      <motion.div
        className="flex justify-start"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
      >
        <div className="max-w-[85%] px-3 py-2 rounded-xl rounded-tl-sm
          bg-navy-800/50 border border-navy-700/40">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-3.5 h-3.5 ${statusColor} shrink-0`} />
            <p className="text-xs text-slate-400 leading-relaxed">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // System messages (check_started, errors)
  if (isSystem) {
    if (message.eventType === 'check_started') {
      // Don't render check_started at all — redundant noise in the timeline.
      // The check_complete bubble already shows the result.
      return null;
    }

    return (
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
      >
        <div className="px-3 py-1 rounded-full bg-navy-800/40 border border-navy-700/30">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  // User message
  if (isUser) {
    return (
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm
          bg-cyan-600/15 border border-cyan-500/20">
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  // Bot message (generic / chat response)
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm
        bg-navy-800/80 border border-navy-700/40">
        <p className="text-sm text-slate-300 leading-relaxed">
          {renderSimpleMarkdown(message.content)}
        </p>
      </div>
    </motion.div>
  );
}

export function ChatTimeline({ messages, isStreaming }: ChatTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
      style={{ maxHeight: '400px' }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <TimelineBubble key={msg.id} message={msg} index={i} />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {isStreaming && (
        <motion.div
          className="flex justify-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-navy-800/60 border border-navy-700/30">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
