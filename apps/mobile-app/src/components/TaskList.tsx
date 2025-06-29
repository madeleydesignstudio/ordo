import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { YStack, XStack, Text, Card, H2, H3, Spinner, Button, Input, TextArea, Select, Adapt, Sheet } from 'tamagui';
import { trpc } from '../lib/trpc';
import { useTasksStore } from '../lib/store/tasks';

interface TaskFormData {
  title: string;
  description: string;
  priority: number;
}

const TaskForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTask } = useTasksStore();
  const createTaskMutation = trpc.createTask.useMutation({
    onSuccess: (newTask) => {
      addTask({
        ...newTask,
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
      });
      setFormData({ title: '', description: '', priority: 0 });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    createTaskMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
    });
  };

  const priorityOptions = [
    { label: 'Low', value: 0 },
    { label: 'Medium', value: 1 },
    { label: 'High', value: 2 },
  ];

  return (
    <Card padding="$4" marginBottom="$4" backgroundColor="$gray1">
      <YStack space="$3">
        <H3>Create New Task</H3>
        
        <YStack space="$2">
          <Text fontSize="$3" fontWeight="500">Title *</Text>
          <Input
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter task title..."
          />
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" fontWeight="500">Description</Text>
          <TextArea
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter task description..."
            numberOfLines={3}
          />
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" fontWeight="500">Priority</Text>
          <Select
            value={formData.priority.toString()}
            onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select priority" />
            </Select.Trigger>
            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>
            <Select.Content zIndex={200000}>
              <Select.ScrollUpButton />
              <Select.Viewport>
                {priorityOptions.map((option) => (
                  <Select.Item key={option.value} index={option.value} value={option.value.toString()}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
        </YStack>

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting || !formData.title.trim()}
          theme="blue"
          size="$4"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </YStack>
    </Card>
  );
};

const TaskItem = ({ task }: { task: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
  });

  const { updateTask, removeTask } = useTasksStore();

  const updateTaskMutation = trpc.updateTask.useMutation({
    onSuccess: (updatedTask) => {
      updateTask(task.id, {
        ...updatedTask,
        createdAt: new Date(updatedTask.createdAt),
        updatedAt: new Date(updatedTask.updatedAt),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });

  const deleteTaskMutation = trpc.deleteTask.useMutation({
    onSuccess: () => {
      removeTask(task.id);
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
    },
  });

  const handleCompleteToggle = () => {
    updateTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  const handleSaveEdit = () => {
    if (!editData.title.trim()) return;
    
    updateTaskMutation.mutate({
      id: task.id,
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      priority: editData.priority,
    });
  };

  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Simple confirmation for mobile
    deleteTaskMutation.mutate({ id: task.id });
  };

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

  const priorityOptions = [
    { label: 'Low', value: 0 },
    { label: 'Medium', value: 1 },
    { label: 'High', value: 2 },
  ];

  if (isEditing) {
    return (
      <Card padding="$4" marginBottom="$3" backgroundColor="$gray1">
        <YStack space="$3">
          <Input
            value={editData.title}
            onChangeText={(text) => setEditData({ ...editData, title: text })}
            placeholder="Task title..."
          />
          <TextArea
            value={editData.description}
            onChangeText={(text) => setEditData({ ...editData, description: text })}
            placeholder="Task description..."
            numberOfLines={2}
          />
          <Select
            value={editData.priority.toString()}
            onValueChange={(value) => setEditData({ ...editData, priority: parseInt(value) })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>
            <Select.Content zIndex={200000}>
              <Select.ScrollUpButton />
              <Select.Viewport>
                {priorityOptions.map((option) => (
                  <Select.Item key={option.value} index={option.value} value={option.value.toString()}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
          <XStack space="$2">
            <Button
              onPress={handleSaveEdit}
              disabled={updateTaskMutation.isLoading || !editData.title.trim()}
              theme="green"
              size="$3"
              flex={1}
            >
              {updateTaskMutation.isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onPress={handleCancelEdit}
              theme="gray"
              size="$3"
              flex={1}
            >
              Cancel
            </Button>
          </XStack>
        </YStack>
      </Card>
    );
  }

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
        
        <YStack alignItems="center" space="$2" marginLeft="$3">
          <Button
            onPress={handleCompleteToggle}
            disabled={updateTaskMutation.isLoading}
            size="$2"
            chromeless
          >
            <Text fontSize="$5" color={task.completed ? '$green9' : '$gray8'}>
              {task.completed ? '✅' : '⭕'}
            </Text>
          </Button>
          <XStack space="$1">
            <Button
              onPress={() => setIsEditing(true)}
              theme="blue"
              size="$2"
            >
              Edit
            </Button>
            <Button
              onPress={handleDelete}
              disabled={deleteTaskMutation.isLoading}
              theme="red"
              size="$2"
            >
              {deleteTaskMutation.isLoading ? '...' : 'Delete'}
            </Button>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  );
};

export const TaskList = () => {
  const { user } = useUser();
  const { tasks, isLoading, error, setTasks, setLoading, setError } = useTasksStore();
  const [showForm, setShowForm] = useState(false);

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
      <XStack alignItems="center" justifyContent="space-between">
        <YStack space="$1">
          <H2 color="$color">My Tasks</H2>
          <Text color="$gray10" fontSize="$3">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </Text>
        </YStack>
        <Button
          onPress={() => setShowForm(!showForm)}
          theme="blue"
          size="$3"
        >
          {showForm ? 'Cancel' : 'New Task'}
        </Button>
      </XStack>

      {showForm && <TaskForm onSuccess={() => setShowForm(false)} />}

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