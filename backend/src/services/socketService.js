import { Server } from 'socket.io';
import { getCachedPrayerState } from './prayerStateBroadcaster.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Immediately send cached state if available
    const cachedState = getCachedPrayerState();
    if (cachedState) {
      socket.emit('prayer-state', cachedState);
    }

    socket.on('request-prayer-state', () => {
      const state = getCachedPrayerState();
      if (state) {
        socket.emit('prayer-state', state);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
