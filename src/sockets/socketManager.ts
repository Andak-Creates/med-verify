import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/api/client';
import type { JoinSessionAck, SocketAck } from '@/types/api';

// Last successful join ack per consultation, so screens stacked on top of the
// chat (e.g. the audio-call screen) can reuse iceServers/consultationType
// without re-joining the room.
const joinAckCache = new Map<string, JoinSessionAck>();

/**
 * Singleton Socket.io connection, authenticated with the same JWT as the REST
 * API. Connected while a user is logged in; consultation rooms are joined and
 * left on top of this single connection.
 */
let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  // Reuse any existing instance (connected, connecting, or reconnecting) so
  // that listeners registered elsewhere (e.g. SocketContext) stay attached to
  // the same socket that useChatSession/join_session operate on. Only create
  // a fresh instance after an explicit disconnectSocket() set this to null.
  if (socket) {
    return socket;
  }
  socket = io(API_BASE_URL, {
    auth: { token: `Bearer ${token}` },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  joinAckCache.clear();
}

/** emit with ack, rejecting on `{ error }` acks and on timeout. */
export function emitWithAck<T extends SocketAck = SocketAck>(
  event: string,
  payload: unknown,
  timeoutMs = 10_000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const current = socket;
    if (!current?.connected) {
      reject(new Error('Not connected. Please check your internet connection.'));
      return;
    }
    current.timeout(timeoutMs).emit(event, payload, (err: Error | null, ack: T) => {
      if (err) {
        reject(new Error('The request timed out. Please try again.'));
        return;
      }
      if (ack?.error) {
        reject(new Error(ack.error));
        return;
      }
      resolve(ack);
    });
  });
}

export async function joinSession(consultationId: string): Promise<JoinSessionAck> {
  const ack = await emitWithAck<JoinSessionAck>('join_session', { consultationId });
  joinAckCache.set(consultationId, ack);
  return ack;
}

export function getCachedJoinAck(consultationId: string): JoinSessionAck | undefined {
  return joinAckCache.get(consultationId);
}

export function leaveSession(consultationId: string): void {
  socket?.emit('leave_session', { consultationId });
  joinAckCache.delete(consultationId);
}

export function sendMessage(consultationId: string, message: string, imageUrl?: string | null): Promise<SocketAck> {
  return emitWithAck('send_message', { consultationId, message, imageUrl: imageUrl ?? undefined });
}

export function endSessionViaSocket(consultationId: string): Promise<SocketAck> {
  return emitWithAck('end_session', { consultationId });
}
