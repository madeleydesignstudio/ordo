import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq, desc } from "drizzle-orm";
import { todos, type Todo, type NewTodo } from "@ordo/supabase";

interface TodoStats {
  count: number;
  avgNumber: number;
}

interface SyncResult {
  success: boolean;
  count: number;
  error?: string;
}

export class TodoService {
  private client: PGlite | null = null;
  private db: ReturnType<typeof drizzle> | null = null;

  private static readonly REQUIRED_COLUMNS = [
    "id",
    "name",
    "number",
    "created_at",
    "updated_at",
    "user_id",
  ];

  private static readonly CREATE_TABLE_SQL = `
    CREATE TABLE todos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      number INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT
    );
  `;

  setDatabase(database: PGlite): void {
    this.client = database;
    this.db = drizzle(database, { schema: { todos } });
  }

  async initialize(): Promise<void> {
    this.validateDatabase();

    const needsMigration = await this.checkSchemaMigration();

    if (needsMigration) {
      await this.resetDatabase();
    } else {
      await this.createTableIfNotExists();
    }
  }

  private validateDatabase(): void {
    if (!this.db || !this.client) {
      throw new Error("Database not set");
    }
  }

  private async checkSchemaMigration(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'todos'
      `);

      const columns = result.rows.map((row) => (row as any).column_name);

      return (
        result.rows.length === 0 ||
        !TodoService.REQUIRED_COLUMNS.every((col) => columns.includes(col))
      );
    } catch (error) {
      return true;
    }
  }

  private async createTableIfNotExists(): Promise<void> {
    if (!this.client) return;

    await this.client.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT
      );
    `);
  }

  private async resetDatabase(): Promise<void> {
    if (!this.client) return;

    await this.client.exec(`DROP TABLE IF EXISTS todos;`);
    await this.client.exec(TodoService.CREATE_TABLE_SQL);
  }

  async getAllTodos(): Promise<Todo[]> {
    this.validateDatabase();
    return await this.db!.select().from(todos).orderBy(desc(todos.createdAt));
  }

  async createTodo(
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">,
  ): Promise<Todo> {
    this.validateDatabase();

    const newTodo: NewTodo = {
      id: crypto.randomUUID(),
      name: todo.name,
      number: todo.number,
      createdAt: new Date(),
    };

    const [created] = await this.db!.insert(todos).values(newTodo).returning();

    if (!created) {
      throw new Error("Failed to create todo");
    }

    return created;
  }

  async updateTodo(
    id: string,
    updates: Partial<Pick<Todo, "name" | "number">>,
  ): Promise<Todo> {
    this.validateDatabase();

    const [updated] = await this.db!.update(todos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();

    if (!updated) {
      throw new Error("Todo not found");
    }

    return updated;
  }

  async deleteTodo(id: string): Promise<void> {
    this.validateDatabase();
    await this.db!.delete(todos).where(eq(todos.id, id));
  }

  async clearAllTodos(): Promise<void> {
    this.validateDatabase();
    await this.db!.delete(todos);
  }

  async getTodoStats(): Promise<TodoStats> {
    this.validateDatabase();

    const result = await this.client!.query(`
      SELECT
        COUNT(*) as count,
        COALESCE(AVG(number), 0) as avg_number
      FROM todos
    `);

    const row = result.rows[0] as any;
    return {
      count: parseInt(row.count),
      avgNumber: Math.round(parseFloat(row.avg_number) * 100) / 100,
    };
  }

  async getTopTodos(limit: number = 5): Promise<Todo[]> {
    this.validateDatabase();

    const result = await this.client!.query(
      "SELECT * FROM todos ORDER BY number DESC LIMIT $1",
      [limit],
    );

    return result.rows.map((row: any) => this.mapRowToTodo(row));
  }

  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      name: row.name,
      number: row.number,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
      userId: row.user_id,
    };
  }

  async pushToCloud(userId: string): Promise<SyncResult> {
    try {
      this.validateDatabase();

      // OFFLINE-FIRST: Only sync when explicitly requested and online
      if (!navigator.onLine) {
        return {
          success: false,
          count: 0,
          error: "Cannot sync while offline",
        };
      }

      const localTodos = await this.getAllTodos();
      if (localTodos.length === 0) {
        return {
          success: true,
          count: 0,
        };
      }

      // Lazy load cloud service only when needed
      const { cloudTodoService } = await import("@ordo/supabase");

      const todosToSync = localTodos.map((todo) => ({
        id: todo.id,
        name: todo.name,
        number: todo.number,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      }));

      console.log("☁️ Syncing todos to cloud...", {
        count: todosToSync.length,
      });
      return await cloudTodoService.pushLocalTodos(todosToSync, userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.warn("❌ Cloud sync failed:", errorMessage);
      return {
        success: false,
        count: 0,
        error: errorMessage,
      };
    }
  }

  async hasTodosToSync(): Promise<boolean> {
    try {
      const todos = await this.getAllTodos();
      return todos.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const todoService = new TodoService();

// Re-export types for compatibility
export type { Todo, NewTodo };
