const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadPromise: Promise<void> | null = null;

export const getRazorpayKeyId = () => {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  return keyId?.trim() || '';
};

export const loadRazorpayScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only be used in a browser environment.'));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_URL}"]`);

    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is not available.');
  }
  const instance = new window.Razorpay(options);
  instance.open();
};
