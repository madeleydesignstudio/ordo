import { useCallback, type ChangeEvent, type KeyboardEvent } from 'react'

import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { uiState$ } from '../livestore/queries.ts'
import { events } from '../livestore/schema.ts'
import { useAppStore } from '../livestore/store.ts'

export const Header = () => {
  const store = useAppStore()
  const { newTodoText } = store.useQuery(uiState$)

  const updatedNewTodoText = useCallback((text: string) => store.commit(events.uiStateSet({ newTodoText: text })), [store])

  const todoCreated = useCallback(
    () =>
      store.commit(
        events.todoCreated({ id: crypto.randomUUID(), text: newTodoText }),
        events.uiStateSet({ newTodoText: '' }),
      ),
    [newTodoText, store],
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => updatedNewTodoText(e.target.value),
    [updatedNewTodoText],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        todoCreated()
      }
    },
    [todoCreated],
  )

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="text-4xl font-thin text-center text-foreground/80 tracking-tight">
          TodoMVC
        </CardTitle>
      </CardHeader>
      <div className="px-4 pb-4">
        <Input
          placeholder="What needs to be done?"
          value={newTodoText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="h-14 text-xl placeholder:text-muted-foreground/60 shadow-sm"
        />
      </div>
    </Card>
  )
}
