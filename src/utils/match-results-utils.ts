
import { supabase } from "@/integrations/supabase/client";

/**
 * Submit match result with proof
 */
export const submitMatchResult = async (
  matchId: string, 
  submitterId: string, 
  resultType: "win" | "loss" | "draw" | "dispute",
  winnerId: string | null,
  proofUrls: string[],
  notes?: string
) => {
  try {
    const { data, error } = await supabase
      .from("match_results")
      .insert({
        match_id: matchId,
        submitted_by: submitterId,
        winner_id: winnerId,
        result_type: resultType,
        proof_urls: proofUrls,
        notes: notes || null
      })
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error submitting match result:", error);
    return { success: false, error: error.message || "Failed to submit result" };
  }
};

/**
 * Get match result
 */
export const getMatchResult = async (matchId: string) => {
  try {
    const { data, error } = await supabase
      .from("match_results")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (error) throw error;
    return { success: true, data: data?.[0] || null };
  } catch (error: any) {
    console.error("Error fetching match result:", error);
    return { success: false, error: error.message || "Failed to fetch result" };
  }
};

/**
 * Upload match evidence
 */
export const uploadMatchEvidence = async (
  matchId: string,
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> => {
  try {
    const urls: string[] = [];
    
    // Ensure storage bucket exists
    await supabase.functions.invoke("create-storage-bucket");
    
    // Upload each file
    for (const file of files) {
      const fileName = `${matchId}/${userId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from("match-evidence")
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from("match-evidence")
        .getPublicUrl(fileName);
        
      urls.push(publicUrl);
    }
    
    return { urls };
  } catch (error: any) {
    console.error("Error uploading match evidence:", error);
    return { urls: [], error: error.message || "Failed to upload evidence" };
  }
};
