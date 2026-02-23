import { StoreRegistry } from '@livestore/livestore'
import { StoreRegistryProvider } from '@livestore/react'
import { StatusBar } from 'expo-status-bar'
import { Suspense, useState } from 'react'
import { Text, View } from 'react-native'

import { Filters } from './components/Filters.tsx'
import { ListTodos } from './components/ListTodos.tsx'
import { Meta } from './components/Meta.tsx'
import { NewTodo } from './components/NewTodo.tsx'

import './global.css'

const loadingFallback = <Text className="text-gray-500">Loading LiveStore...</Text>

export const Root = () => {
  const [storeRegistry] = useState(() => new StoreRegistry())

  return (
    <View className="flex-1 pt-16 bg-white items-center pb-8">
      <Suspense fallback={loadingFallback}>
        <StoreRegistryProvider storeRegistry={storeRegistry}>
          <InnerApp />
        </StoreRegistryProvider>
      </Suspense>
      <StatusBar />
    </View>
  )
}

const InnerApp = () => (
  <View className="flex-1 w-full px-4">
    <NewTodo />
    <Meta />
    <ListTodos />
    <Filters />
  </View>
)
