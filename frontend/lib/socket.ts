// lib/socket.ts
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-domain.com'
  : 'http://localhost:5000'; // Match your Express server port

export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll manually connect in the component
});