import { useTime } from '../context/TimeContext';

/**
 * Custom hook to get the current real-time clock and formatted dates.
 * Refactored to use the centralized TimeContext instead of an internal interval.
 */
export function useCurrentTime() {
  const { timeString, dateStringGregorian, dateStringHijri } = useTime();

  return {
    timeString,
    dateStringGregorian,
    dateStringHijri,
  };
}
