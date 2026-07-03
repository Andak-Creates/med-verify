import { registerGlobals } from 'react-native-webrtc';

// Polyfills RTCPeerConnection / navigator.mediaDevices.getUserMedia onto
// globalThis so useCallSignaling's webrtcSupported check and WebRTC calls
// work on native, same as they already do on web.
registerGlobals();
