
import { supabase } from "@/integrations/supabase/client";

/**
 * Get featured matches (high stake or VIP matches)
 */
export const getFeaturedMatches = async (limit: number = 5) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        host:profiles!matches_host_id_fkey(*),
        opponent:profiles!matches_opponent_id_fkey(*)
      `)
      .in("status", ["open", "active"])
      .order("bet_amount", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching featured matches:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch featured matches",
      data: []
    };
  }
};

/**
 * Get live/active matches
 */
export const getLiveMatches = async (limit: number = 6) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        host:profiles!matches_host_id_fkey(*),
        opponent:profiles!matches_opponent_id_fkey(*)
      `)
      .in("status", ["active"])
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching live matches:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch live matches",
      data: []
    };
  }
};

/**
 * Get leaderboard data from profiles table
 */
export const getLeaderboardData = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .gt("total_matches", 0)
      .order("total_earnings", { ascending: false })
      .order("wins", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Transform the data to match expected format
    const transformedData = data?.map(profile => ({
      id: profile.id,
      profile: profile,
      matches_played: profile.total_matches || 0,
      total_earnings: profile.total_earnings || 0,
      win_rate: profile.total_matches > 0 
        ? Math.round((profile.wins / profile.total_matches) * 100 * 10) / 10
        : 0
    })) || [];
    
    return { success: true, data: transformedData };
  } catch (error: any) {
    console.error("Error fetching leaderboard data:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch leaderboard data",
      data: []
    };
  }
};

/**
 * Get game modes
 */
export const getGameModes = async () => {
  try {
    // Using the most common game modes from matches
    const { data, error } = await supabase
      .from("matches")
      .select("game_mode")
      .limit(1000);
      
    if (error) throw error;
    
    // Count occurrences of each game mode
    const gameModes = data?.reduce((acc, match) => {
      const mode = match.game_mode;
      if (!acc[mode]) acc[mode] = 0;
      acc[mode]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array of { name, count } objects
    const sortedModes = Object.entries(gameModes || {})
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    return { success: true, data: sortedModes };
  } catch (error: any) {
    console.error("Error fetching game modes:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch game modes",
      data: []
    };
  }
};
