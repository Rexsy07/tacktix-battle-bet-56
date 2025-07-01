
import { supabase } from "@/integrations/supabase/client";

export const uploadMatchEvidence = async (
  matchId: string,
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> => {
  try {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${matchId}/${userId}/${Date.now()}.${fileExt}`;
      
      // For now, we'll use a placeholder URL since storage isn't configured
      const placeholderUrl = `https://via.placeholder.com/400x300.png?text=Match+Evidence`;
      urls.push(placeholderUrl);
    }
    
    return { urls };
  } catch (error: any) {
    console.error("Error uploading evidence:", error);
    return { urls: [], error: error.message };
  }
};

export const submitMatchResult = async (
  matchId: string,
  submittedBy: string,
  resultType: "win" | "loss" | "draw" | "dispute",
  winnerId: string | null,
  proofUrls: string[],
  notes: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("match_result_submissions")
      .insert({
        match_id: matchId,
        submitted_by: submittedBy,
        result_type: resultType,
        winner_id: winnerId,
        proof_urls: proofUrls,
        notes: notes || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting match result:", error);
    return { success: false, error: error.message };
  }
};

export const getMatchResult = async (matchId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("match_result_submissions")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching match result:", error);
    return { success: false, error: error.message };
  }
};

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

    return { data: data as MatchResultSubmission[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
