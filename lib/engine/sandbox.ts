const SANDBOX_TIMEOUT_MS = 10_000;

export function decodeViaSandbox(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.cssText = 'display:none;width:0;height:0;border:0;';
    iframe.src = '/sandbox.html';

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Sandbox decode timed out after 10s'));
    }, SANDBOX_TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('message', handler);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }

    function handler(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      cleanup();
      if (event.data?.type === 'result') {
        resolve(event.data.output as string);
      } else {
        reject(new Error((event.data?.message as string) || 'Sandbox returned an error'));
      }
    }

    window.addEventListener('message', handler);

    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: 'decode', code }, '*');
    };

    document.body.appendChild(iframe);
  });
}
