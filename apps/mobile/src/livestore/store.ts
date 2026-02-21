import { unstable_batchedUpdates as batchUpdates } from 'react-native'

import { makePersistedAdapter } from '@livestore/adapter-expo'
import { nanoid } from '@livestore/livestore'
import { useStore } from '@livestore/react'
import { makeWsSync } from '@livestore/sync-cf/client'
import { makeClientSyncConfig } from '@ordo/sync-engine'

import { events, SyncPayload, schema, tables } from './schema.ts'

const { storeId, syncUrl } = makeClientSyncConfig({
  storeId: process.env.EXPO_PUBLIC_LIVESTORE_STORE_ID,
  syncUrl: process.env.EXPO_PUBLIC_LIVESTORE_SYNC_URL,
})

if (__DEV__) {
  console.log('[ordo:mobile] LiveStore startup', { storeId, syncUrl })
}

const adapter = makePersistedAdapter({
  sync: { backend: syncUrl ? makeWsSync({ url: syncUrl }) : undefined },
})

export const useAppStore = () =>
  useStore({
    storeId,
    schema,
    adapter,
    batchUpdates,
    syncPayloadSchema: SyncPayload,
    syncPayload: { authToken: 'insecure-token-change-me' },
    boot: (store) => {
      if (store.query(tables.todos.count()) === 0) {
        store.commit(events.todoCreated({ id: nanoid(), text: 'Make coffee' }))
      }
    },
  })
