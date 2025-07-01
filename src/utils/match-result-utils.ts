
import { supabase } from "@/integrations/supabase/client";

export const submitMatchResult = async (
  matchId: string,
  submittedBy: string,
  resultType: string,
  winnerId: string | null,
  evidenceUrls: string[],
  description: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("match_result_submissions")
      .insert({
        match_id: matchId,
        submitted_by: submittedBy,
        result_type: resultType,
        winner_id: winnerId,
        evidence_urls: evidenceUrls,
        description: description || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting match result:", error);
    return { success: false, error: error.message };
  }
};

export const getMatchResults = async (matchId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("match_result_submissions")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching match results:", error);
    return { success: false, error: error.message };
  }
};

export const approveMatchResult = async (
  submissionId: string,
  moderatorId: string,
  matchId: string,
  winnerId: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update the submission status
    const { error: submissionError } = await supabase
      .from("match_result_submissions")
      .update({
        status: "approved",
        reviewed_by: moderatorId,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", submissionId);

    if (submissionError) throw submissionError;

    // Update the match with the winner and status
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        status: "completed",
        winner_id: winnerId,
        end_time: new Date().toISOString()
      })
      .eq("id", matchId);

    if (matchError) throw matchError;

    return { success: true };
  } catch (error: any) {
    console.error("Error approving match result:", error);
    return { success: false, error: error.message };
  }
};

export const getUserReports = async (userId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    let query = supabase
      .from("user_reports")
      .select(`
        *,
        reporter:profiles!user_reports_reporter_id_fkey(username),
        reported_user:profiles!user_reports_reported_user_id_fkey(username),
        match:matches(title)
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("reported_user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching user reports:", error);
    return { success: false, error: error.message };
  }
};

export const getPlayerRatings = async (userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("player_ratings")
      .select(`
        *,
        rater:profiles!player_ratings_rater_id_fkey(username),
        match:matches(title)
      `)
      .eq("rated_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching player ratings:", error);
    return { success: false, error: error.message };
  }
};
