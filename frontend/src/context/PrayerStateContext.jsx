import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useOfflineSchedule } from '../hooks/useOfflineSchedule';
import { useActiveProfile } from '../hooks/useActiveProfile';

const PrayerStateContext = createContext(null);

const ADZAN_DURATION = 3 * 60 * 1000; // 3 minutes in ms

export const usePrayerState = () => {
  const context = useContext(PrayerStateContext);
  if (!context) {
    throw new Error('usePrayerState must be used within a PrayerStateProvider');
  }
  return context;
};

export const PrayerStateProvider = ({ children }) => {
  const socket = useSocket();
  const { activeProfile } = useActiveProfile();
  const { saveSchedule, getSchedule } = useOfflineSchedule();

  const [state, setState] = useState({
    state: 'IDLE',
    prayer: null,
    nextPrayer: null,
    remaining: 0,
    targetTimestamp: null,
    runningText: '',
    iqomahConfig: null,
    todaySchedule: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  
  const serverTimeOffset = useRef(0);
  const lastStateRef = useRef(state);
  lastStateRef.current = state;

  // Sync initial offset with server
  const syncServerTime = useCallback(async () => {
    try {
      const start = Date.now();
      const res = await fetch('/api/time');
      const data = await res.json();
      if (data.success) {
        const end = Date.now();
        const latency = (end - start) / 2;
        serverTimeOffset.current = data.serverTime - end + latency;
        console.log(`[PrayerState] Server time synced. Offset: ${serverTimeOffset.current}ms (latency: ${latency}ms)`);
      }
    } catch (err) {
      console.warn('[PrayerState] Failed to sync server time via API:', err.message);
    }
  }, []);

  useEffect(() => {
    syncServerTime();
  }, [syncServerTime]);

  // Save active profile to localStorage when it is fetched
  useEffect(() => {
    if (activeProfile) {
      try {
        localStorage.setItem('jdm_offline_profile', JSON.stringify({
          waktu_iqomah: activeProfile.waktu_iqomah,
          durasi_sholat: activeProfile.durasi_sholat,
          running_text: activeProfile.running_text,
          kota: activeProfile.kota
        }));
      } catch (err) {
        console.error('Error saving profile to localStorage:', err);
      }
    }
  }, [activeProfile]);

  // Helper to parse time string "HH:MM" relative to a base Date
  const getPrayerDateLocal = useCallback((baseDate, timeStr) => {
    if (!timeStr || timeStr === '--:--') return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }, []);

  // Compute local fallback state when disconnected
  const computeLocalState = useCallback(() => {
    const pad = (n) => n.toString().padStart(2, '0');
    const localNow = new Date();
    const serverNow = new Date(localNow.getTime() + serverTimeOffset.current);
    
    // Retrieve cached profile
    let cachedProfile = null;
    try {
      const stored = localStorage.getItem('jdm_offline_profile');
      if (stored) cachedProfile = JSON.parse(stored);
    } catch {}

    const profile = activeProfile || cachedProfile;
    const kota = profile?.kota || '';
    
    const todayStr = `${serverNow.getFullYear()}-${pad(serverNow.getMonth() + 1)}-${pad(serverNow.getDate())}`;
    const todaySchedule = getSchedule(kota, todayStr);

    if (!todaySchedule) {
      return {
        state: 'IDLE',
        prayer: null,
        nextPrayer: null,
        remaining: 0,
        targetTimestamp: null,
        runningText: profile?.running_text || '',
        iqomahConfig: profile?.waktu_iqomah || null,
        todaySchedule: null
      };
    }

    const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const iqomahConfig = profile?.waktu_iqomah || { subuh: 15, dzuhur: 10, ashar: 10, maghrib: 7, isya: 10 };
    const sholatDuration = (profile?.durasi_sholat || 5) * 60 * 1000;

    for (const p of prayers) {
      const adzanTimeStr = todaySchedule[p];
      const adzanStart = getPrayerDateLocal(serverNow, adzanTimeStr);
      if (!adzanStart) continue;

      const adzanEnd = new Date(adzanStart.getTime() + ADZAN_DURATION);
      const iqomahDelayMs = (iqomahConfig[p] || 10) * 60 * 1000;
      const iqomahEnd = new Date(adzanStart.getTime() + iqomahDelayMs);
      const sholatEnd = new Date(iqomahEnd.getTime() + sholatDuration);

      const serverNowTime = serverNow.getTime();

      if (serverNowTime >= adzanStart.getTime() && serverNowTime < adzanEnd.getTime()) {
        return {
          state: 'ADZAN',
          prayer: p,
          nextPrayer: null,
          remaining: Math.max(0, Math.ceil((adzanEnd.getTime() - serverNowTime) / 1000)),
          targetTimestamp: adzanEnd.getTime(),
          runningText: profile?.running_text || '',
          iqomahConfig,
          todaySchedule
        };
      }

      if (serverNowTime >= adzanEnd.getTime() && serverNowTime < iqomahEnd.getTime()) {
        return {
          state: 'IQOMAH_COUNTDOWN',
          prayer: p,
          nextPrayer: null,
          remaining: Math.max(0, Math.ceil((iqomahEnd.getTime() - serverNowTime) / 1000)),
          targetTimestamp: iqomahEnd.getTime(),
          runningText: profile?.running_text || '',
          iqomahConfig,
          todaySchedule
        };
      }

      if (serverNowTime >= iqomahEnd.getTime() && serverNowTime < sholatEnd.getTime()) {
        return {
          state: 'SHOLAT',
          prayer: p,
          nextPrayer: null,
          remaining: Math.max(0, Math.ceil((sholatEnd.getTime() - serverNowTime) / 1000)),
          targetTimestamp: sholatEnd.getTime(),
          runningText: profile?.running_text || '',
          iqomahConfig,
          todaySchedule
        };
      }
    }

    // Find next prayer today
    let nextPrayer = null;
    let nextPrayerTime = null;
    for (const p of prayers) {
      const timeStr = todaySchedule[p];
      const prayerTime = getPrayerDateLocal(serverNow, timeStr);
      if (prayerTime && prayerTime.getTime() > serverNow.getTime()) {
        nextPrayer = p;
        nextPrayerTime = prayerTime;
        break;
      }
    }

    // If no next prayer today, fall back to subuh tomorrow (without exact countdown)
    if (!nextPrayer) {
      nextPrayer = 'subuh';
    }

    return {
      state: 'IDLE',
      prayer: null,
      nextPrayer,
      remaining: nextPrayerTime ? Math.max(0, Math.ceil((nextPrayerTime.getTime() - serverNow.getTime()) / 1000)) : 0,
      targetTimestamp: nextPrayerTime ? nextPrayerTime.getTime() : null,
      runningText: profile?.running_text || '',
      iqomahConfig,
      todaySchedule
    };
  }, [activeProfile, getSchedule, getPrayerDateLocal]);

  // Hook into socket connection
  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleConnect = () => {
      setIsConnected(true);
      console.log('[PrayerState] Connected to Socket.io. Requesting state...');
      socket.emit('request-prayer-state');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('[PrayerState] Disconnected from Socket.io.');
    };

    const handlePrayerStateUpdate = (data) => {
      // Sync clock offset using data.serverTime
      if (data.serverTime) {
        serverTimeOffset.current = data.serverTime - Date.now();
      }

      // Save schedule to offline cache if available
      if (data.todaySchedule && (activeProfile?.kota || data.todaySchedule.kabkota)) {
        const kota = activeProfile?.kota || data.todaySchedule.kabkota;
        const pad = (n) => n.toString().padStart(2, '0');
        const now = new Date(Date.now() + serverTimeOffset.current);
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        saveSchedule(kota, todayStr, data.todaySchedule);
      }

      setState({
        state: data.state || 'IDLE',
        prayer: data.prayer || null,
        nextPrayer: data.nextPrayer || null,
        remaining: data.remaining || 0,
        targetTimestamp: data.targetTimestamp || null,
        runningText: data.runningText || '',
        iqomahConfig: data.iqomahConfig || null,
        todaySchedule: data.todaySchedule || null,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('prayer-state', handlePrayerStateUpdate);

    // Initial state request
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('prayer-state', handlePrayerStateUpdate);
    };
  }, [socket, activeProfile, saveSchedule]);

  // Tick loop (every 250ms) to calculate exact countdown and fallback locally if disconnected
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Connected to server: just tick the countdown based on targetTimestamp and serverTimeOffset
        const target = lastStateRef.current.targetTimestamp;
        if (target) {
          const clientNow = Date.now();
          const serverNow = clientNow + serverTimeOffset.current;
          const newRemaining = Math.max(0, Math.ceil((target - serverNow) / 1000));
          
          setState((prev) => {
            if (prev.remaining === newRemaining) return prev;
            return { ...prev, remaining: newRemaining };
          });
        }
      } else {
        // Disconnected from server: run local state machine using offline schedule
        const localComputed = computeLocalState();
        setState(localComputed);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isConnected, computeLocalState]);

  // Periodic re-sync every 5 minutes when connected
  useEffect(() => {
    if (!isConnected || !socket) return;

    const interval = setInterval(() => {
      console.log('[PrayerState] Periodic sync requested...');
      socket.emit('request-prayer-state');
      syncServerTime();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected, socket, syncServerTime]);

  return (
    <PrayerStateContext.Provider value={{ ...state, isConnected }}>
      {children}
    </PrayerStateContext.Provider>
  );
};
