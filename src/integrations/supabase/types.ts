export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          team: Database["public"]["Enums"]["team_type"] | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          team?: Database["public"]["Enums"]["team_type"] | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          team?: Database["public"]["Enums"]["team_type"] | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screen_sessions: {
        Row: {
          id: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screen_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      sessions: {
        Row: {
          break_time: number
          created_at: string
          end_time: string | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          break_time?: number
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          break_time?: number
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }

      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      metric_config: {
        Row: {
          better_direction: "up" | "down"
          metric_name: string
        }
        Insert: {
          better_direction: "up" | "down"
          metric_name: string
        }
        Update: {
          better_direction?: "up" | "down"
          metric_name?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_name: string
          project_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          metric_name: string
          project_id: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_name?: string
          project_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_metric_name_fkey"
            columns: ["metric_name"]
            isOneToOne: false
            referencedRelation: "metric_config"
            referencedColumns: ["metric_name"]
          },
          {
            foreignKeyName: "metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_goals: {
        Row: {
          created_at: string
          current_value: number
          id: string
          metric_name: string
          project_id: string
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          id?: string
          metric_name: string
          project_id: string
          target_value: number
          title: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          metric_name?: string
          project_id?: string
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_goals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          created_at: string
          id: string
          project_id: string | null
          status: string
          task_type: string
          title: string
          category: string | null
          time_spent: number | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          status?: string
          task_type: string
          title: string
          category?: string | null
          time_spent?: number | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          status?: string
          task_type?: string
          title?: string
          category?: string | null
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          deal_id: string | null
          id: string
          name: string
          project_lead_id: string | null
          project_type: string
          deadline: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          name: string
          project_lead_id?: string | null
          project_type: string
          deadline?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          name?: string
          project_lead_id?: string | null
          project_type?: string
          deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_project_lead_id_fkey"
            columns: ["project_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          }
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          created_at: string
          deal_value: number
          id: string
          lead_id: string | null
          service_type: string
          status: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          deal_value?: number
          id?: string
          lead_id?: string | null
          service_type: string
          status?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          deal_value?: number
          id?: string
          lead_id?: string | null
          service_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          contact: string
          created_at: string
          id: string
          name: string
          source: string | null
          status: string
        }
        Insert: {
          assigned_to?: string | null
          contact: string
          created_at?: string
          id?: string
          name: string
          source?: string | null
          status?: string
        }
        Update: {
          assigned_to?: string | null
          contact?: string
          created_at?: string
          id?: string
          name?: string
          source?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          role_in_project: string
          user_id: string
        }
        Insert: {
          id?: string
          project_id: string
          role_in_project: string
          user_id: string
        }
        Update: {
          id?: string
          project_id?: string
          role_in_project?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "client" | "sales"
      team_type: "marketing" | "web_dev" | "content" | "sales"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "employee", "client", "sales"],
      team_type: ["marketing", "web_dev", "content", "sales"],
    },
  },
} as const
