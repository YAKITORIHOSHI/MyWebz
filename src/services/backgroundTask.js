export const scheduleBackgroundTask = (task, timeout = 250) => {
  if (typeof window === 'undefined') {
    const timer = setTimeout(task, 0);
    return () => clearTimeout(timer);
  }

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(task, 0);
  return () => window.clearTimeout(id);
};
