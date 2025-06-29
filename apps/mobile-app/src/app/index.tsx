import React from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { YStack, Text, Button, H1, Card } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignInButton } from '../components/auth';

export default function IndexPage() {
  const { user } = useUser();

  return (
    <>
      <StatusBar style="auto" />
      <YStack flex={1} padding="$6" backgroundColor="$background">
        
        {/* When user is signed in */}
        <SignedIn>
          <YStack flex={1} justifyContent="center" alignItems="center" space="$6">
            <H1 textAlign="center" color="$color">
              Welcome to Ordo! 👋
            </H1>
            
            <Text textAlign="center" color="$gray10" fontSize="$5">
              Hello {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
            </Text>
            
            <Link href="/(home)" asChild>
              <Button theme="blue" size="$5">
                Go to Dashboard
              </Button>
            </Link>
          </YStack>
        </SignedIn>

        {/* When user is signed out */}
        <SignedOut>
          <YStack flex={1} justifyContent="center" alignItems="center" space="$6">
            <YStack space="$4" alignItems="center">
              <H1 textAlign="center" color="$color">
                Welcome to Ordo 🚀
              </H1>
              
              <Text textAlign="center" color="$gray10" fontSize="$5" maxWidth={300}>
                Your cross-platform productivity app built with Expo and Tamagui
              </Text>
            </YStack>

            <Card padding="$4" backgroundColor="$gray2" maxWidth={350}>
              <YStack space="$3">
                <Text fontSize="$4" fontWeight="bold" color="$color" textAlign="center">
                  Get Started
                </Text>
                <Text color="$gray10" textAlign="center" fontSize="$3">
                  Sign in with your Google account to get started.
                </Text>
              </YStack>
            </Card>

            <YStack space="$3" width="100%" maxWidth={300}>
              <GoogleSignInButton />
            </YStack>
          </YStack>
        </SignedOut>
        
      </YStack>
    </>
  );
}