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
import {onApiKeySaved} from "./settingsEvents";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

/**
 * After an API key is saved, ignore incoming 429 events for this long so
 * stale in-flight requests don't immediately re-trigger the drawer.
 */
const API_KEY_GRACE_MS = 10_000;

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
  const suppressUntilRef = useRef<number>(0);

  useEffect(() => {
    return onRateLimit(() => {
      if (Date.now() < suppressUntilRef.current) return;
      setRateLimitedAt(Date.now());
      setDismissed(false);
    });
  }, []);

  useEffect(() => {
    return onApiKeySaved(() => {
      suppressUntilRef.current = Date.now() + API_KEY_GRACE_MS;
      setRateLimitedAt(null);
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
