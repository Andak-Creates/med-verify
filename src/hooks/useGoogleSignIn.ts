import { useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Required so the auth session resolves correctly when the browser redirects back.
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError?: (message: string) => void) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    // Always show Google's account chooser instead of silently reusing
    // whichever Google account the browser already has an active session for.
    selectAccount: true,
  });

  const onIdTokenRef = useRef(onIdToken);
  onIdTokenRef.current = onIdToken;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        onIdTokenRef.current(idToken);
      } else {
        onErrorRef.current?.('Google did not return an ID token. Please try again.');
      }
      return;
    }

    if (response.type === 'error') {
      onErrorRef.current?.(response.error?.message ?? 'Google sign-in failed. Please try again.');
      return;
    }

    // 'dismiss' / 'cancel' / 'locked' — the user closed the popup or it was
    // blocked; nothing to report, but it must not look like a hang.
  }, [response]);

  return {
    ready: Boolean(request),
    promptAsync,
    response,
  };
}
