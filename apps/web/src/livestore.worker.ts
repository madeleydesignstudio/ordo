import { makeWorker } from '@livestore/adapter-web/worker'
import { makeWsSync } from '@livestore/sync-cf/client'
import { makeClientSyncConfig } from '@ordo/sync-engine'

import { schema } from './livestore/schema.ts'

const { syncUrl } = makeClientSyncConfig({
  storeId: import.meta.env.VITE_LIVESTORE_STORE_ID,
  syncUrl: import.meta.env.VITE_LIVESTORE_SYNC_URL,
})

makeWorker({
  schema,
  sync: {
    backend: makeWsSync({ url: syncUrl }),
    initialSyncOptions: { _tag: 'Blocking', timeout: 5000 },
  },
})
