// app/index.tsx
import { Redirect } from 'expo-router';

// This is the main entry point of the app.
// It will automatically redirect to the (auth) group or (tabs) group
// based on the logic in hooks/useAuth.tsx.
// For a new user, this will show the (auth)/index.tsx screen.
export default function RootIndex() {
  return <Redirect href="/(auth)" />;
}