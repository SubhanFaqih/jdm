import { io } from 'socket.io-client';

console.log('Connecting to Socket.io server on http://backend:5000...');
const socket = io('http://backend:5000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Successfully connected to socket server!');
  console.log('Sending request-prayer-state event...');
  socket.emit('request-prayer-state');
});

socket.on('prayer-state', (data) => {
  console.log('Received prayer-state update:');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

socket.on('disconnect', () => {
  console.log('Disconnected.');
});

// Run for 5 seconds then exit
setTimeout(() => {
  console.log('Exiting test client.');
  socket.disconnect();
  process.exit(0);
}, 5000);
