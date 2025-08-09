// lib/socket.ts
import { io } from 'socket.io-client';

// Prefer explicit backend URL if provided, fallback to sensible defaults
const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/?api\/?$/, '')
const SOCKET_URL = backendBase
  ? backendBase
  : (process.env.NODE_ENV === 'production'
      ? 'https://restaurant-management-o4sl.onrender.com'
      : 'http://localhost:5000');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  // Avoid XHR polling issues by using websocket-only
  transports: ['websocket'],
  upgrade: false,
  withCredentials: true,
  path: '/socket.io',
});

// Add event listeners for connection status
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Helper to ensure connection before emitting joins
export async function ensureSocketConnected(): Promise<void> {
  if (socket.connected) return;
  return new Promise((resolve, reject) => {
    const onConnect = () => {
      socket.off('connect_error', onError);
      resolve();
    };
    const onError = (err: unknown) => {
      socket.off('connect', onConnect);
      reject(err);
    };
    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
    socket.connect();
  });
}