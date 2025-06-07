import { createFileRoute } from '@tanstack/react-router'
import TableView from '@workspace/ui/components/dashboard/project-manager/table-view'
import ListView from '@workspace/ui/components/dashboard/project-manager/list-view'
import CalendarView from '@workspace/ui/components/dashboard/project-manager/calendar-view'
import KanbanView from '@workspace/ui/components/dashboard/project-manager/kanban-view'
import GanttView from '@workspace/ui/components/dashboard/project-manager/gantt-view'

export const Route = createFileRoute('/project-manager/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GanttView />
}
