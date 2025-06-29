import React from 'react';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Button, Spinner } from 'tamagui';
import { Alert } from 'react-native';

interface GoogleSignInButtonProps {
  text?: string;
  mode?: 'sign-in' | 'sign-up';
}

export function GoogleSignInButton({ 
  text = 'Continue with Google', 
  mode = 'sign-in' 
}: GoogleSignInButtonProps) {
  const { isSignedIn } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // Don't show button if already signed in
  if (isSignedIn) {
    return null;
  }

  const handleGoogleAuth = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      const errorMessage = mode === 'sign-up' ? 'Sign Up Error' : 'Sign In Error';
      Alert.alert(errorMessage, err?.errors?.[0]?.longMessage || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, router, mode]);

  return (
    <Button
      onPress={handleGoogleAuth}
      theme="blue"
      size="$5"
      disabled={isLoading}
      icon={isLoading ? <Spinner /> : undefined}
    >
      {isLoading ? 'Connecting...' : text}
    </Button>
  );
} 