import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import { YStack, XStack, Text, Button, H2, Avatar, Card, ScrollView } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { SignOutButton } from '../../components/auth';

export default function HomePage() {
  const { user } = useUser();

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$6" paddingTop="$10" space="$6">
          {/* Header */}
          <YStack space="$4" alignItems="center">
            <Avatar circular size="$10">
              <Avatar.Image
                src={user?.imageUrl}
                accessibilityLabel={user?.firstName || 'User avatar'}
              />
              <Avatar.Fallback backgroundColor="$blue9">
                <Text color="white" fontSize="$8" fontWeight="bold">
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            
            <H2 textAlign="center" color="$color">
              Welcome back, {user?.firstName || 'User'}!
            </H2>
            
            <Text textAlign="center" color="$gray10" fontSize="$4">
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
          </YStack>

          {/* User Info Card */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <Text fontSize="$5" fontWeight="bold" color="$color">Account Information</Text>
              
              <XStack justifyContent="space-between">
                <Text color="$gray10">Full Name:</Text>
                <Text color="$color">{user?.fullName || 'Not set'}</Text>
              </XStack>
              
              <XStack justifyContent="space-between">
                <Text color="$gray10">Email:</Text>
                <Text color="$color">{user?.emailAddresses?.[0]?.emailAddress}</Text>
              </XStack>
              
              <XStack justifyContent="space-between">
                <Text color="$gray10">Auth Method:</Text>
                <Text color="$color">Google OAuth</Text>
              </XStack>
              
              <XStack justifyContent="space-between">
                <Text color="$gray10">Member since:</Text>
                <Text color="$color">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </Text>
              </XStack>
            </YStack>
          </Card>

          {/* Quick Actions */}
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="bold" color="$color">Quick Actions</Text>
            
            <Button theme="blue" size="$4">
              Edit Profile
            </Button>
            
            <Button theme="alt2" size="$4">
              Settings
            </Button>
            
            <SignOutButton />
          </YStack>
        </YStack>
      </ScrollView>
    </>
  );
} 