// hooks/useDebouncedEffect.js
import { useEffect, useRef } from "react";

/**
 * Käivita fn alles siis, kui deped on olnud muutumatud 'delay' ms vältel.
 * Väga hea URL-i "shallow replace" debouncimiseks.
 */
export default function useDebouncedEffect(fn, deps, delay = 250) {
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(fn, delay);
    return () => clearTimeout(t.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
