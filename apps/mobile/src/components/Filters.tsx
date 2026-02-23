import { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

import { uiState$ } from '../livestore/queries.ts'
import { events } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'
import type { Filter } from '../types.ts'

export const Filters = () => {
  const store = useAppStore()
  const { filter } = store.useQuery(uiState$)

  const setFilter = useCallback((newFilter: Filter) => store.commit(events.uiStateSet({ filter: newFilter })), [store])
  const setAllFilter = useCallback(() => setFilter('all'), [setFilter])
  const setActiveFilter = useCallback(() => setFilter('active'), [setFilter])
  const setCompletedFilter = useCallback(() => setFilter('completed'), [setFilter])

  return (
    <View className="flex-row gap-2 py-4 px-4 items-center justify-center">
      <Tag isActive={filter === 'all'} onPress={setAllFilter}>
        All
      </Tag>
      <Tag isActive={filter === 'active'} onPress={setActiveFilter}>
        Active
      </Tag>
      <Tag isActive={filter === 'completed'} onPress={setCompletedFilter}>
        Completed
      </Tag>
      <Text className="text-gray-400 text-xs ml-4">Store: {store.storeId.slice(0, 8)}...</Text>
    </View>
  )
}

const Tag = ({
  isActive,
  children,
  onPress,
}: {
  isActive: boolean
  onPress: () => void
  children: React.ReactNode
}) => {
  return (
    <Pressable 
      onPress={onPress}
      hitSlop={4}
      className={`px-3 py-1.5 rounded-lg border ${
        isActive 
          ? 'bg-neutral-900 border-neutral-900 shadow-md' 
          : 'bg-white border-gray-200'
      }`}
    >
      <Text className={`text-sm font-medium ${
        isActive ? 'text-white' : 'text-gray-500'
      }`}>
        {children}
      </Text>
    </Pressable>
  )
}
