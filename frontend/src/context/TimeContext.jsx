import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TimeContext = createContext(null);

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

export const TimeProvider = ({ children }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Single global interval for the entire application
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeData = useMemo(() => {
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\./g, ':');

    const dateStringGregorian = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const dateStringHijri = now.toLocaleDateString('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const pad = (n) => n.toString().padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return {
      now,
      timeString,
      dateStringGregorian,
      dateStringHijri,
      todayStr,
    };
  }, [now]);

  return (
    <TimeContext.Provider value={timeData}>
      {children}
    </TimeContext.Provider>
  );
};
