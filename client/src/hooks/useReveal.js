import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element when it scrolls into view (one-shot).
 * Returns a ref to attach and a boolean for the visible state.
 */
export default function useReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = options;
  const ref = useRef(null);
  // If IntersectionObserver is unavailable (SSR / old browsers), show immediately.
  const [visible, setVisible] = useState(
    typeof IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
