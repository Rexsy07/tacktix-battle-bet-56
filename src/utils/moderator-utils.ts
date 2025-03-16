
import { supabase } from "@/integrations/supabase/client";

/**
 * Get active disputes with pagination
 */
export const getDisputes = async (
  status?: string,
  searchQuery?: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    let query = supabase
      .from("disputes")
      .select(`
        *,
        match:matches(*),
        reporter:profiles!disputes_reported_by_fkey(*)
      `)
      .order("created_at", { ascending: false });
    
    // Apply status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    
    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`
        match.lobby_code.ilike.%${searchQuery}%,
        match.game_mode.ilike.%${searchQuery}%,
        match.map_name.ilike.%${searchQuery}%,
        reporter.username.ilike.%${searchQuery}%
      `);
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
    console.error("Error fetching disputes:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch disputes",
      data: [],
      count: 0 
    };
  }
};

/**
 * Get reported users with pagination
 */
export const getReportedUsers = async (
  status?: string,
  searchQuery?: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    // First get all users who have reports against them
    let query = supabase
      .from("reports")
      .select(`
        *,
        reported_user:profiles!reports_reported_user_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    
    // Apply status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    
    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`
        reported_user.username.ilike.%${searchQuery}%,
        reported_user.id.ilike.%${searchQuery}%
      `);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data: reportData, error, count } = await query;
    
    if (error) throw error;
    
    // Get counts for each reported user
    const reportedUsersWithCounts = await Promise.all(
      (reportData || []).map(async (report) => {
        const userId = report.reported_user_id;
        const { count: reportCount, error: countError } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("reported_user_id", userId);
          
        if (countError) throw countError;
        
        return {
          id: userId,
          user: report.reported_user,
          latestReport: report,
          reportCount: reportCount || 0,
          status: determineUserStatus(reportCount || 0, report.status)
        };
      })
    );
    
    return { 
      success: true, 
      data: reportedUsersWithCounts,
      count 
    };
  } catch (error: any) {
    console.error("Error fetching reported users:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch reported users",
      data: [],
      count: 0
    };
  }
};

/**
 * Determine user status based on report count and latest report status
 */
const determineUserStatus = (reportCount: number, latestReportStatus: string): "active" | "warned" | "suspended" | "banned" => {
  if (latestReportStatus === "banned") return "banned";
  if (latestReportStatus === "suspended") return "suspended";
  if (latestReportStatus === "warned" || reportCount >= 3) return "warned";
  return "active";
};

/**
 * Get moderator actions for the dashboard
 */
export const getModeratorStats = async () => {
  try {
    // Get active disputes count
    const { count: activeDisputesCount, error: disputeError } = await supabase
      .from("disputes")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "reviewing"]);
      
    if (disputeError) throw disputeError;
    
    // Get resolved disputes count today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: resolvedTodayCount, error: resolvedError } = await supabase
      .from("disputes")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("resolved_at", today.toISOString());
      
    if (resolvedError) throw resolvedError;
    
    // Get average resolution time for disputes resolved in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentlyResolved, error: avgTimeError } = await supabase
      .from("disputes")
      .select("created_at, resolved_at")
      .eq("status", "resolved")
      .gte("resolved_at", sevenDaysAgo.toISOString());
      
    if (avgTimeError) throw avgTimeError;
    
    let avgResolutionTime = 0;
    if (recentlyResolved && recentlyResolved.length > 0) {
      const totalHours = recentlyResolved.reduce((total, dispute) => {
        if (!dispute.resolved_at || !dispute.created_at) return total;
        const created = new Date(dispute.created_at);
        const resolved = new Date(dispute.resolved_at);
        const hoursToResolve = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        return total + hoursToResolve;
      }, 0);
      avgResolutionTime = totalHours / recentlyResolved.length;
    }
    
    // Get flagged accounts count
    const { count: flaggedAccountsCount, error: flaggedError } = await supabase
      .from("reports")
      .select("reported_user_id", { count: "exact", head: true })
      .in("status", ["suspended", "banned"])
      .filter("reported_user_id", "not.is", null);
      
    if (flaggedError) throw flaggedError;
    
    return {
      success: true,
      data: {
        activeDisputes: activeDisputesCount || 0,
        resolvedToday: resolvedTodayCount || 0,
        avgResolutionTime: avgResolutionTime.toFixed(1),
        flaggedAccounts: flaggedAccountsCount || 0
      }
    };
  } catch (error: any) {
    console.error("Error fetching moderator stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch moderator stats",
      data: {
        activeDisputes: 0,
        resolvedToday: 0,
        avgResolutionTime: "0",
        flaggedAccounts: 0
      }
    };
  }
};

/**
 * Take action on a dispute
 */
export const updateDisputeStatus = async (
  disputeId: string,
  status: string,
  resolution?: string,
  adminNotes?: string,
  moderatorId?: string
) => {
  try {
    const updates: any = { 
      status,
      admin_notes: adminNotes || null
    };
    
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
      updates.resolution = resolution || null;
    }
    
    const { data, error } = await supabase
      .from("disputes")
      .update(updates)
      .eq("id", disputeId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Record moderator action if moderatorId is provided
    if (moderatorId) {
      await supabase
        .from("moderator_actions")
        .insert({
          moderator_id: moderatorId,
          target_dispute_id: disputeId,
          action_type: status === "resolved" ? "resolve_dispute" : "update_dispute_status",
          details: { 
            status, 
            resolution: resolution || null,
            admin_notes: adminNotes || null
          }
        });
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating dispute:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update dispute status"
    };
  }
};

/**
 * Take action on a user (warn, suspend, ban)
 */
export const updateUserStatus = async (
  userId: string,
  action: "warn" | "suspend" | "ban" | "unban",
  moderatorId: string,
  reason?: string
) => {
  try {
    // Update all open reports against this user
    const reportStatus = action === "unban" ? "resolved" : action === "ban" ? "banned" : action === "suspend" ? "suspended" : "warned";
    
    const { data, error } = await supabase
      .from("reports")
      .update({ 
        status: reportStatus,
        resolved_at: action === "unban" ? new Date().toISOString() : null
      })
      .eq("reported_user_id", userId)
      .in("status", ["pending", "reviewing"])
      .select();
      
    if (error) throw error;
    
    // Record moderator action
    await supabase
      .from("moderator_actions")
      .insert({
        moderator_id: moderatorId,
        target_user_id: userId,
        action_type: `${action}_user`,
        details: { 
          reason: reason || `User ${action}ed by moderator`
        }
      });
    
    return { success: true, data };
  } catch (error: any) {
    console.error(`Error ${action}ing user:`, error);
    return { 
      success: false, 
      error: error.message || `Failed to ${action} user`
    };
  }
};
