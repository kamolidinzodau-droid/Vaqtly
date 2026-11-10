import { useCallback, useEffect, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showError = useCallback((msg: string) => setMessage(msg), []);
  const dismiss = useCallback(() => setMessage(null), []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  return { message, showError, dismiss };
}
