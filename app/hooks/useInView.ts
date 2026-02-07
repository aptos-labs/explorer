import {useEffect, useRef, useState, useCallback} from "react";

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Lightweight replacement for react-intersection-observer's useInView.
 * Uses the native IntersectionObserver API.
 */
export function useInView(options?: UseInViewOptions) {
  const [inView, setInView] = useState(true);
  const nodeRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      // Clean up old observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      nodeRef.current = node;

      if (!node) return;

      // SSR guard
      if (typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        {
          rootMargin: options?.rootMargin,
          threshold: options?.threshold,
        },
      );

      observerRef.current.observe(node);
    },
    [options?.rootMargin, options?.threshold],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return {ref, inView};
}
