const SANDBOX_TIMEOUT_MS = 120_000;

let messageIdCounter = 0;

export function decodeViaSandbox(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = `sandbox-${Date.now()}-${++messageIdCounter}`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;';
    iframe.src = '/sandbox.html';

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Sandbox decode timed out after 15s'));
    }, SANDBOX_TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('message', handler);
      // Defer removal so the iframe isn't destroyed mid-postMessage
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 100);
    }

    function handler(event: MessageEvent) {
      // Match by message ID instead of relying on event.source === iframe.contentWindow
      // because sandboxed iframes can have quirky source references
      const data = event.data;
      if (!data || data.id !== id) return;

      cleanup();

      if (data.type === 'result' && typeof data.output === 'string') {
        resolve(data.output);
      } else {
        reject(
          new Error(
            (data.message as string) ||
              'Sandbox returned an error — no decoded output was captured'
          )
        );
      }
    }

    window.addEventListener('message', handler);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.postMessage({ type: 'decode', code, id }, '*');
      } catch {
        cleanup();
        reject(new Error('Failed to postMessage to sandbox iframe'));
      }
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error('Sandbox iframe failed to load'));
    };

    document.body.appendChild(iframe);
  });
}
