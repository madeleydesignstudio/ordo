import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import { YStack, Text, H2, ScrollView } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { TaskList } from '../../components/TaskList';

export default function TasksPage() {
  const { user } = useUser();

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$6" paddingTop="$10" space="$4">
          {/* Header */}
          <YStack space="$2" alignItems="center">
            <H2 textAlign="center" color="$color">
              My Tasks
            </H2>
            <Text textAlign="center" color="$gray10" fontSize="$3">
              Manage your daily tasks and projects
            </Text>
          </YStack>

          {/* Tasks List */}
          <TaskList />
        </YStack>
      </ScrollView>
    </>
  );
} 