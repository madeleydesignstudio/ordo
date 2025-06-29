import React from 'react';
import { Stack } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function HomeLayout() {
  return (
    <>
      <SignedIn>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-in" />
      </SignedOut>
    </>
  );
} 