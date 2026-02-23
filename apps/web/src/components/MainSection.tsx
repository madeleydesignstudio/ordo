import React from 'react'

import { queryDb } from '@livestore/livestore'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { uiState$ } from '../livestore/queries.ts'
import { events, tables } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

const visibleTodos$ = queryDb(
  (get) => {
    const { filter } = get(uiState$)
    return tables.todos.where({
      deletedAt: null,
      completed: filter === 'all' ? undefined : filter === 'completed',
    })
  },
  { label: 'visibleTodos' },
)

export const MainSection: React.FC = () => {
  const store = useAppStore()

  const toggleTodo = React.useCallback(
    ({ id, completed }: typeof tables.todos.Type) =>
      store.commit(completed ? events.todoUncompleted({ id }) : events.todoCompleted({ id })),
    [store],
  )

  const visibleTodos = store.useQuery(visibleTodos$)

  const handleTodoToggle = React.useCallback(
    (id: string, completed: boolean) => {
      store.commit(completed ? events.todoUncompleted({ id }) : events.todoCompleted({ id }))
    },
    [store],
  )

  const handleTodoDelete = React.useCallback(
    (id: string) => {
      store.commit(events.todoDeleted({ id, deletedAt: new Date() }))
    },
    [store],
  )

  return (
    <section className="flex-1">
      <ul className="divide-y divide-border">
        {visibleTodos.map((todo) => (
          <li key={todo.id}>
            <Card className="border-0 shadow-none rounded-none px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleTodoToggle(todo.id, todo.completed)}
                />
                <span 
                  className={`flex-1 text-base ${
                    todo.completed 
                      ? 'line-through text-muted-foreground' 
                      : 'text-foreground'
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTodoDelete(todo.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
