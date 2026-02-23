import { liveStoreVersion } from '@livestore/livestore'
import { useEffect } from 'react'

import { Badge } from '@/components/ui/badge'

export const VersionBadge = () => {
  useEffect(() => {
    console.log(`LiveStore v${liveStoreVersion}`)
  }, [])

  return (
    <Badge 
      variant="outline" 
      className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm text-xs font-mono"
    >
      v{liveStoreVersion}
    </Badge>
  )
}
