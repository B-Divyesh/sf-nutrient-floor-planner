/** Reload only after the newly activated worker controls this page. */
export function applyWaitingServiceWorkerUpdate(
  serviceWorkers: ServiceWorkerContainer,
  waitingWorker: ServiceWorker,
  reload: () => void
) {
  serviceWorkers.addEventListener('controllerchange', reload, { once: true });
  waitingWorker.postMessage('SKIP_WAITING');
}
