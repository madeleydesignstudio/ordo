import { MaterialIcons } from '@expo/vector-icons'
import { useCallback } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import type { tables } from '../livestore/schema.ts'
import { events } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'
import { Checkbox } from './Checkbox.tsx'

export const Todo = ({ id, text, completed }: typeof tables.todos.Type) => {
  const store = useAppStore()

  const handleDeleteTodo = useCallback(
    () => store.commit(events.todoDeleted({ id, deletedAt: new Date() })),
    [id, store],
  )

  return (
    <View className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100 bg-white">
      <View className="flex-row items-center flex-1">
        <Checkbox id={id} isCompleted={completed} />
        <View className="flex-1 ml-3">
          <Text 
            selectable 
            className={`text-base font-medium ${
              completed ? 'line-through text-gray-400' : 'text-gray-600'
            }`}
          >
            {text}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={handleDeleteTodo}
        className="p-2"
      >
        <MaterialIcons name="delete-outline" size={24} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  )
}
