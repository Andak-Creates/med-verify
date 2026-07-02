import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useCallSignaling, type CallStatus } from '@/hooks/useCallSignaling';
import type { ConsultationType, IceServer, UserRole } from '@/types/api';

export interface ActiveConsultationInfo {
  id: string;
  iceServers: IceServer[];
  consultationType: ConsultationType;
  /** This device's own role in the consultation. */
  role: UserRole;
  counterpartName: string;
  counterpartImage: string | null;
}

interface CallContextValue {
  activeConsultation: ActiveConsultationInfo | null;
  registerConsultation: (info: ActiveConsultationInfo) => void;
  clearConsultation: (consultationId: string) => void;

  callStatus: CallStatus;
  error: string | null;
  webrtcSupported: boolean;
  remoteStream: MediaStream | null;
  startCall: () => Promise<void>;
  answerCall: () => Promise<void>;
  hangUp: () => void;
  setMicEnabled: (enabled: boolean) => void;

  /** Whether the audio-call screen is currently mounted/focused. */
  isCallScreenActive: boolean;
  setCallScreenActive: (active: boolean) => void;
}

const CallContext = createContext<CallContextValue | null>(null);

/**
 * Holds a single, persistent WebRTC signaling instance for the consultation
 * the user currently has open, so it survives navigation between the chat
 * screen and the audio-call screen. Also tracks whether the call screen is
 * focused, so a global "incoming call" overlay can ring while the user is
 * still on the chat screen.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [activeConsultation, setActiveConsultation] = useState<ActiveConsultationInfo | null>(null);
  const [isCallScreenActive, setIsCallScreenActive] = useState(false);

  const signaling = useCallSignaling(activeConsultation?.id, activeConsultation?.iceServers ?? []);

  const registerConsultation = useCallback((info: ActiveConsultationInfo) => {
    setActiveConsultation(info);
  }, []);

  const clearConsultation = useCallback((consultationId: string) => {
    setActiveConsultation((current) => (current?.id === consultationId ? null : current));
  }, []);

  const setCallScreenActive = useCallback((active: boolean) => {
    setIsCallScreenActive(active);
  }, []);

  const value = useMemo<CallContextValue>(
    () => ({
      activeConsultation,
      registerConsultation,
      clearConsultation,
      ...signaling,
      isCallScreenActive,
      setCallScreenActive,
    }),
    [activeConsultation, registerConsultation, clearConsultation, signaling, isCallScreenActive, setCallScreenActive],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
}
