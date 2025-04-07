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
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          match_id: string
          reason: string
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_id: string
          reason: string
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_id?: string
          reason?: string
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_stats: {
        Row: {
          id: string
          matches_played: number
          matches_won: number
          total_earnings: number
          updated_at: string
          win_rate: number | null
        }
        Insert: {
          id: string
          matches_played?: number
          matches_won?: number
          total_earnings?: number
          updated_at?: string
          win_rate?: number | null
        }
        Update: {
          id?: string
          matches_played?: number
          matches_won?: number
          total_earnings?: number
          updated_at?: string
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_evidence: {
        Row: {
          evidence_type: string
          evidence_url: string
          id: string
          match_id: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          evidence_type: string
          evidence_url: string
          id?: string
          match_id: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          evidence_type?: string
          evidence_url?: string
          id?: string
          match_id?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_evidence_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_evidence_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          created_at: string
          id: string
          match_id: string
          notes: string | null
          proof_urls: string[]
          result_type: string
          submitted_by: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          notes?: string | null
          proof_urls?: string[]
          result_type: string
          submitted_by: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          notes?: string | null
          proof_urls?: string[]
          result_type?: string
          submitted_by?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          bet_amount: number
          completion_deadline: string | null
          created_at: string
          game_mode: string
          host_id: string
          id: string
          is_vip_match: boolean
          lobby_code: string
          map_name: string
          opponent_id: string | null
          start_time: string | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          completion_deadline?: string | null
          created_at?: string
          game_mode: string
          host_id: string
          id?: string
          is_vip_match?: boolean
          lobby_code: string
          map_name: string
          opponent_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          completion_deadline?: string | null
          created_at?: string
          game_mode?: string
          host_id?: string
          id?: string
          is_vip_match?: boolean
          lobby_code?: string
          map_name?: string
          opponent_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          moderator_id: string
          target_dispute_id: string | null
          target_report_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id: string
          target_dispute_id?: string | null
          target_report_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id?: string
          target_dispute_id?: string | null
          target_report_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderator_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderator_actions_target_dispute_id_fkey"
            columns: ["target_dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderator_actions_target_report_id_fkey"
            columns: ["target_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderator_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderators: {
        Row: {
          created_at: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          codm_id: string | null
          created_at: string
          email: string
          id: string
          is_verified: boolean
          is_vip: boolean
          phone: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          codm_id?: string | null
          created_at?: string
          email: string
          id: string
          is_verified?: boolean
          is_vip?: boolean
          phone?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          codm_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_verified?: boolean
          is_vip?: boolean
          phone?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          details: Json | null
          id: string
          payment_method: string | null
          status: string
          transaction_type: string | null
          type: string
          updated_at: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          payment_method?: string | null
          status: string
          transaction_type?: string | null
          type: string
          updated_at?: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_type?: string | null
          type?: string
          updated_at?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          match_id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          default_bet_amount: number | null
          favorite_map: string | null
          id: string
          preferred_game_mode: string | null
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_bet_amount?: number | null
          favorite_map?: string | null
          id?: string
          preferred_game_mode?: string | null
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_bet_amount?: number | null
          favorite_map?: string | null
          id?: string
          preferred_game_mode?: string | null
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_vip_subscription: {
        Args: {
          user_uuid: string
          level: string
          duration_months: number
          payment_amount: number
        }
        Returns: undefined
      }
      process_match_outcome: {
        Args: { match_id: string; winner_id: string }
        Returns: undefined
      }
      update_wallet_balance: {
        Args: { user_uuid: string; amount_to_add: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
