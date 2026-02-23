import { nanoid } from '@livestore/livestore'
import { useCallback, useRef } from 'react'
import type { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import { Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'

import { uiState$ } from '../livestore/queries.ts'
import { events } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

export const NewTodo: React.FC = () => {
  const store = useAppStore()
  const { newTodoText } = store.useQuery(uiState$)

  const updatedNewTodoText = useCallback(
    (text: string) => store.commit(events.uiStateSet({ newTodoText: text })),
    [store],
  )
  const todoCreated = useCallback(
    () => store.commit(events.todoCreated({ id: nanoid(), text: newTodoText }), events.uiStateSet({ newTodoText: '' })),
    [newTodoText, store],
  )
  const addRandom50 = useCallback(() => {
    const todos = Array.from({ length: 50 }, (_, i) => ({ id: nanoid(), text: `Todo ${i}` }))
    store.commit(...todos.map((todo) => events.todoCreated(todo)))
  }, [store])
  const reset = useCallback(() => store.commit(events.todoClearedCompleted({ deletedAt: new Date() })), [store])

  const inputRef = useRef<TextInput>(null)
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss()
    inputRef.current?.blur()
  }, [])
  const handleInputKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Escape' || e.nativeEvent.key === 'Tab') {
        dismissKeyboard()
      }
    },
    [dismissKeyboard],
  )

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View className="flex-row items-center p-3 w-full max-w-md">
        <TextInput
          ref={inputRef}
          className="flex-1 h-10 mx-3 px-3 border border-gray-300 rounded-md text-base"
          value={newTodoText}
          onChangeText={updatedNewTodoText}
          onKeyPress={handleInputKeyPress}
          onSubmitEditing={todoCreated}
          placeholder="What needs to be done?"
          placeholderTextColor="#9ca3af"
        />
        <Pressable 
          onPress={todoCreated}
          className="px-3 py-2 bg-blue-500 rounded-md mr-2"
        >
          <Text className="text-white text-sm font-medium">Add</Text>
        </Pressable>
        <Pressable 
          onPress={addRandom50}
          className="px-3 py-2 bg-green-500 rounded-md mr-2"
        >
          <Text className="text-white text-sm font-medium">+50</Text>
        </Pressable>
        <Pressable 
          onPress={reset}
          className="px-3 py-2 bg-red-500 rounded-md"
        >
          <Text className="text-white text-sm font-medium">Clear</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  )
}
