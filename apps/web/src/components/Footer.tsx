import { useCallback } from 'react'

import { queryDb } from '@livestore/livestore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { uiState$ } from '../livestore/queries.ts'
import { events, tables } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

const incompleteCount$ = queryDb(tables.todos.count().where({ completed: false, deletedAt: null }), {
  label: 'incompleteCount',
})

export const Footer = () => {
  const store = useAppStore()
  const { filter } = store.useQuery(uiState$)
  const incompleteCount = store.useQuery(incompleteCount$)
  const setFilter = useCallback(
    (filter: (typeof tables.uiState.Value)['filter']) => store.commit(events.uiStateSet({ filter })),
    [store],
  )
  const handleAllClick = useCallback(() => setFilter('all'), [setFilter])
  const handleActiveClick = useCallback(() => setFilter('active'), [setFilter])
  const handleCompletedClick = useCallback(() => setFilter('completed'), [setFilter])
  const handleClearCompleted = useCallback(
    () => store.commit(events.todoClearedCompleted({ deletedAt: new Date() })),
    [store],
  )

  return (
    <footer className="flex items-center justify-between px-4 py-3 border-t bg-card/50 text-sm">
      <Badge variant="secondary" className="font-normal">
        {incompleteCount} {incompleteCount === 1 ? 'item' : 'items'} left
      </Badge>
      
      <div className="flex items-center gap-1">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleAllClick}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleActiveClick}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'ghost'}
          size="sm"
          onClick={handleCompletedClick}
        >
          Completed
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearCompleted}
        className="text-muted-foreground hover:text-destructive"
      >
        Clear completed
      </Button>
    </footer>
  )
}
