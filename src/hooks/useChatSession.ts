import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';
import { useSocket } from '@/context/SocketContext';
import * as consultationsService from '@/services/consultations.service';
import {
  endSessionViaSocket,
  joinSession,
  leaveSession,
  sendMessage as sendMessageViaSocket,
} from '@/sockets/socketManager';
import type {
  ChatMessage,
  ConsultationStatus,
  ConsultationType,
  IceServer,
  ParticipantEvent,
  SessionEndedEvent,
  SessionStartedEvent,
  UserRole,
} from '@/types/api';

interface ChatSessionState {
  status: ConsultationStatus | null;
  role: UserRole | null;
  consultationType: ConsultationType | null;
  iceServers: IceServer[];
  messages: ChatMessage[];
  participantOnline: boolean;
  sessionEnded: boolean;
  isJoining: boolean;
  isSending: boolean;
  error: string | null;
}

/**
 * Drives a live consultation session: joins the Socket.io room, loads the
 * persisted chat history, streams new messages, tracks the session lifecycle
 * (started/ended, participant presence), and exposes send/end actions.
 * Leaves the room automatically on unmount and re-joins after reconnects.
 */
export function useChatSession(consultationId: string | undefined) {
  const { socket, isConnected } = useSocket();
  const [state, setState] = useState<ChatSessionState>({
    status: null,
    role: null,
    consultationType: null,
    iceServers: [],
    messages: [],
    participantOnline: false,
    sessionEnded: false,
    isJoining: true,
    isSending: false,
    error: null,
  });
  const joinedRef = useRef(false);

  // Join the room (and re-join after a reconnect) + load history.
  useEffect(() => {
    if (!consultationId || !socket || !isConnected) return;
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, isJoining: !joinedRef.current, error: null }));
      try {
        const [ack, history] = await Promise.all([
          joinSession(consultationId),
          consultationsService.getMessages(consultationId),
        ]);
        if (cancelled) return;
        joinedRef.current = true;
        setState((s) => ({
          ...s,
          status: ack.status ?? s.status,
          role: ack.role ?? s.role,
          consultationType: ack.consultationType ?? s.consultationType,
          iceServers: ack.iceServers ?? s.iceServers,
          participantOnline: ack.counterpartOnline ?? s.participantOnline,
          messages: history,
          isJoining: false,
        }));
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          isJoining: false,
          error: err instanceof Error ? err.message : getApiErrorMessage(err),
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultationId, socket, isConnected]);

  // Leave the room when the screen unmounts.
  useEffect(() => {
    return () => {
      if (consultationId && joinedRef.current) {
        leaveSession(consultationId);
        joinedRef.current = false;
      }
    };
  }, [consultationId]);

  // Live events.
  useEffect(() => {
    if (!socket || !consultationId) return;

    const onNewMessage = (message: ChatMessage) => {
      setState((s) =>
        s.messages.some((m) => m.id === message.id)
          ? s
          : { ...s, messages: [...s.messages, message] },
      );
    };
    const onSessionStarted = (event: SessionStartedEvent) => {
      if (event.consultationId !== consultationId) return;
      setState((s) => ({ ...s, status: 'IN_PROGRESS' }));
    };
    const onSessionEnded = (event: SessionEndedEvent) => {
      if (event.consultationId !== consultationId) return;
      setState((s) => ({ ...s, status: 'COMPLETED', sessionEnded: true }));
    };
    const onParticipantJoined = (event: ParticipantEvent) => {
      if (event.consultationId !== consultationId) return;
      setState((s) => ({ ...s, participantOnline: true }));
    };
    const onParticipantLeft = (event: ParticipantEvent) => {
      if (event.consultationId !== consultationId) return;
      setState((s) => ({ ...s, participantOnline: false }));
    };

    socket.on('new_message', onNewMessage);
    socket.on('session_started', onSessionStarted);
    socket.on('session_ended', onSessionEnded);
    socket.on('participant_joined', onParticipantJoined);
    socket.on('participant_left', onParticipantLeft);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('session_started', onSessionStarted);
      socket.off('session_ended', onSessionEnded);
      socket.off('participant_joined', onParticipantJoined);
      socket.off('participant_left', onParticipantLeft);
    };
  }, [socket, consultationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!consultationId || !message) return;
      setState((s) => ({ ...s, isSending: true, error: null }));
      try {
        // The server echoes the persisted message back via `new_message`.
        await sendMessageViaSocket(consultationId, message);
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : 'Could not send your message.',
        }));
        throw err;
      } finally {
        setState((s) => ({ ...s, isSending: false }));
      }
    },
    [consultationId],
  );

  const endSession = useCallback(async () => {
    if (!consultationId) return;
    await endSessionViaSocket(consultationId);
    setState((s) => ({ ...s, status: 'COMPLETED', sessionEnded: true }));
  }, [consultationId]);

  return { ...state, isConnected, sendMessage, endSession };
}
