let worker;
let nextRequestId = 0;
const pending = new Map();

const getWorker = () => {
  if (typeof Worker === 'undefined') return null;
  if (worker) return worker;

  worker = new Worker(new URL('../workers/dataNormalizer.worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (event) => {
    const { requestId, success, result, error } = event.data || {};
    const request = pending.get(requestId);
    if (!request) return;
    pending.delete(requestId);
    if (success) request.resolve(result);
    else request.reject(new Error(error || 'Background data normalization failed.'));
  };
  worker.onerror = (error) => {
    pending.forEach(({ reject }) => reject(error));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
};

export const normalizeSnapshotInBackground = (collection, value, fallback) => {
  const activeWorker = getWorker();
  if (!activeWorker) return Promise.resolve().then(() => fallback(value));

  const requestId = ++nextRequestId;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    try {
      activeWorker.postMessage({ requestId, collection, value });
    } catch (error) {
      pending.delete(requestId);
      reject(error);
    }
  }).catch(() => fallback(value));
};
