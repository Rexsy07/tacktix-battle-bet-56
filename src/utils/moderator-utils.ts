
import { supabase } from "@/integrations/supabase/client";

export interface DisputeDetails {
  id: string;
  match_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: string;
  evidence_url: string | null;
  resolution: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_vip: boolean;
  rating: number;
  total_matches: number;
  wins: number;
  losses: number;
}

export const fetchDisputes = async (status?: string): Promise<DisputeDetails[]> => {
  try {
    let query = supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return [];
  }
};

export const updateDisputeStatus = async (
  disputeId: string,
  status: string,
  resolution?: string,
  adminNotes?: string,
  moderatorId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (resolution) updateData.resolution = resolution;
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (moderatorId) updateData.resolved_by = moderatorId;

    const { error } = await supabase
      .from("disputes")
      .update(updateData)
      .eq("id", disputeId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating dispute:", error);
    return { success: false, error: error.message };
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const suspendUser = async (
  userId: string,
  reason: string,
  duration: number,
  moderatorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update user profile to mark as suspended
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error: any) {
    console.error("Error suspending user:", error);
    return { success: false, error: error.message };
  }
};

export const getModeratorStats = async (moderatorId: string) => {
  try {
    // Get disputes resolved by this moderator
    const { data: resolvedDisputes, error: disputeError } = await supabase
      .from("disputes")
      .select("*")
      .eq("resolved_by", moderatorId)
      .eq("status", "resolved");

    if (disputeError) throw disputeError;

    const totalResolved = resolvedDisputes?.length || 0;
    const avgResolutionTime = 0; // Would need to calculate based on created_at and updated_at

    return {
      totalResolved,
      avgResolutionTime,
      activeDisputes: 0
    };
  } catch (error) {
    console.error("Error fetching moderator stats:", error);
    return {
      totalResolved: 0,
      avgResolutionTime: 0,
      activeDisputes: 0
    };
  }
};

export const fetchRecentActivity = async (): Promise<any[]> => {
  try {
    // Fetch recent disputes for activity feed
    const { data: disputes, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return disputes?.map(dispute => ({
      id: dispute.id,
      type: 'dispute',
      description: `New dispute: ${dispute.reason}`,
      timestamp: dispute.created_at,
      status: dispute.status
    })) || [];
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
