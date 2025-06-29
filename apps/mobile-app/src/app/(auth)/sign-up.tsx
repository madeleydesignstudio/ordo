import React from 'react';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { YStack, Text, Button, H2, Spinner } from 'tamagui';
import { Alert } from 'react-native';

export default function SignUpPage() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const onSignUpWithGoogle = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      Alert.alert('Sign Up Error', err?.errors?.[0]?.longMessage || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, router]);

  return (
    <YStack flex={1} padding="$6" justifyContent="center" backgroundColor="$background">
      <YStack space="$6" maxWidth={400} alignSelf="center" width="100%">
        <YStack space="$3" alignItems="center">
          <H2 textAlign="center" color="$color">Create Account</H2>
          <Text textAlign="center" color="$gray10" fontSize="$4" maxWidth={300}>
            Sign up for a new account using Google
          </Text>
        </YStack>
        
        <Button
          onPress={onSignUpWithGoogle}
          theme="blue"
          size="$5"
          disabled={isLoading}
          icon={isLoading ? <Spinner /> : undefined}
        >
          {isLoading ? 'Creating account...' : 'Continue with Google'}
        </Button>
        
        <Text textAlign="center" color="$gray10" fontSize="$3">
          Secure authentication powered by Clerk
        </Text>
      </YStack>
    </YStack>
  );
} 