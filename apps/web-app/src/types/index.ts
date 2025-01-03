export interface User {
  id: string;
  email: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  date: string;
  content: string;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}
