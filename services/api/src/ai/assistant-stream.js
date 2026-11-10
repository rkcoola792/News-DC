import { assistantRequest } from './assistant.js';
import { AIError } from './limits.js';

// Only validated answers leave the server. Progress events can arrive during generation.
export async function streamAssistant(req, res, assistant, logger = console) {
  const input = assistantRequest.parse(req.body);
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  let connected = true;
  const send = (event, data) => {
    if (connected && !res.destroyed)
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const heartbeat = setInterval(() => {
    if (connected && !res.destroyed) res.write(': keep-alive\n\n');
  }, 15000);
  heartbeat.unref?.();
  const close = () => {
    connected = false;
    clearInterval(heartbeat);
  };
  res.once('close', close);
  try {
    send('status', { message: 'Searching indexed sources…' });
    const answer = await assistant.ask(input, {
      onStatus: (message) => send('status', { message }),
    });
    send('answer', answer);
    send('done', {});
  } catch (error) {
    const known = error instanceof AIError;
    send('error', {
      code: known ? error.code : 'ASSISTANT_FAILED',
      message: known ? error.message : 'The answer could not be completed. Please try again.',
    });
    logger.error(
      JSON.stringify({
        event: 'assistant_stream_failed',
        code: known ? error.code : 'ASSISTANT_FAILED',
        requestId: req.requestId,
      }),
    );
  } finally {
    close();
    res.off('close', close);
    if (!res.destroyed) res.end();
  }
}
