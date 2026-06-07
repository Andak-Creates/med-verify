import { Redirect } from 'expo-router';

// Mock auth state — swap `IS_LOGGED_IN` to `true` to simulate a returning user
// bypassing onboarding and going straight to the dashboard.
const IS_LOGGED_IN = false;

export default function Index() {
  if (IS_LOGGED_IN) {
    return <Redirect href={'/(user)/home' as any} />;
  }
  return <Redirect href={'/(onboarding)/splash' as any} />;
}
