import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server relative to current location.
    // In development, this gets proxied via vite.config.js to http://localhost:5000.
    const socketInstance = io({
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to real-time sync server');
    });

    socketInstance.on('data-updated', (data) => {
      console.log(`Received real-time update event for target: ${data.target}`, data);
      
      const queryMap = {
        'profile-masjid': ['profileMasjid'],
        'jadwal-khotib': ['jadwalKhotib'],
        'ustadz': ['ustadz'],
        'jws': ['jws'],
        'hadist': ['Hadist', 'hadistThemes'],
        'kas': ['kasLogs', 'kasStats', 'activeProgramDonasi'],
        'donasi': ['programDonasi', 'activeProgramDonasi', 'programDonasiList']
      };

      const keysToInvalidate = queryMap[data.target];
      if (keysToInvalidate) {
        keysToInvalidate.forEach(key => {
          console.log(`Invalidating TanStack Query key: ${key}`);
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from real-time sync server');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
