import { useCallback, useRef, useState } from 'react';
import type {
  AnalysisState,
  AppPhase,
  CheckState,
  SSEEvent,
} from '../types';
import { startAnalysis } from '../lib/api';
import { runMockChecks, runMockStream } from '../lib/mockStream';

const MOCK_MODE = import.meta.env.VITE_MOCK === 'true';

const initialState: AnalysisState = {
  phase: 'input',
  userMessage: '',
  followUpQuestions: [],
  followUpAnswers: {},
  checks: [],
  isStreaming: false,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const updateState = useCallback(
    (updates: Partial<AnalysisState>) =>
      setState((prev) => ({ ...prev, ...updates })),
    []
  );

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'classification':
        setState((prev) => ({
          ...prev,
          classification: {
            scamType: event.scam_type,
            confidence: event.confidence,
            summary: event.summary,
          },
        }));
        break;

      case 'follow_up':
        setState((prev) => ({
          ...prev,
          phase: 'follow_up',
          followUpQuestions: event.questions,
          isStreaming: false,
        }));
        break;

      case 'check_started':
        setState((prev) => {
          const existing = prev.checks.find((c) => c.id === event.check_id);
          if (existing) return prev;
          const newCheck: CheckState = {
            id: event.check_id,
            name: event.name,
            icon: event.icon,
            status: 'running',
          };
          return {
            ...prev,
            phase: 'analyzing',
            checks: [...prev.checks, newCheck],
          };
        });
        break;

      case 'check_progress':
        setState((prev) => ({
          ...prev,
          checks: prev.checks.map((c) =>
            c.id === event.check_id
              ? {
                  ...c,
                  progressMessage: event.message,
                  browserUrl: event.browser_url || c.browserUrl,
                }
              : c
          ),
        }));
        break;

      case 'check_complete':
        setState((prev) => ({
          ...prev,
          checks: prev.checks.map((c) =>
            c.id === event.check_id
              ? {
                  ...c,
                  status: event.status,
                  summary: event.summary,
                  details: event.details,
                  progressMessage: undefined,
                }
              : c
          ),
        }));
        break;

      case 'verdict':
        setState((prev) => ({
          ...prev,
          phase: 'verdict',
          verdict: {
            overall: event.overall,
            score: event.score,
            summary: event.summary,
            checksSummary: event.checks_summary,
          },
        }));
        break;

      case 'error':
        setState((prev) => ({
          ...prev,
          error: event.message,
          isStreaming: false,
        }));
        break;

      case 'done':
        setState((prev) => ({
          ...prev,
          isStreaming: false,
        }));
        break;
    }
  }, []);

  const analyze = useCallback(
    async (message: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        ...initialState,
        userMessage: message,
        phase: 'input',
        isStreaming: true,
      });

      if (MOCK_MODE) {
        await runMockStream(handleEvent, controller.signal);
      } else {
        await startAnalysis(
          { message },
          handleEvent,
          (error) => updateState({ error, isStreaming: false }),
          controller.signal
        );
      }
    },
    [handleEvent, updateState]
  );

  const submitFollowUp = useCallback(
    async (answers: Record<string, string>) => {
      setState((prev) => ({
        ...prev,
        followUpAnswers: answers,
        phase: 'analyzing',
        isStreaming: true,
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      if (MOCK_MODE) {
        await runMockChecks(handleEvent, controller.signal);
      } else {
        await startAnalysis(
          {
            message: state.userMessage,
            session_id: state.sessionId,
            context: answers,
          },
          handleEvent,
          (error) => updateState({ error, isStreaming: false }),
          controller.signal
        );
      }
    },
    [handleEvent, state.userMessage, state.sessionId, updateState]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  const setPhase = useCallback(
    (phase: AppPhase) => updateState({ phase }),
    [updateState]
  );

  return {
    state,
    analyze,
    submitFollowUp,
    reset,
    setPhase,
  };
}
