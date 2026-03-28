import type { AnalyzeRequest, SSEEvent } from '../types';

const API_BASE = '/api';

export async function startAnalysis(
  request: AnalyzeRequest,
  onEvent: (event: SSEEvent) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr) {
            try {
              const event: SSEEvent = JSON.parse(jsonStr);
              onEvent(event);
            } catch {
              console.warn('Failed to parse SSE event:', jsonStr);
            }
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data:')) {
      const jsonStr = buffer.trim().slice(5).trim();
      if (jsonStr) {
        try {
          const event: SSEEvent = JSON.parse(jsonStr);
          onEvent(event);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    const message = err instanceof Error ? err.message : 'Unknown error';
    onError(message);
  }
}
