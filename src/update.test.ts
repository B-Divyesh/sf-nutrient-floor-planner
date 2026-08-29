import { describe, expect, it, vi } from 'vitest';
import { applyWaitingServiceWorkerUpdate } from './update';

describe('service worker updates', () => {
  it('waits for the new controller before reloading', () => {
    let controllerChange: (() => void) | undefined;
    const serviceWorkers = {
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        controllerChange = typeof listener === 'function' ? () => listener(new Event('controllerchange')) : () => listener.handleEvent(new Event('controllerchange'));
      }
    } as unknown as ServiceWorkerContainer;
    const waitingWorker = { postMessage: vi.fn() } as unknown as ServiceWorker;
    const reload = vi.fn();

    applyWaitingServiceWorkerUpdate(serviceWorkers, waitingWorker, reload);

    expect(waitingWorker.postMessage).toHaveBeenCalledWith('SKIP_WAITING');
    expect(reload).not.toHaveBeenCalled();
    controllerChange?.();
    expect(reload).toHaveBeenCalledOnce();
  });
});
