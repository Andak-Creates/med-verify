// No-op on web: browsers already provide RTCPeerConnection and
// navigator.mediaDevices.getUserMedia natively, and react-native-webrtc has
// no web implementation so it must never be bundled here.
export {};
