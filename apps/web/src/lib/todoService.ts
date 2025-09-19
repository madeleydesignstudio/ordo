import { PGlite } from "@electric-sql/pglite";

export interface Todo {
  id: string;
  name: string;
  number: number;
  created_at: Date;
}

export class TodoService {
  private db: PGlite | null = null;

  setDatabase(database: PGlite) {
    this.db = database;
  }

  async initialize() {
    if (!this.db) throw new Error("Database not set");

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Todo table initialized");
  }

  async getAllTodos(): Promise<Todo[]> {
    if (!this.db) throw new Error("Database not set");

    const result = await this.db.query(
      "SELECT * FROM todos ORDER BY created_at DESC",
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      number: row.number,
      created_at: new Date(row.created_at),
    }));
  }

  async createTodo(todo: Omit<Todo, "id" | "created_at">): Promise<Todo> {
    if (!this.db) throw new Error("Database not set");

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      name: todo.name,
      number: todo.number,
      created_at: new Date(),
    };

    await this.db.query(
      "INSERT INTO todos (id, name, number, created_at) VALUES ($1, $2, $3, $4)",
      [
        newTodo.id,
        newTodo.name,
        newTodo.number,
        newTodo.created_at.toISOString(),
      ],
    );

    console.log("✅ Todo created:", newTodo.name);
    return newTodo;
  }

  async updateTodo(
    id: string,
    updates: Partial<Pick<Todo, "name" | "number">>,
  ): Promise<Todo> {
    if (!this.db) throw new Error("Database not set");

    const result = await this.db.query("SELECT * FROM todos WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      throw new Error("Todo not found");
    }

    const current = result.rows[0] as any;
    const updated: Todo = {
      id: current.id,
      name: updates.name ?? current.name,
      number: updates.number ?? current.number,
      created_at: new Date(current.created_at),
    };

    await this.db.query(
      "UPDATE todos SET name = $1, number = $2 WHERE id = $3",
      [updated.name, updated.number, id],
    );

    console.log("✅ Todo updated:", updated.name);
    return updated;
  }

  async deleteTodo(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not set");

    await this.db.query("DELETE FROM todos WHERE id = $1", [id]);
    console.log("✅ Todo deleted:", id);
  }

  async clearAllTodos(): Promise<void> {
    if (!this.db) throw new Error("Database not set");

    await this.db.exec("DELETE FROM todos");
    console.log("✅ All todos cleared");
  }

  // Advanced queries for analytics
  async getTodoStats(): Promise<{ count: number; avgNumber: number }> {
    if (!this.db) throw new Error("Database not set");

    const result = await this.db.query(`
      SELECT
        COUNT(*) as count,
        COALESCE(AVG(number), 0) as avg_number
      FROM todos
    `);

    const row = result.rows[0] as any;
    return {
      count: row.count,
      avgNumber: Math.round(row.avg_number * 100) / 100,
    };
  }

  async getTopTodos(limit: number = 5): Promise<Todo[]> {
    if (!this.db) throw new Error("Database not set");

    const result = await this.db.query(
      "SELECT * FROM todos ORDER BY number DESC LIMIT $1",
      [limit],
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      number: row.number,
      created_at: new Date(row.created_at),
    }));
  }
}

// Singleton instance
export const todoService = new TodoService();
