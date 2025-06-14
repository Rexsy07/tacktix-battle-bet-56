
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock, Users, FileText, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchDisputes,
  getReportedUsers,
  updateDisputeStatus,
  updateUserStatus,
  getModeratorStats,
  fetchRecentActivity,
  type DisputeDetails,
  type ReportedUser
} from "@/utils/moderator-utils";

const ModeratorPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<DisputeDetails[]>([]);
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    activeDisputes: 0,
    resolvedToday: 0,
    avgResolutionTime: "0",
    flaggedAccounts: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const checkModerator = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/sign-in");
          return;
        }

        setCurrentUser(session.user);

        // Check if user is a moderator
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_moderator')
          .eq('id', session.user.id)
          .single();

        if (error || !profile?.is_moderator) {
          toast({
            title: "Access Denied",
            description: "You don't have moderator permissions.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Fetch data
        await loadData();
      } catch (error) {
        console.error("Error checking moderator status:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkModerator();
  }, [navigate, toast]);

  const loadData = async () => {
    try {
      // Fetch disputes
      const disputesResult = await fetchDisputes(statusFilter === "all" ? undefined : statusFilter);
      setDisputes(disputesResult);

      // Fetch reported users
      const usersResult = await getReportedUsers(statusFilter, searchQuery);
      if (usersResult.success) {
        setReportedUsers(usersResult.data);
      }

      // Fetch stats
      const statsResult = await getModeratorStats(currentUser?.id);
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Fetch recent activity
      const activity = await fetchRecentActivity();
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading moderator data:", error);
      toast({
        title: "Error",
        description: "Failed to load moderator data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    try {
      const result = await updateDisputeStatus(
        disputeId,
        "resolved",
        resolution,
        undefined,
        currentUser?.id
      );

      if (result.success) {
        toast({
          title: "Dispute Resolved",
          description: "The dispute has been successfully resolved.",
        });
        await loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve dispute.",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (userId: string, action: "warn" | "suspend" | "ban" | "unban") => {
    try {
      const result = await updateUserStatus(userId, action, currentUser?.id);

      if (result.success) {
        toast({
          title: "Action Completed",
          description: `User has been ${action}ed successfully.`,
        });
        await loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to perform action.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return "outline";
      case "resolved":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue mb-4 mx-auto"></div>
            <p className="text-gray-400">Loading moderator panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Moderator Panel</h1>
            <p className="text-gray-400">Manage disputes and user reports</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Disputes</p>
                  <p className="text-2xl font-bold text-white">{stats.activeDisputes}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Resolved Today</p>
                  <p className="text-2xl font-bold text-white">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Resolution Time</p>
                  <p className="text-2xl font-bold text-white">{stats.avgResolutionTime}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Flagged Accounts</p>
                  <p className="text-2xl font-bold text-white">{stats.flaggedAccounts}</p>
                </div>
                <Users className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search disputes or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-tacktix-dark-light"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-tacktix-dark-light w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="disputes" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="users">Reported Users</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="disputes">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Dispute Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-mono text-xs">
                          {dispute.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{dispute.reason}</div>
                            <div className="text-sm text-gray-400 truncate max-w-[200px]">
                              {dispute.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {dispute.reported_by.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(dispute.status)}>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {dispute.status === "open" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolveDispute(dispute.id, "Resolved in favor of reporter")}
                                >
                                  Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleResolveDispute(dispute.id, "Dismissed - insufficient evidence")}
                                >
                                  Dismiss
                                </Button>
                              </>
                            )}
                            {dispute.status === "resolved" && (
                              <span className="text-sm text-green-400">
                                Resolved
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {disputes.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No disputes found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Reported Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Report</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium">
                              {user.user.username.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.user.username}</div>
                              <div className="text-sm text-gray-400">
                                Rating: {user.user.rating}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-500/10 text-red-400">
                            {user.reportCount} reports
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {new Date(user.latestReport.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.user.id, "warn")}
                            >
                              Warn
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.user.id, "suspend")}
                            >
                              Suspend
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserAction(user.user.id, "ban")}
                            >
                              Ban
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {reportedUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No reported users found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-tacktix-dark-light/50">
                      <Activity className="h-4 w-4 text-tacktix-blue" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No recent activity found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ModeratorPanel;
