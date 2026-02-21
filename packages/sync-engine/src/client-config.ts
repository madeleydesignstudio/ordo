const DEFAULT_SYNC_URL = 'ws://localhost:8787/sync'
const DEFAULT_STORE_ID = 'ordo-dev-shared-v2'

const normalizeSyncUrl = (url: string) => {
  if (url.startsWith('http://')) return `ws://${url.slice('http://'.length)}`
  if (url.startsWith('https://')) return `wss://${url.slice('https://'.length)}`
  return url
}

export const makeClientSyncConfig = (input: { storeId?: string; syncUrl?: string }) => {
  const storeId = input.storeId?.trim() || DEFAULT_STORE_ID
  const syncUrl = normalizeSyncUrl(input.syncUrl?.trim() || DEFAULT_SYNC_URL)
  return { storeId, syncUrl }
}
