import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import { YStack, XStack, Text, Button, H2, H3, Avatar, Card, ScrollView, Separator } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { SignOutButton } from '../../components/auth';
import { trpc } from '../../lib/trpc';

export default function SettingsPage() {
  const { user } = useUser();

  // Get user ID for debugging
  const userIdQuery = trpc.getUserId.useQuery(undefined, {
    enabled: !!user?.id
  });

  const handleShowUserId = () => {
    if (userIdQuery.data?.userId) {
      console.log('User ID:', userIdQuery.data.userId);
      // You could show this in an alert or modal
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$6" paddingTop="$10" space="$6">
          {/* Header */}
          <YStack space="$2" alignItems="center">
            <H2 textAlign="center" color="$color">
              Settings
            </H2>
            <Text textAlign="center" color="$gray10" fontSize="$3">
              Manage your account and preferences
            </Text>
          </YStack>

          {/* Profile Section */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$4">
              <YStack space="$3" alignItems="center">
                <Avatar circular size="$8">
                  <Avatar.Image
                    src={user?.imageUrl}
                    accessibilityLabel={user?.firstName || 'User avatar'}
                  />
                  <Avatar.Fallback backgroundColor="$blue9">
                    <Text color="white" fontSize="$6" fontWeight="bold">
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
                
                <YStack space="$1" alignItems="center">
                  <H3 color="$color">
                    {user?.fullName || 'User'}
                  </H3>
                  <Text color="$gray10" fontSize="$3">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </Text>
                </YStack>
              </YStack>

              <Separator />

              <YStack space="$3">
                <H3 color="$color">Account Information</H3>
                
                <XStack justifyContent="space-between">
                  <Text color="$gray10">Member since:</Text>
                  <Text color="$color">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text color="$gray10">Auth Provider:</Text>
                  <Text color="$color">Google OAuth</Text>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          {/* Developer Tools */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H3 color="$color">Developer Tools</H3>
              <Text color="$gray10" fontSize="$3">
                Tools for development and debugging
              </Text>
              
              <Button 
                onPress={handleShowUserId}
                theme="alt2" 
                size="$3"
              >
                Show User ID in Console
              </Button>
            </YStack>
          </Card>

          {/* App Actions */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack space="$3">
              <H3 color="$color">Account Actions</H3>
              
              <Button theme="blue" size="$3">
                Edit Profile
              </Button>
              
              <Button theme="alt2" size="$3">
                Notifications
              </Button>
              
              <Button theme="alt2" size="$3">
                Privacy Settings
              </Button>
              
              <SignOutButton />
            </YStack>
          </Card>

          {/* Bottom Padding for Safe Area */}
          <YStack height="$4" />
        </YStack>
      </ScrollView>
    </>
  );
} 