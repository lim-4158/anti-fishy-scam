// SSE Event Types matching API contract

export type ScamType = 'job_scam' | 'phishing' | 'dropship' | 'romance' | 'generic';
export type CheckStatus = 'idle' | 'running' | 'green' | 'yellow' | 'red';
export type VerdictLevel = 'likely_safe' | 'suspicious' | 'likely_scam';
export type AppPhase = 'input' | 'follow_up' | 'analyzing' | 'verdict';

export interface AnalyzeRequest {
  message: string;
  session_id?: string;
  context?: {
    channel?: string;
    contact?: string;
    company?: string;
    product_url?: string;
    original_url?: string;
  };
}

// SSE Events

export interface ClassificationEvent {
  type: 'classification';
  scam_type: ScamType;
  confidence: number;
  summary: string;
}

export interface FollowUpQuestion {
  field: string;
  label: string;
  input_type: 'select' | 'text';
  options?: string[];
}

export interface FollowUpEvent {
  type: 'follow_up';
  questions: FollowUpQuestion[];
}

export interface CheckStartedEvent {
  type: 'check_started';
  check_id: string;
  name: string;
  icon: string;
}

export interface CheckProgressEvent {
  type: 'check_progress';
  check_id: string;
  message: string;
  browser_url?: string;
}

export interface CheckCompleteEvent {
  type: 'check_complete';
  check_id: string;
  status: 'green' | 'yellow' | 'red';
  summary: string;
  details: {
    tinyfish_goal?: string;
    url_visited?: string;
    evidence?: string[];
    raw_data?: Record<string, unknown>;
    agent_reasoning?: string;
  };
}

export interface CheckSummary {
  check_id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  one_liner: string;
}

export interface VerdictEvent {
  type: 'verdict';
  overall: VerdictLevel;
  score: number;
  summary: string;
  checks_summary: CheckSummary[];
}

export interface DoneEvent {
  type: 'done';
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type SSEEvent =
  | ClassificationEvent
  | FollowUpEvent
  | CheckStartedEvent
  | CheckProgressEvent
  | CheckCompleteEvent
  | VerdictEvent
  | DoneEvent
  | ErrorEvent;

// App State

export interface CheckState {
  id: string;
  name: string;
  icon: string;
  status: CheckStatus;
  progressMessage?: string;
  browserUrl?: string;
  summary?: string;
  details?: {
    tinyfish_goal?: string;
    url_visited?: string;
    evidence?: string[];
    raw_data?: Record<string, unknown>;
    agent_reasoning?: string;
  };
}

// Timeline message for chat view
export interface TimelineMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
  eventType?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalysisState {
  phase: AppPhase;
  sessionId?: string;
  userMessage: string;
  classification?: {
    scamType: ScamType;
    confidence: number;
    summary: string;
  };
  followUpQuestions: FollowUpQuestion[];
  followUpAnswers: Record<string, string>;
  checks: CheckState[];
  verdict?: {
    overall: VerdictLevel;
    score: number;
    summary: string;
    checksSummary: CheckSummary[];
  };
  error?: string;
  isStreaming: boolean;
  timelineMessages: TimelineMessage[];
}

// Conversation types for sidebar

export interface ConversationSummary {
  id: string;
  created_at: string;
  input: string;
  scam_type: ScamType;
  verdict: VerdictLevel;
  score: number;
}

export interface ConversationDetail {
  id: string;
  created_at: string;
  input: string;
  scam_type: ScamType;
  verdict: VerdictLevel;
  score: number;
  summary: string;
  events: SSEEvent[];
  context: Record<string, string>;
}

// Icon mapping
export const ICON_MAP: Record<string, string> = {
  globe: 'Globe',
  briefcase: 'Briefcase',
  shield: 'Shield',
  'dollar-sign': 'DollarSign',
  users: 'Users',
  star: 'Star',
  link: 'Link',
  lock: 'Lock',
  'file-text': 'FileText',
  tag: 'Tag',
  'shopping-cart': 'ShoppingCart',
  store: 'Store',
  search: 'Search',
  phone: 'Phone',
};
