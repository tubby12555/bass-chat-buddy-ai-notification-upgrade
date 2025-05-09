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
      blog: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
        Relationships: []
      }
      chat_data: {
        Row: {
          chat_title: string | null
          created_at: string | null
          id: number
          message: Json
          model_type: string | null
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_title?: string | null
          created_at?: string | null
          id?: number
          message: Json
          model_type?: string | null
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_title?: string | null
          created_at?: string | null
          id?: number
          message?: Json
          model_type?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      content_images: {
        Row: {
          blog: string | null
          bucket: string | null
          content_type: string | null
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          path: string | null
          permanent_url: string | null
          prompt: string | null
          script: string | null
          style: string | null
          summary: string | null
          temp_url: string | null
          uncategorized: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          blog?: string | null
          bucket?: string | null
          content_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          path?: string | null
          permanent_url?: string | null
          prompt?: string | null
          script?: string | null
          style?: string | null
          summary?: string | null
          temp_url?: string | null
          uncategorized?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          blog?: string | null
          bucket?: string | null
          content_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          path?: string | null
          permanent_url?: string | null
          prompt?: string | null
          script?: string | null
          style?: string | null
          summary?: string | null
          temp_url?: string | null
          uncategorized?: string | null
          updated_at?: string
          url?: string | null
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
            foreignKeyName: "fk_notes_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
          content: string
          id: string
          model_type: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          model_type?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          id?: string
          model_type?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pwned_chat_data_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      script: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      summaries: {
        Row: {
          created_at: string
          id: string
          json: Json
          summary: string
          transcript_id: string
          updated_at: string
          user_id: string
          video_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          json: Json
          summary: string
          transcript_id: string
          updated_at?: string
          user_id: string
          video_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          json?: Json
          summary?: string
          transcript_id?: string
          updated_at?: string
          user_id?: string
          video_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_summaries_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transcripts: {
        Row: {
          created_at: string
          id: string
          source_url: string
          transcript: string | null
          updated_at: string
          user_id: string
          video_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source_url: string
          transcript?: string | null
          updated_at?: string
          user_id: string
          video_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source_url?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transcripts_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      video_content: {
        Row: {
          blog_post_basic: string | null
          blog_post_premium: string | null
          created_at: string | null
          email: string | null
          id: string
          script: string | null
          session_id: string | null
          social_ig: string | null
          summary: string | null
          thumbnail_url: string | null
          title: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string
          video_id: string | null
          video_url: string
        }
        Insert: {
          blog_post_basic?: string | null
          blog_post_premium?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          script?: string | null
          session_id?: string | null
          social_ig?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          video_id?: string | null
          video_url: string
        }
        Update: {
          blog_post_basic?: string | null
          blog_post_premium?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          script?: string | null
          session_id?: string | null
          social_ig?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      image_status: "good" | "not_good" | "uncategorized"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
