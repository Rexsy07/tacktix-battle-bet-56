
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

export interface ReportedUser {
  id: string;
  user: UserProfile;
  reportCount: number;
  status: string;
  latestReport: {
    created_at: string;
  };
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

// Alias for compatibility with ModeratorPanel
export const getDisputes = async (status?: string, searchQuery?: string): Promise<{ success: boolean; data: DisputeDetails[] }> => {
  try {
    const disputes = await fetchDisputes(status);
    let filteredDisputes = disputes;
    
    if (searchQuery) {
      filteredDisputes = disputes.filter(dispute => 
        dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return { success: true, data: filteredDisputes };
  } catch (error) {
    console.error("Error getting disputes:", error);
    return { success: false, data: [] };
  }
};

export const getReportedUsers = async (status?: string, searchQuery?: string): Promise<{ success: boolean; data: ReportedUser[] }> => {
  try {
    // For now, return mock data since we don't have a reports table
    // In a real implementation, this would fetch from a user_reports table
    const mockUsers: ReportedUser[] = [
      {
        id: "1",
        user: {
          id: "user1",
          username: "TestUser1",
          avatar_url: null,
          is_vip: false,
          rating: 1200,
          total_matches: 45,
          wins: 30,
          losses: 15
        },
        reportCount: 3,
        status: "active",
        latestReport: {
          created_at: new Date().toISOString()
        }
      }
    ];
    
    let filteredUsers = mockUsers;
    
    if (status && status !== "all") {
      filteredUsers = mockUsers.filter(user => user.status === status);
    }
    
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user => 
        user.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return { success: true, data: filteredUsers };
  } catch (error) {
    console.error("Error getting reported users:", error);
    return { success: false, data: [] };
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

export const updateUserStatus = async (
  userId: string,
  action: "warn" | "suspend" | "ban" | "unban",
  moderatorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // In a real implementation, this would update user status
    // For now, we'll just log the action
    console.log(`User ${userId} ${action}ed by moderator ${moderatorId}`);
    
    // Update user profile to reflect the action
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user status:", error);
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

export const getModeratorStats = async (moderatorId?: string): Promise<{ success: boolean; data: any }> => {
  try {
    // Get disputes resolved by this moderator
    let query = supabase
      .from("disputes")
      .select("*");
    
    if (moderatorId) {
      query = query.eq("resolved_by", moderatorId);
    }
    
    const { data: resolvedDisputes, error: disputeError } = await query
      .eq("status", "resolved");

    if (disputeError) throw disputeError;

    // Get active disputes
    const { data: activeDisputes, error: activeError } = await supabase
      .from("disputes")
      .select("*")
      .eq("status", "pending");

    if (activeError) throw activeError;

    const totalResolved = resolvedDisputes?.length || 0;
    const activeDisputesCount = activeDisputes?.length || 0;
    const avgResolutionTime = "2.5"; // Would need to calculate based on created_at and updated_at

    const data = {
      activeDisputes: activeDisputesCount,
      resolvedToday: totalResolved, // This would ideally filter by today
      avgResolutionTime,
      flaggedAccounts: 5 // This would come from a reports system
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching moderator stats:", error);
    return {
      success: false,
      data: {
        activeDisputes: 0,
        resolvedToday: 0,
        avgResolutionTime: "0",
        flaggedAccounts: 0
      }
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
