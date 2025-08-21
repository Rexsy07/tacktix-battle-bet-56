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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_published: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_published?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_published?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          evidence_url: string | null
          id: string
          match_id: string
          reason: string
          reported_by: string
          resolution: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          match_id: string
          reason: string
          reported_by: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          match_id?: string
          reason?: string
          reported_by?: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forum_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      match_evidence: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_type: string
          evidence_url: string
          id: string
          match_id: string
          submitted_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_type: string
          evidence_url: string
          id?: string
          match_id: string
          submitted_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_type?: string
          evidence_url?: string
          id?: string
          match_id?: string
          submitted_by?: string
        }
        Relationships: []
      }
      match_participants: {
        Row: {
          id: string
          joined_at: string | null
          match_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          match_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          match_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      match_players: {
        Row: {
          id: string
          joined_at: string | null
          match_id: string
          team: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          match_id: string
          team: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          match_id?: string
          team?: string
          user_id?: string
        }
        Relationships: []
      }
      match_result_submissions: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          notes: string | null
          proof_urls: string[] | null
          result_type: string
          submitted_by: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          notes?: string | null
          proof_urls?: string[] | null
          result_type: string
          submitted_by: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          notes?: string | null
          proof_urls?: string[] | null
          result_type?: string
          submitted_by?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      match_results: {
        Row: {
          deaths: number | null
          evidence_url: string | null
          id: string
          kills: number | null
          match_id: string
          participant_id: string
          placement: number | null
          score: number | null
          submitted_at: string | null
        }
        Insert: {
          deaths?: number | null
          evidence_url?: string | null
          id?: string
          kills?: number | null
          match_id: string
          participant_id: string
          placement?: number | null
          score?: number | null
          submitted_at?: string | null
        }
        Update: {
          deaths?: number | null
          evidence_url?: string | null
          id?: string
          kills?: number | null
          match_id?: string
          participant_id?: string
          placement?: number | null
          score?: number | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          bet_amount: number | null
          created_at: string | null
          created_by: string
          current_players: number | null
          description: string | null
          end_time: string | null
          entry_fee: number | null
          game_mode: string
          host_id: string | null
          host_notes: string | null
          id: string
          is_featured: boolean | null
          is_vip_match: boolean | null
          lobby_code: string | null
          map_name: string | null
          match_started: boolean | null
          match_started_at: string | null
          max_players: number | null
          opponent_id: string | null
          platform_fee: number | null
          prize_pool: number | null
          scheduled_time: string | null
          start_time: string | null
          status: string | null
          team_a_players: string[] | null
          team_b_players: string[] | null
          team_players: number | null
          team_size: string | null
          teams: Json | null
          title: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          bet_amount?: number | null
          created_at?: string | null
          created_by: string
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_mode: string
          host_id?: string | null
          host_notes?: string | null
          id?: string
          is_featured?: boolean | null
          is_vip_match?: boolean | null
          lobby_code?: string | null
          map_name?: string | null
          match_started?: boolean | null
          match_started_at?: string | null
          max_players?: number | null
          opponent_id?: string | null
          platform_fee?: number | null
          prize_pool?: number | null
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          team_a_players?: string[] | null
          team_b_players?: string[] | null
          team_players?: number | null
          team_size?: string | null
          teams?: Json | null
          title: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number | null
          created_at?: string | null
          created_by?: string
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_mode?: string
          host_id?: string | null
          host_notes?: string | null
          id?: string
          is_featured?: boolean | null
          is_vip_match?: boolean | null
          lobby_code?: string | null
          map_name?: string | null
          match_started?: boolean | null
          match_started_at?: string | null
          max_players?: number | null
          opponent_id?: string | null
          platform_fee?: number | null
          prize_pool?: number | null
          scheduled_time?: string | null
          start_time?: string | null
          status?: string | null
          team_a_players?: string[] | null
          team_b_players?: string[] | null
          team_players?: number | null
          team_size?: string | null
          teams?: Json | null
          title?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: []
      }
      platform_earnings: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          match_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          match_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          match_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      player_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          rated_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          favorite_game: string | null
          gaming_experience: string | null
          id: string
          is_moderator: boolean | null
          is_vip: boolean | null
          losses: number | null
          phone: string | null
          preferred_game_modes: string[] | null
          rating: number | null
          skill_level: string | null
          total_earnings: number | null
          total_matches: number | null
          updated_at: string | null
          username: string
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          favorite_game?: string | null
          gaming_experience?: string | null
          id: string
          is_moderator?: boolean | null
          is_vip?: boolean | null
          losses?: number | null
          phone?: string | null
          preferred_game_modes?: string[] | null
          rating?: number | null
          skill_level?: string | null
          total_earnings?: number | null
          total_matches?: number | null
          updated_at?: string | null
          username: string
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          favorite_game?: string | null
          gaming_experience?: string | null
          id?: string
          is_moderator?: boolean | null
          is_vip?: boolean | null
          losses?: number | null
          phone?: string | null
          preferred_game_modes?: string[] | null
          rating?: number | null
          skill_level?: string | null
          total_earnings?: number | null
          total_matches?: number | null
          updated_at?: string | null
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          registered_at: string | null
          status: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          registered_at?: string | null
          status?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          registered_at?: string | null
          status?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string | null
          created_by: string
          current_participants: number | null
          description: string | null
          end_date: string | null
          entry_fee: number | null
          game_mode: string
          id: string
          max_participants: number
          name: string
          prize_pool: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          game_mode: string
          id?: string
          max_participants: number
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          game_mode?: string
          id?: string
          max_participants?: number
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          match_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          match_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_code: string
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_code: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_code?: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_team_to_player: {
        Args: { match_uuid: string; player_uuid: string }
        Returns: number
      }
      generate_unique_username: {
        Args: { base_username: string }
        Returns: string
      }
      update_user_balance: {
        Args: { amount_change: number; user_id: string }
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
    Enums: {},
  },
} as const
