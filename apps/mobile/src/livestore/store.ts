import { unstable_batchedUpdates as batchUpdates } from 'react-native'

import { makePersistedAdapter } from '@livestore/adapter-expo'
import { useStore } from '@livestore/react'
import { makeWsSync } from '@livestore/sync-cf/client'
import { makeClientSyncConfig } from '@ordo/sync-engine'

import { SyncPayload, schema, } from './schema.ts'

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
  })
