import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";

export interface Todo {
  id: string;
  name: string;
  number: number;
  created_at: Date;
}

// Create a collection that uses localStorage for persistence
export const todoCollection = createCollection(
  localStorageCollectionOptions<Todo>({
    id: "todos",
    storageKey: "ordo-todos", // localStorage key
    getKey: (item) => item.id,
  }),
);
