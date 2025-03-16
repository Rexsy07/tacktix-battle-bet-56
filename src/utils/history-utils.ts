
import { supabase } from "@/integrations/supabase/client";

/**
 * Get user's match history
 */
export const getUserMatchHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  try {
    let query = supabase
      .from("matches")
      .select(`
        *,
        host:profiles!matches_host_id_fkey(*),
        opponent:profiles!matches_opponent_id_fkey(*),
        winner:profiles!matches_winner_id_fkey(*)
      `)
      .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    
    // Apply status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: data || [],
      count 
    };
  } catch (error: any) {
    console.error("Error fetching match history:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch match history",
      data: [],
      count: 0 
    };
  }
};

/**
 * Get user's match stats
 */
export const getUserMatchStats = async (userId: string) => {
  try {
    // Get from leaderboard_stats table
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from("leaderboard_stats")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (leaderboardError && leaderboardError.code !== "PGRST116") {
      throw leaderboardError;
    }
    
    // If no leaderboard data, calculate stats directly
    if (!leaderboardData) {
      // Get total matches
      const { count: totalMatches, error: totalError } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
        .in("status", ["completed", "disputed"]);
        
      if (totalError) throw totalError;
      
      // Get won matches
      const { count: wonMatches, error: wonError } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("winner_id", userId);
        
      if (wonError) throw wonError;
      
      // Calculate win rate
      const winRate = totalMatches ? Math.round((wonMatches / totalMatches) * 100) : 0;
      
      // Get earnings
      const { data: earnings, error: earningsError } = await supabase
        .from("matches")
        .select("bet_amount")
        .eq("winner_id", userId)
        .eq("status", "completed");
        
      if (earningsError) throw earningsError;
      
      const totalEarnings = earnings ? earnings.reduce((total, match) => total + (match.bet_amount * 2), 0) : 0;
      
      return {
        success: true,
        data: {
          matches_played: totalMatches || 0,
          matches_won: wonMatches || 0,
          win_rate: winRate,
          total_earnings: totalEarnings
        }
      };
    }
    
    return { success: true, data: leaderboardData };
  } catch (error: any) {
    console.error("Error fetching user match stats:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch match stats",
      data: {
        matches_played: 0,
        matches_won: 0,
        win_rate: 0,
        total_earnings: 0
      }
    };
  }
};
