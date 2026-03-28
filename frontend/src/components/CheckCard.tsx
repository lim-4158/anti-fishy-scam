import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Briefcase,
  Shield,
  DollarSign,
  Users,
  Star,
  Link,
  Lock,
  FileText,
  Tag,
  ShoppingCart,
  Store,
  Search,
  Phone,
  ChevronDown,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { CheckState } from '../types';

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  briefcase: Briefcase,
  shield: Shield,
  'dollar-sign': DollarSign,
  users: Users,
  star: Star,
  link: Link,
  lock: Lock,
  'file-text': FileText,
  tag: Tag,
  'shopping-cart': ShoppingCart,
  store: Store,
  search: Search,
  phone: Phone,
};

interface CheckCardProps {
  check: CheckState;
  index: number;
}

export function CheckCard({ check, index }: CheckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = iconComponents[check.icon] || Shield;

  const borderColor = {
    idle: 'border-l-slate-700',
    running: 'border-l-cyan-400',
    green: 'border-l-safe',
    yellow: 'border-l-warning',
    red: 'border-l-danger',
  }[check.status];

  const glowClass = {
    idle: '',
    running: 'pulse-glow',
    green: '',
    yellow: '',
    red: '',
  }[check.status];

  const bgClass = {
    idle: 'opacity-50',
    running: '',
    green: '',
    yellow: '',
    red: '',
  }[check.status];

  const iconColor = {
    idle: 'text-slate-600',
    running: 'text-cyan-400',
    green: 'text-safe',
    yellow: 'text-warning',
    red: 'text-danger',
  }[check.status];

  const isComplete = ['green', 'yellow', 'red'].includes(check.status);
  const hasDetails = check.details?.evidence && check.details.evidence.length > 0;

  return (
    <motion.div
      className={`glass-card rounded-xl border-l-4 ${borderColor} ${glowClass} ${bgClass}
        overflow-hidden transition-all duration-300
        ${isComplete && hasDetails ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: check.status === 'idle' ? 0.5 : 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
      layout
      onClick={() => isComplete && hasDetails && setExpanded(!expanded)}
      whileHover={isComplete && hasDetails ? { scale: 1.01 } : {}}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${iconColor} transition-colors duration-300`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-200 truncate">
                {check.name}
              </h4>
              <StatusBadge status={check.status} size="sm" />
            </div>

            {/* Running state */}
            {check.status === 'running' && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {check.progressMessage ? (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {check.progressMessage}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                    <p className="text-xs text-slate-500">Checking...</p>
                  </div>
                )}
                {check.browserUrl && (
                  <a
                    href={check.browserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400/80 hover:text-cyan-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Watch Live
                  </a>
                )}
                {/* Shimmer bar */}
                <div className="mt-2.5 h-1 rounded-full bg-navy-700 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500/40 via-cyan-400/60 to-cyan-500/40"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '40%' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Complete state */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {check.summary}
                </p>
                {hasDetails && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-slate-500">
                      {expanded ? 'Hide details' : 'View evidence'}
                    </span>
                    <motion.div
                      animate={{ rotate: expanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-navy-700/50">
              {check.details?.url_visited && (
                <div className="mt-3 mb-2">
                  <span className="text-xs text-slate-500">URL: </span>
                  <a
                    href={check.details.url_visited}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400/80 hover:text-cyan-400 break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {check.details.url_visited}
                  </a>
                </div>
              )}
              <ul className="space-y-1.5 mt-2">
                {check.details?.evidence?.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        check.status === 'red'
                          ? 'bg-danger/60'
                          : check.status === 'yellow'
                          ? 'bg-warning/60'
                          : 'bg-safe/60'
                      }`}
                    />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
