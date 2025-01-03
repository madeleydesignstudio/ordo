import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Todo } from "../types";

interface VirtualizedTodoListProps {
  todos: Todo[];
  renderTodo: (todo: Todo) => React.ReactNode;
}

export function VirtualizedTodoList({
  todos,
  renderTodo,
}: VirtualizedTodoListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: todos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderTodo(todos[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
