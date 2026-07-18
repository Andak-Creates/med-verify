import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import type { CallSignalPayload, IceServer } from '@/types/api';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connecting' | 'in_call' | 'ended';

/**
 * WebRTC audio-call signaling over the consultation's Socket.io room
 * (`call_offer` / `call_answer` / `ice_candidate` / `call_ended` are pure
 * relays on the backend). The RTCPeerConnection is built from the
 * backend-provided `iceServers` (returned by `join_session`) — never
 * hardcoded.
 *
 * WebRTC APIs (RTCPeerConnection/getUserMedia) exist on web out of the box;
 * on native they require a dev build with react-native-webrtc. When the APIs
 * are missing, `webrtcSupported` is false and call buttons should be hidden.
 */
export function useCallSignaling(consultationId: string | undefined, iceServers: IceServer[]) {
  const { socket } = useSocket();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const webrtcSupported =
    typeof globalThis.RTCPeerConnection === 'function' &&
    typeof globalThis.navigator?.mediaDevices?.getUserMedia === 'function';

  const cleanupPeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStream(null);
    pendingOfferRef.current = null;
    candidateQueueRef.current = [];
  }, []);

  const createPeer = useCallback(async (): Promise<RTCPeerConnection> => {
    const peer = new RTCPeerConnection({ iceServers });
    peerRef.current = peer;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? null);
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('ice_candidate', { consultationId, candidate: event.candidate.toJSON() });
      }
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') setCallStatus('in_call');
      if (peer.connectionState === 'failed') {
        setError('The call connection failed. Please try again.');
        setCallStatus('ended');
      }
    };
    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'connected' || peer.iceConnectionState === 'completed') {
        setCallStatus('in_call');
      }
      if (peer.iceConnectionState === 'failed') {
        setError('The call connection failed. Please try again.');
        setCallStatus('ended');
      }
    };
    return peer;
  }, [iceServers, socket, consultationId]);

  // Incoming signaling.
  useEffect(() => {
    if (!socket || !consultationId) return;

    const onOffer = (payload: CallSignalPayload) => {
      if (payload.consultationId !== consultationId) return;
      pendingOfferRef.current = payload.sdp as RTCSessionDescriptionInit;
      setCallStatus('ringing');
    };

    const onAnswer = async (payload: CallSignalPayload) => {
      if (payload.consultationId !== consultationId || !peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(payload.sdp as RTCSessionDescriptionInit);
        setCallStatus('connecting');
        
        // Process queued candidates
        while (candidateQueueRef.current.length > 0) {
          const candidate = candidateQueueRef.current.shift();
          if (candidate) await peerRef.current.addIceCandidate(candidate);
        }
      } catch {
        setError('Could not establish the call.');
        setCallStatus('ended');
      }
    };

    const onIceCandidate = async (payload: CallSignalPayload) => {
      if (payload.consultationId !== consultationId || !peerRef.current) return;
      
      const candidateInit = payload.candidate as RTCIceCandidateInit;
      
      if (!peerRef.current.remoteDescription) {
        candidateQueueRef.current.push(candidateInit);
        return;
      }
      
      try {
        await peerRef.current.addIceCandidate(candidateInit);
      } catch {
        // Ignore candidates that arrive after the connection is torn down.
      }
    };

    const onCallEnded = (payload: CallSignalPayload) => {
      if (payload.consultationId !== consultationId) return;
      cleanupPeer();
      setCallStatus('ended');
    };

    socket.on('call_offer', onOffer);
    socket.on('call_answer', onAnswer);
    socket.on('ice_candidate', onIceCandidate);
    socket.on('call_ended', onCallEnded);

    return () => {
      socket.off('call_offer', onOffer);
      socket.off('call_answer', onAnswer);
      socket.off('ice_candidate', onIceCandidate);
      socket.off('call_ended', onCallEnded);
    };
  }, [socket, consultationId, cleanupPeer]);

  // Tear the call down when the screen unmounts.
  useEffect(() => cleanupPeer, [cleanupPeer]);

  // Once a call ends, return to idle after a short delay so this signaling
  // instance is ready to ring for a future call without needing a remount.
  useEffect(() => {
    if (callStatus !== 'ended') return;
    const t = setTimeout(() => setCallStatus('idle'), 1500);
    return () => clearTimeout(t);
  }, [callStatus]);

  // If the active consultation changes (e.g. the user moves to a different
  // consultation's chat), drop any stale peer/ringing state from before.
  const prevConsultationIdRef = useRef(consultationId);
  useEffect(() => {
    if (prevConsultationIdRef.current !== consultationId) {
      cleanupPeer();
      setCallStatus('idle');
      setError(null);
      prevConsultationIdRef.current = consultationId;
    }
  }, [consultationId, cleanupPeer]);

  const startCall = useCallback(async () => {
    if (!consultationId || !socket) return;
    if (!webrtcSupported) {
      setError('Audio calls are not supported on this device build.');
      return;
    }
    setError(null);
    setCallStatus('calling');
    try {
      const peer = await createPeer();
      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      socket.emit('call_offer', { consultationId, sdp: offer });
    } catch {
      cleanupPeer();
      setError('Could not start the call. Check your microphone permissions.');
      setCallStatus('idle');
    }
  }, [consultationId, socket, webrtcSupported, createPeer, cleanupPeer]);

  const answerCall = useCallback(async () => {
    if (!consultationId || !socket || !pendingOfferRef.current) return;
    if (!webrtcSupported) {
      setError('Audio calls are not supported on this device build.');
      return;
    }
    setError(null);
    setCallStatus('connecting');
    try {
      const peer = await createPeer();
      await peer.setRemoteDescription(pendingOfferRef.current);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('call_answer', { consultationId, sdp: answer });
      
      // Process queued candidates
      while (candidateQueueRef.current.length > 0) {
        const candidate = candidateQueueRef.current.shift();
        if (candidate) await peer.addIceCandidate(candidate);
      }
    } catch {
      cleanupPeer();
      setError('Could not answer the call. Check your microphone permissions.');
      setCallStatus('idle');
    }
  }, [consultationId, socket, webrtcSupported, createPeer, cleanupPeer]);

  const setMicEnabled = useCallback((enabled: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }, []);

  const hangUp = useCallback(() => {
    if (consultationId && socket) {
      socket.emit('call_ended', { consultationId });
    }
    cleanupPeer();
    setCallStatus('ended');
  }, [consultationId, socket, cleanupPeer]);

  return {
    callStatus,
    error,
    webrtcSupported,
    startCall,
    answerCall,
    hangUp,
    setMicEnabled,
    remoteStream,
  };
}
