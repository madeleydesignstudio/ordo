import React from 'react';
import { Tabs } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Text } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function HomeLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <>
      <SignedIn>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : 8,
              paddingTop: 8,
              height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
              elevation: 8, // Android shadow
              shadowColor: '#000', // iOS shadow
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginBottom: Platform.OS === 'android' ? 2 : 0,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Text fontSize={size} color={color}>🏠</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              title: 'Tasks',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Text fontSize={size} color={color}>✅</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Text fontSize={size} color={color}>⚙️</Text>
              ),
            }}
          />
        </Tabs>
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-in" />
      </SignedOut>
    </>
  );
} 