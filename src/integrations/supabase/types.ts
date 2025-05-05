export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          order_num: number | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          order_num?: number | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          order_num?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          created_at: string
          html: string
          id: string
          image_id: string | null
          summary_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          html: string
          id?: string
          image_id?: string | null
          summary_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          html?: string
          id?: string
          image_id?: string | null
          summary_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      content_images: {
        Row: {
          blog: string | null
          bucket: string
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          path: string
          prompt: string | null
          script: string | null
          style: string | null
          summary: string | null
          uncategorized: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          blog?: string | null
          bucket: string
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          path: string
          prompt?: string | null
          script?: string | null
          style?: string | null
          summary?: string | null
          uncategorized?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          blog?: string | null
          bucket?: string
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          path?: string
          prompt?: string | null
          script?: string | null
          style?: string | null
          summary?: string | null
          uncategorized?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          bucket: string
          created_at: string
          id: string
          metadata: Json | null
          path: string
          prompt: string | null
          style: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          metadata?: Json | null
          path: string
          prompt?: string | null
          style?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          path?: string
          prompt?: string | null
          style?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string | null
          order_num: number | null
          status: Database["public"]["Enums"]["image_status"] | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          order_num?: number | null
          status?: Database["public"]["Enums"]["image_status"] | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          order_num?: number | null
          status?: Database["public"]["Enums"]["image_status"] | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          cost_usd: number | null
          created_at: string
          file_path: string | null
          height: number | null
          id: string
          metadata: Json | null
          model: string | null
          prompt: string | null
          provider: string | null
          purpose: string | null
          style: string | null
          updated_at: string
          url: string
          user_id: string
          width: number | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          file_path?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt?: string | null
          provider?: string | null
          purpose?: string | null
          style?: string | null
          updated_at?: string
          url: string
          user_id: string
          width?: number | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          file_path?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt?: string | null
          provider?: string | null
          purpose?: string | null
          style?: string | null
          updated_at?: string
          url?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          audience: string | null
          blog_sample_url: string | null
          created_at: string
          img_style: string | null
          mission: string | null
          profession: string | null
          tone: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          blog_sample_url?: string | null
          created_at?: string
          img_style?: string | null
          mission?: string | null
          profession?: string | null
          tone?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          blog_sample_url?: string | null
          created_at?: string
          img_style?: string | null
          mission?: string | null
          profession?: string | null
          tone?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pwned_chat_data: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          role: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          role: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          created_at: string
          id: string
          json: Json
          transcript_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          json: Json
          transcript_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          json?: Json
          transcript_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          created_at: string
          id: string
          source_url: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_url?: string | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_url?: string | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      content_items_legacy: {
        Row: {
          html: string | null
          id: string | null
          image_id: string | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      image_status: "good" | "not_good" | "uncategorized"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      image_status: ["good", "not_good", "uncategorized"],
    },
  },
} as const
