
import { supabase } from "@/integrations/supabase/client";

export interface MatchResultSubmission {
  id: string;
  match_id: string;
  submitted_by: string;
  result_type: "win" | "loss" | "draw" | "dispute";
  winner_id?: string;
  notes?: string;
  proof_urls?: string[];
  created_at: string;
}

export interface PlayerRating {
  id: string;
  match_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface UserReport {
  id: string;
  match_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

/**
 * Submit match result with evidence
 */
export const submitMatchResult = async (
  matchId: string,
  userId: string,
  resultType: "win" | "loss" | "draw" | "dispute",
  winnerId?: string,
  notes?: string,
  proofUrls?: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("match_result_submissions")
      .insert({
        match_id: matchId,
        submitted_by: userId,
        result_type: resultType,
        winner_id: winnerId || null,
        notes: notes || null,
        proof_urls: proofUrls || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Submit player rating
 */
export const submitPlayerRating = async (
  matchId: string,
  raterId: string,
  ratedId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("player_ratings")
      .insert({
        match_id: matchId,
        rater_id: raterId,
        rated_id: ratedId,
        rating,
        comment: comment || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Submit user report using disputes table
 */
export const submitUserReport = async (
  matchId: string,
  reporterId: string,
  reason: string,
  description: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("disputes")
      .insert({
        match_id: matchId,
        reported_by: reporterId,
        reason,
        description,
        status: 'open'
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get match result submissions for moderation
 */
export const getMatchResultSubmissions = async (): Promise<{
  data: MatchResultSubmission[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("match_result_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Get player ratings for a specific user
 */
export const getUserRatings = async (userId: string): Promise<{
  data: PlayerRating[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("player_ratings")
      .select("*")
      .eq("rated_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Upload files to storage (placeholder - you'll need to implement actual storage)
 */
export const uploadMatchEvidence = async (
  files: File[],
  matchId: string
): Promise<{ urls: string[]; error?: string }> => {
  // This is a placeholder implementation
  // In a real app, you would upload to Supabase Storage or another service
  try {
    const urls: string[] = [];
    
    for (const file of files) {
      // Simulate upload - replace with actual storage implementation
      const mockUrl = `https://example.com/evidence/${matchId}/${file.name}`;
      urls.push(mockUrl);
    }
    
    return { urls };
  } catch (error: any) {
    return { urls: [], error: error.message };
  }
};
