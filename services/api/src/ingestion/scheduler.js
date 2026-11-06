export function startScheduler(
  job,
  {
    enabled = false,
    interval = 1800000,
    setTimer = setInterval,
    clearTimer = clearInterval,
    logger = console,
  } = {},
) {
  if (!Number.isInteger(interval) || interval < 60000)
    throw new Error('INGESTION_INTERVAL_MS must be at least 60000');
  if (!enabled) return () => {};
  let stopped = false;
  let running = false;
  const timer = setTimer(async () => {
    if (stopped || running) return;
    running = true;
    try {
      await job.run();
    } catch {
      // Avoid unhandled rejections and never log upstream credentials/error text.
      logger.error(JSON.stringify({ event: 'scheduled_ingestion_failed' }));
    } finally {
      running = false;
    }
  }, interval);
  timer?.unref?.();
  return () => {
    stopped = true;
    clearTimer(timer);
  };
}
