import React from 'react';
import { Stack } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  return (
    <>
      <SignedIn>
        <Redirect href="/" />
      </SignedIn>
      <SignedOut>
        <Stack>
          <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
          <Stack.Screen name="sign-up" options={{ title: 'Sign Up' }} />
        </Stack>
      </SignedOut>
    </>
  );
} 