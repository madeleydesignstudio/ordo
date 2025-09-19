import { useLiveQuery } from "@tanstack/react-db";
import { todoCollection, type Todo } from "../lib/todoCollection";

export function TodoApp() {
  // Use TanStack DB live query for reactive data
  const { data: todos } = useLiveQuery((q) => q.from({ todo: todoCollection }));

  const insertItem = () => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      name: "Arthur",
      number: 42,
      created_at: new Date(),
    };

    // Insert into TanStack DB collection (automatically persists to localStorage)
    todoCollection.insert(newTodo);
  };

  return (
    <div>
      <button onClick={insertItem}>Insert Item</button>
      <div>
        <h3>Items in collection: {todos?.length || 0}</h3>
        {todos?.map((todo) => (
          <div key={todo.id}>
            ID: {todo.id.slice(0, 8)}..., Name: {todo.name}, Number:{" "}
            {todo.number}
            <span>, Created: {todo.created_at.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
