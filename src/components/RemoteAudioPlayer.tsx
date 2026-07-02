import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface RemoteAudioPlayerProps {
  stream: MediaStream | null;
}

/**
 * Plays the remote participant's audio during a call. On web, WebRTC tracks
 * don't play automatically — they must be attached to an `<audio>` element.
 * On native, react-native-webrtc routes remote audio to the device's
 * speaker/earpiece automatically once tracks are added to the peer
 * connection, so nothing is rendered there.
 */
export function RemoteAudioPlayer({ stream }: RemoteAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !audioRef.current) return;
    audioRef.current.srcObject = stream;
    if (stream) {
      audioRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (Platform.OS !== 'web') return null;

  return React.createElement('audio', { ref: audioRef, autoPlay: true, playsInline: true });
}
