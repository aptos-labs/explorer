import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {onRateLimit} from "./rateLimitEvents";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

interface RateLimitContextValue {
  isRateLimited: boolean;
  rateLimitedAt: number | null;
  dismissRateLimit: () => void;
}

const RateLimitContext = createContext<RateLimitContextValue>({
  isRateLimited: false,
  rateLimitedAt: null,
  dismissRateLimit: () => {},
});

export function RateLimitProvider({children}: {children: ReactNode}) {
  const [rateLimitedAt, setRateLimitedAt] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onRateLimit(() => {
      setRateLimitedAt(Date.now());
      setDismissed(false);
    });
  }, []);

  useEffect(() => {
    if (rateLimitedAt === null) return;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    const remaining = RATE_LIMIT_WINDOW_MS - (Date.now() - rateLimitedAt);

    if (remaining <= 0) {
      setRateLimitedAt(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      setRateLimitedAt(null);
      timerRef.current = null;
    }, remaining);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [rateLimitedAt]);

  const dismissRateLimit = useCallback(() => {
    setDismissed(true);
  }, []);

  const isRateLimited = rateLimitedAt !== null && !dismissed;

  return (
    <RateLimitContext.Provider
      value={{isRateLimited, rateLimitedAt, dismissRateLimit}}
    >
      {children}
    </RateLimitContext.Provider>
  );
}

export function useRateLimit() {
  return useContext(RateLimitContext);
}
