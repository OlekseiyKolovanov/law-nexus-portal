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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      enterprises: {
        Row: {
          business_type: string
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          owner_name: string
          registration_number: string | null
          updated_at: string
        }
        Insert: {
          business_type: string
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          owner_name: string
          registration_number?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          owner_name?: string
          registration_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          message: string
          message_type: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          message_type?: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          message_type?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      laws: {
        Row: {
          created_at: string
          id: string
          link: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lawyers_registry: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean
          license_number: string
          name: string
          specialization: string | null
          updated_at: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          license_number: string
          name: string
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          license_number?: string
          name?: string
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leadership: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          order_index: number
          photo_url: string | null
          position: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          order_index?: number
          photo_url?: string | null
          position: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          photo_url?: string | null
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_school: {
        Row: {
          content: string | null
          created_at: string
          id: string
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      statistics: {
        Row: {
          active_tenders_count: number
          id: string
          laws_count: number
          school_topics_count: number
          staff_count: number
          updated_at: string
        }
        Insert: {
          active_tenders_count?: number
          id?: string
          laws_count?: number
          school_topics_count?: number
          staff_count?: number
          updated_at?: string
        }
        Update: {
          active_tenders_count?: number
          id?: string
          laws_count?: number
          school_topics_count?: number
          staff_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      tender_form_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          options: string[] | null
          order_index: number
          question: string
          question_type: string
          tender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: string[] | null
          order_index?: number
          question: string
          question_type?: string
          tender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          options?: string[] | null
          order_index?: number
          question?: string
          question_type?: string
          tender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_form_questions_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_form_responses: {
        Row: {
          id: string
          responses: Json
          submitted_at: string
          tender_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          responses: Json
          submitted_at?: string
          tender_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          responses?: Json
          submitted_at?: string
          tender_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_form_responses_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          content: string
          created_at: string
          has_form: boolean
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          has_form?: boolean
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          has_form?: boolean
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "license_manager" | "law_manager"
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
      app_role: ["admin", "license_manager", "law_manager"],
    },
  },
} as const
