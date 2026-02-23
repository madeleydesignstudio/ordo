import { Entypo } from '@expo/vector-icons'
import { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'

import { events } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

export const Checkbox = ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
  const store = useAppStore()

  const handleCheckbox = useCallback(() => {
    store.commit(isCompleted ? events.todoUncompleted({ id }) : events.todoCompleted({ id }))
  }, [id, isCompleted, store])

  return (
    <TouchableOpacity 
      onPress={handleCheckbox}
      className={`w-5 h-5 rounded-md items-center justify-center ${
        isCompleted 
          ? 'bg-neutral-800 shadow-md' 
          : 'bg-white border-2 border-gray-200 shadow-sm'
      }`}
    >
      <Entypo name="check" size={16} color={isCompleted ? '#FAFAFA' : 'transparent'} />
    </TouchableOpacity>
  )
}
