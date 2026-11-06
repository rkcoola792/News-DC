export function startScheduler(
  job,
  { enabled = false, interval = 1800000, setTimer = setInterval, clearTimer = clearInterval } = {},
) {
  if (!Number.isInteger(interval) || interval < 60000)
    throw new Error('INGESTION_INTERVAL_MS must be at least 60000');
  if (!enabled) return () => {};
  const timer = setTimer(() => {
    void job.run();
  }, interval);
  timer?.unref?.();
  return () => clearTimer(timer);
}
