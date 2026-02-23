import type * as React from 'react'
import { Text, View } from 'react-native'

import { queryDb } from '@livestore/livestore'

import { tables } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

const incompleteCount$ = queryDb(tables.todos.count().where({ deletedAt: null, completed: false }), {
  label: 'incompleteCount',
})

export const Meta: React.FC = () => {
  const store = useAppStore()
  const count = store.useQuery(incompleteCount$)

  return (
    <View className="py-2 px-4 bg-white">
      <Text className="text-gray-800 font-medium">{count} items left</Text>
    </View>
  )
}
