import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { YStack, XStack, Text, Card, H2, H3, Spinner, Button } from 'tamagui';
import { trpc } from '../lib/trpc';
import { useTasksStore } from '../lib/store/tasks';

const TaskItem = ({ task }: { task: any }) => {
  const priorityColors = {
    0: '$gray9', // Low - gray
    1: '$orange9', // Medium - orange  
    2: '$red9', // High - red
  };

  const priorityLabels = {
    0: 'Low',
    1: 'Medium', 
    2: 'High',
  };

  return (
    <Card padding="$4" marginBottom="$3" backgroundColor="$gray1">
      <XStack alignItems="flex-start" justifyContent="space-between">
        <YStack flex={1} space="$2">
          <H3 
            textDecorationLine={task.completed ? 'line-through' : 'none'}
            color={task.completed ? '$gray10' : '$color'}
            fontSize="$5"
          >
            {task.title}
          </H3>
          {task.description && (
            <Text color="$gray10" fontSize="$3">
              {task.description}
            </Text>
          )}
          <XStack alignItems="center" space="$2">
            <Text 
              backgroundColor={priorityColors[task.priority as keyof typeof priorityColors]}
              color="white"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
              fontSize="$2"
              fontWeight="600"
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </Text>
            <Text fontSize="$2" color="$gray10">
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </XStack>
        </YStack>
        <XStack marginLeft="$3">
          {/* Simple checkbox representation */}
          <Text fontSize="$6" color={task.completed ? '$green9' : '$gray8'}>
            {task.completed ? '✅' : '⭕'}
          </Text>
        </XStack>
      </XStack>
    </Card>
  );
};

export const TaskList = () => {
  const { user } = useUser();
  const { tasks, isLoading, error, setTasks, setLoading, setError } = useTasksStore();

  const tasksQuery = trpc.getTasks.useQuery(undefined, {
    enabled: !!user?.id,
    onSuccess: (data) => {
      // Convert string dates to Date objects
      const normalizedTasks = data.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      setTasks(normalizedTasks);
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (tasksQuery.isLoading) {
      setLoading(true);
    }
  }, [tasksQuery.isLoading, setLoading]);

  if (!user) {
    return (
      <YStack padding="$6" alignItems="center">
        <Text color="$gray10">Please sign in to view your tasks.</Text>
      </YStack>
    );
  }

  if (isLoading) {
    return (
      <YStack padding="$6" alignItems="center" space="$3">
        <Spinner size="large" color="$blue9" />
        <Text color="$gray10">Loading tasks...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$6" alignItems="center" space="$3">
        <Text color="$red9">Error loading tasks: {error}</Text>
        <Button 
          onPress={() => tasksQuery.refetch()}
          theme="blue"
          size="$3"
        >
          Retry
        </Button>
      </YStack>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <YStack space="$4" padding="$4">
      <YStack space="$2">
        <H2 color="$color">My Tasks</H2>
        <Text color="$gray10" fontSize="$3">
          {pendingTasks.length} pending, {completedTasks.length} completed
        </Text>
      </YStack>

      {tasks.length === 0 ? (
        <YStack padding="$8" alignItems="center" space="$2">
          <Text color="$gray10" fontSize="$4" textAlign="center">
            No tasks found.
          </Text>
          <Text color="$gray8" fontSize="$3" textAlign="center">
            Start by creating your first task!
          </Text>
        </YStack>
      ) : (
        <YStack space="$4">
          {pendingTasks.length > 0 && (
            <YStack space="$3">
              <H3 color="$gray12" fontSize="$4">Pending Tasks</H3>
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </YStack>
          )}

          {completedTasks.length > 0 && (
            <YStack space="$3">
              <H3 color="$gray12" fontSize="$4">Completed Tasks</H3>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}; 