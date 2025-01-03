export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          completed: boolean;
          user_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["todos"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["todos"]["Insert"]>;
      };
      // Add other tables as needed
    };
  };
}
