import { useCallback, useRef, useState } from 'react';
import type {
  AnalysisState,
  AppPhase,
  CheckState,
  ConversationDetail,
  SSEEvent,
  TimelineMessage,
} from '../types';
import { startAnalysis } from '../lib/api';
import { runMockChecks, runMockStream } from '../lib/mockStream';

const MOCK_MODE = import.meta.env.VITE_MOCK === 'true';

let messageCounter = 0;
function nextMsgId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

const initialState: AnalysisState = {
  phase: 'input',
  userMessage: '',
  followUpQuestions: [],
  followUpAnswers: {},
  checks: [],
  isStreaming: false,
  timelineMessages: [],
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const updateState = useCallback(
    (updates: Partial<AnalysisState>) =>
      setState((prev) => ({ ...prev, ...updates })),
    []
  );

  const addTimelineMessage = useCallback(
    (msg: Omit<TimelineMessage, 'id' | 'timestamp'>) => {
      const full: TimelineMessage = {
        ...msg,
        id: nextMsgId(),
        timestamp: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        timelineMessages: [...prev.timelineMessages, full],
      }));
    },
    []
  );

  const handleEvent = useCallback(
    (event: SSEEvent) => {
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
          addTimelineMessage({
            role: 'bot',
            content: `I've identified this as a **${event.scam_type.replace(/_/g, ' ')}** with **${Math.round(event.confidence * 100)}%** confidence. ${event.summary}`,
            eventType: 'classification',
            metadata: {
              scamType: event.scam_type,
              confidence: event.confidence,
            },
          });
          break;

        case 'follow_up':
          setState((prev) => ({
            ...prev,
            phase: 'follow_up',
            followUpQuestions: event.questions,
            isStreaming: false,
          }));
          addTimelineMessage({
            role: 'bot',
            content: 'I need a few more details to run deeper checks.',
            eventType: 'follow_up',
          });
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
          addTimelineMessage({
            role: 'system',
            content: `Running check: ${event.name}`,
            eventType: 'check_started',
            metadata: { checkId: event.check_id },
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
          addTimelineMessage({
            role: 'bot',
            content: event.summary,
            eventType: 'check_complete',
            metadata: {
              checkId: event.check_id,
              status: event.status,
            },
          });
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
          addTimelineMessage({
            role: 'bot',
            content: event.summary,
            eventType: 'verdict',
            metadata: {
              overall: event.overall,
              score: event.score,
            },
          });
          break;

        case 'error':
          setState((prev) => ({
            ...prev,
            error: event.message,
            isStreaming: false,
          }));
          addTimelineMessage({
            role: 'system',
            content: `Error: ${event.message}`,
            eventType: 'error',
          });
          break;

        case 'done':
          setState((prev) => ({
            ...prev,
            isStreaming: false,
          }));
          break;
      }
    },
    [addTimelineMessage]
  );

  const analyze = useCallback(
    async (message: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: TimelineMessage = {
        id: nextMsgId(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
        eventType: 'user_input',
      };

      setState({
        ...initialState,
        userMessage: message,
        phase: 'input',
        isStreaming: true,
        timelineMessages: [userMsg],
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
      // Add user's follow-up answers to timeline
      const answerText = Object.entries(answers)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      if (answerText) {
        addTimelineMessage({
          role: 'user',
          content: answerText,
          eventType: 'follow_up_answer',
        });
      }

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
    [handleEvent, state.userMessage, state.sessionId, updateState, addTimelineMessage]
  );

  const sendFollowUpChat = useCallback(
    async (message: string) => {
      addTimelineMessage({
        role: 'user',
        content: message,
        eventType: 'chat_followup',
      });

      setState((prev) => ({ ...prev, isStreaming: true }));

      const controller = new AbortController();
      abortRef.current = controller;

      if (MOCK_MODE) {
        // In mock mode, simulate a bot response
        await new Promise((r) => setTimeout(r, 1200));
        if (!controller.signal.aborted) {
          addTimelineMessage({
            role: 'bot',
            content: `That's a great question about this analysis. Based on the checks we ran, I'd recommend being very cautious. The red flags we identified — especially around the domain age and missing company presence — are strong indicators. If you've already shared any personal information, consider monitoring your accounts and reporting to your local anti-scam authority.`,
            eventType: 'chat_response',
          });
          setState((prev) => ({ ...prev, isStreaming: false }));
        }
      } else {
        await startAnalysis(
          {
            message,
            session_id: state.sessionId,
          },
          handleEvent,
          (error) => updateState({ error, isStreaming: false }),
          controller.signal
        );
      }
    },
    [handleEvent, state.sessionId, updateState, addTimelineMessage]
  );

  const loadConversation = useCallback(
    (conversation: ConversationDetail) => {
      abortRef.current?.abort();

      // Build timeline messages from events
      const timeline: TimelineMessage[] = [
        {
          id: nextMsgId(),
          role: 'user',
          content: conversation.input,
          timestamp: new Date(conversation.created_at).getTime(),
          eventType: 'user_input',
        },
      ];

      // Reset to initial then replay all events to build final state
      let newState: AnalysisState = {
        ...initialState,
        userMessage: conversation.input,
        phase: 'analyzing',
        isStreaming: false,
        timelineMessages: [],
      };

      for (const event of conversation.events) {
        const evt = event as SSEEvent;
        switch (evt.type) {
          case 'classification':
            newState = {
              ...newState,
              classification: {
                scamType: evt.scam_type,
                confidence: evt.confidence,
                summary: evt.summary,
              },
            };
            timeline.push({
              id: nextMsgId(),
              role: 'bot',
              content: `I've identified this as a **${evt.scam_type.replace(/_/g, ' ')}** with **${Math.round(evt.confidence * 100)}%** confidence. ${evt.summary}`,
              timestamp: new Date(conversation.created_at).getTime() + timeline.length * 100,
              eventType: 'classification',
              metadata: { scamType: evt.scam_type, confidence: evt.confidence },
            });
            break;

          case 'check_started': {
            const existing = newState.checks.find((c) => c.id === evt.check_id);
            if (!existing) {
              newState = {
                ...newState,
                phase: 'analyzing',
                checks: [
                  ...newState.checks,
                  {
                    id: evt.check_id,
                    name: evt.name,
                    icon: evt.icon,
                    status: 'running',
                  },
                ],
              };
              timeline.push({
                id: nextMsgId(),
                role: 'system',
                content: `Running check: ${evt.name}`,
                timestamp: new Date(conversation.created_at).getTime() + timeline.length * 100,
                eventType: 'check_started',
                metadata: { checkId: evt.check_id },
              });
            }
            break;
          }

          case 'check_complete':
            newState = {
              ...newState,
              checks: newState.checks.map((c) =>
                c.id === evt.check_id
                  ? {
                      ...c,
                      status: evt.status,
                      summary: evt.summary,
                      details: evt.details,
                      progressMessage: undefined,
                    }
                  : c
              ),
            };
            timeline.push({
              id: nextMsgId(),
              role: 'bot',
              content: evt.summary,
              timestamp: new Date(conversation.created_at).getTime() + timeline.length * 100,
              eventType: 'check_complete',
              metadata: { checkId: evt.check_id, status: evt.status },
            });
            break;

          case 'verdict':
            newState = {
              ...newState,
              phase: 'verdict',
              verdict: {
                overall: evt.overall,
                score: evt.score,
                summary: evt.summary,
                checksSummary: evt.checks_summary,
              },
            };
            timeline.push({
              id: nextMsgId(),
              role: 'bot',
              content: evt.summary,
              timestamp: new Date(conversation.created_at).getTime() + timeline.length * 100,
              eventType: 'verdict',
              metadata: { overall: evt.overall, score: evt.score },
            });
            break;

          case 'error':
            newState = {
              ...newState,
              error: evt.message,
            };
            timeline.push({
              id: nextMsgId(),
              role: 'system',
              content: `Error: ${evt.message}`,
              timestamp: new Date(conversation.created_at).getTime() + timeline.length * 100,
              eventType: 'error',
            });
            break;
        }
      }

      newState.timelineMessages = timeline;
      setState(newState);
    },
    []
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
    sendFollowUpChat,
    reset,
    setPhase,
    loadConversation,
  };
}
