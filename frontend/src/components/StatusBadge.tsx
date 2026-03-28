import { CheckCircle, AlertTriangle, XCircle, Loader2, Circle } from 'lucide-react';
import type { CheckStatus } from '../types';

interface StatusBadgeProps {
  status: CheckStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const iconClass = sizeMap[size];

  switch (status) {
    case 'idle':
      return <Circle className={`${iconClass} text-slate-600`} />;
    case 'running':
      return <Loader2 className={`${iconClass} text-cyan-400 animate-spin`} />;
    case 'green':
      return <CheckCircle className={`${iconClass} text-safe`} />;
    case 'yellow':
      return <AlertTriangle className={`${iconClass} text-warning`} />;
    case 'red':
      return <XCircle className={`${iconClass} text-danger`} />;
  }
}
