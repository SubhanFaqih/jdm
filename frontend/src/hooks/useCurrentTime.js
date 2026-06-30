import { useState, useEffect } from 'react';

/**
 * Custom hook to get the current real-time clock and formatted dates.
 */
export function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\./g, ':');
  };

  const formatDateGregorian = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Very basic hijri formatter (for actual production, use a specialized library)
  const formatDateHijri = (date) => {
    return date.toLocaleDateString('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return {
    timeString: formatTime(time),
    dateStringGregorian: formatDateGregorian(time),
    dateStringHijri: formatDateHijri(time),
  };
}
