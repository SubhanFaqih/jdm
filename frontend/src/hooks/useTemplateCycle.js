import { useState, useEffect } from 'react';

/**
 * Custom hook to cycle through template indices at a given interval.
 * @param {number} totalTemplates - Total number of templates to cycle through.
 * @param {number} intervalMs - Interval in milliseconds.
 */
export function useTemplateCycle(totalTemplates, intervalMs = 30000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTemplates);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [totalTemplates, intervalMs]);

  return currentIndex;
}
