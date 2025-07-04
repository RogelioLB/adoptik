export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      adoption_requests: {
        Row: {
          animal_id: number | null;
          created_at: string | null;
          id: number;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          animal_id?: number | null;
          created_at?: string | null;
          id?: never;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          animal_id?: number | null;
          created_at?: string | null;
          id?: never;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "adoption_requests_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          }
        ];
      };
      animals: {
        Row: {
          age: number | null;
          created_at: string | null;
          description: string | null;
          id: number;
          image_url: string | null;
          name: string | null;
          species: string | null;
        };
        Insert: {
          age?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: never;
          image_url?: string | null;
          name?: string | null;
          species?: string | null;
        };
        Update: {
          age?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: never;
          image_url?: string | null;
          name?: string | null;
          species?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: number;
          is_read: boolean | null;
          message: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          is_read?: boolean | null;
          message?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          is_read?: boolean | null;
          message?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          id: number;
          name: string | null;
          role: Database["public"]["Enums"]["Roles"] | null;
          user_id: string | null;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: never;
          name?: string | null;
          role?: Database["public"]["Enums"]["Roles"] | null;
          user_id?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: never;
          name?: string | null;
          role?: Database["public"]["Enums"]["Roles"] | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          animal_id: number | null;
          created_at: string | null;
          id: number;
          likes: number | null;
          shares: number | null;
          video_url: string | null;
          views: number | null;
        };
        Insert: {
          animal_id?: number | null;
          created_at?: string | null;
          id?: never;
          likes?: number | null;
          shares?: number | null;
          video_url?: string | null;
          views?: number | null;
        };
        Update: {
          animal_id?: number | null;
          created_at?: string | null;
          id?: never;
          likes?: number | null;
          shares?: number | null;
          video_url?: string | null;
          views?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "videos_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      Roles: "Admin" | "User";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      Roles: ["Admin", "User"],
    },
  },
} as const;
