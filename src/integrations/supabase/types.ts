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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      criminal_proceedings: {
        Row: {
          circumstances_description: string
          created_at: string | null
          crime_date: string
          id: string
          incriminating_article: string
          initiating_structure: string
          initiator_full_name: string
          status: string
          suspect_full_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          circumstances_description: string
          created_at?: string | null
          crime_date: string
          id?: string
          incriminating_article: string
          initiating_structure: string
          initiator_full_name: string
          status?: string
          suspect_full_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          circumstances_description?: string
          created_at?: string | null
          crime_date?: string
          id?: string
          incriminating_article?: string
          initiating_structure?: string
          initiator_full_name?: string
          status?: string
          suspect_full_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enterprises: {
        Row: {
          business_type: string | null
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          owner_name: string | null
          registration_number: string | null
        }
        Insert: {
          business_type?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          owner_name?: string | null
          registration_number?: string | null
        }
        Update: {
          business_type?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          owner_name?: string | null
          registration_number?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      laws: {
        Row: {
          created_at: string
          id: string
          link: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          title?: string
        }
        Relationships: []
      }
      lawyers_registry: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean | null
          license_number: string
          name: string
          specialization: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          license_number: string
          name: string
          specialization?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          license_number?: string
          name?: string
          specialization?: string | null
        }
        Relationships: []
      }
      leadership: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          order_index: number | null
          photo_url: string | null
          position: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          photo_url?: string | null
          position: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
          photo_url?: string | null
          position?: string
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
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          title?: string
        }
        Relationships: []
      }
      president_biography: {
        Row: {
          achievements: string | null
          bio: string
          birth_date: string | null
          education: string | null
          full_name: string
          id: string
          photo_url: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          bio: string
          birth_date?: string | null
          education?: string | null
          full_name: string
          id?: string
          photo_url?: string | null
          position?: string
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          bio?: string
          birth_date?: string | null
          education?: string | null
          full_name?: string
          id?: string
          photo_url?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      proceeding_documents: {
        Row: {
          created_at: string | null
          document_link: string
          document_name: string
          id: string
          order_index: number | null
          proceeding_id: string
        }
        Insert: {
          created_at?: string | null
          document_link: string
          document_name: string
          id?: string
          order_index?: number | null
          proceeding_id: string
        }
        Update: {
          created_at?: string | null
          document_link?: string
          document_name?: string
          id?: string
          order_index?: number | null
          proceeding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proceeding_documents_proceeding_id_fkey"
            columns: ["proceeding_id"]
            isOneToOne: false
            referencedRelation: "criminal_proceedings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          nickname: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          nickname?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          nickname?: string | null
        }
        Relationships: []
      }
      statistics: {
        Row: {
          active_tenders_count: number | null
          id: string
          laws_count: number | null
          school_topics_count: number | null
          staff_count: number | null
          updated_at: string
        }
        Insert: {
          active_tenders_count?: number | null
          id?: string
          laws_count?: number | null
          school_topics_count?: number | null
          staff_count?: number | null
          updated_at?: string
        }
        Update: {
          active_tenders_count?: number | null
          id?: string
          laws_count?: number | null
          school_topics_count?: number | null
          staff_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tender_form_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          order_index: number | null
          question_text: string
          question_type: string
          tender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          question_text: string
          question_type: string
          tender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          question_text?: string
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
          created_at: string
          id: string
          question_id: string
          response_text: string
          tender_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_text: string
          tender_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_text?: string
          tender_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_form_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "tender_form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_form_responses_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_form_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          content: string
          created_at: string
          has_form: boolean | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          has_form?: boolean | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          has_form?: boolean | null
          id?: string
          is_active?: boolean | null
          title?: string
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
          voting_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vote: Database["public"]["Enums"]["vote_type"]
          voting_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vote?: Database["public"]["Enums"]["vote_type"]
          voting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voting_id_fkey"
            columns: ["voting_id"]
            isOneToOne: false
            referencedRelation: "votings"
            referencedColumns: ["id"]
          },
        ]
      }
      votings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          link: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          link?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          link?: string | null
          title?: string
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
      app_role:
        | "admin"
        | "license_manager"
        | "law_manager"
        | "deputy"
        | "prosecutor"
        | "aau_manager"
      vote_type: "for" | "against" | "abstain"
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
      app_role: [
        "admin",
        "license_manager",
        "law_manager",
        "deputy",
        "prosecutor",
        "aau_manager",
      ],
      vote_type: ["for", "against", "abstain"],
    },
  },
} as const
