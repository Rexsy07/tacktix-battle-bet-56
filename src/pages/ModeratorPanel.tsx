
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, AlertCircle, CheckCircle, XCircle, BarChart3, Users, 
  Clock, Eye, ExternalLink, Search, Filter, Flag, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDisputes, getReportedUsers, getModeratorStats, updateDisputeStatus, updateUserStatus } from "@/utils/moderator-utils";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";

const ModeratorPanel = () => {
  const [tab, setTab] = useState("disputes");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [moderatorId, setModeratorId] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [reportedUsers, setReportedUsers] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    activeDisputes: 0,
    resolvedToday: 0,
    avgResolutionTime: "0",
    flaggedAccounts: 0
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const checkModeratorAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/sign-in";
        return;
      }
      
      setModeratorId(session.user.id);
      
      // Check if user is a moderator by checking the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_moderator")
        .eq("id", session.user.id)
        .single();
        
      if (profileError || !profileData?.is_moderator) {
        toast({
          title: "Access Denied",
          description: "You do not have moderator privileges.",
          variant: "destructive"
        });
        window.location.href = "/";
      }
    };
    
    checkModeratorAccess();
  }, [toast]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!moderatorId) return;
      
      setLoading(true);
      
      // Fetch analytics data
      const statsResult = await getModeratorStats();
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
      }
      
      // Fetch disputes or reported users based on active tab
      if (tab === "disputes") {
        const disputesResult = await getDisputes(statusFilter !== "all" ? statusFilter : undefined, searchQuery);
        if (disputesResult.success) {
          setDisputes(disputesResult.data);
        }
      } else {
        const usersResult = await getReportedUsers(statusFilter !== "all" ? statusFilter : undefined, searchQuery);
        if (usersResult.success) {
          setReportedUsers(usersResult.data);
        }
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [tab, statusFilter, searchQuery, moderatorId]);
  
  const handleTabChange = (value: string) => {
    setTab(value);
    setStatusFilter("all"); // Reset filter when changing tabs
  };
  
  const handleUpdateDisputeStatus = async (disputeId: string, status: string) => {
    if (!moderatorId) return;
    
    setLoading(true);
    
    const result = await updateDisputeStatus(
      disputeId,
      status,
      status === "resolved" ? "Resolved by moderator" : undefined,
      undefined,
      moderatorId
    );
    
    if (result.success) {
      toast({
        title: "Dispute Updated",
        description: `Dispute status changed to ${status}`,
      });
      
      // Refresh disputes
      const disputesResult = await getDisputes(statusFilter !== "all" ? statusFilter : undefined, searchQuery);
      if (disputesResult.success) {
        setDisputes(disputesResult.data);
      }
      
      // Refresh analytics
      const statsResult = await getModeratorStats();
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
      }
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update dispute",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };
  
  const handleUpdateUserStatus = async (userId: string, action: "warn" | "suspend" | "ban" | "unban") => {
    if (!moderatorId) return;
    
    setLoading(true);
    
    const result = await updateUserStatus(
      userId,
      action,
      moderatorId
    );
    
    if (result.success) {
      toast({
        title: "User Updated",
        description: `User has been ${action}ed`,
      });
      
      // Refresh reported users
      const usersResult = await getReportedUsers(statusFilter !== "all" ? statusFilter : undefined, searchQuery);
      if (usersResult.success) {
        setReportedUsers(usersResult.data);
      }
      
      // Refresh analytics
      const statsResult = await getModeratorStats();
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
      }
    } else {
      toast({
        title: "Error",
        description: result.error || `Failed to ${action} user`,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };
  
  // Format dispute for display
  const formatDispute = (dispute: any) => {
    return {
      id: dispute.id,
      matchId: dispute.match_id,
      type: getDisputeType(dispute.reason),
      status: dispute.status,
      reportedBy: {
        name: dispute.reporter?.username || "Unknown",
        avatar: dispute.reporter?.avatar_url || "/placeholder.svg"
      },
      againstPlayer: {
        name: "Opponent", // We would need to fetch this
        avatar: "/placeholder.svg"
      },
      mode: dispute.match?.game_mode || "Unknown",
      map: dispute.match?.map_name || "Unknown",
      betAmount: dispute.match?.bet_amount || 0,
      createdAt: formatTimeRemaining(dispute.created_at),
      priority: getDisputePriority(dispute.match?.bet_amount || 0, dispute.status)
    };
  };
  
  const getDisputeType = (reason: string): "result" | "cheating" | "behavior" | "technical" => {
    if (reason.toLowerCase().includes("cheat")) return "cheating";
    if (reason.toLowerCase().includes("behavior") || reason.toLowerCase().includes("toxic")) return "behavior";
    if (reason.toLowerCase().includes("technical") || reason.toLowerCase().includes("disconnect")) return "technical";
    return "result";
  };
  
  const getDisputePriority = (betAmount: number, status: string): "high" | "medium" | "low" => {
    if (status === "pending" && betAmount > 3000) return "high";
    if (status === "pending") return "medium";
    return "low";
  };
  
  // Format user for display
  const formatUser = (reportedUser: any) => {
    const user = reportedUser.user;
    return {
      id: reportedUser.id,
      name: user?.username || "Unknown",
      avatar: user?.avatar_url || "/placeholder.svg",
      violations: reportedUser.reportCount || 0,
      currentStatus: reportedUser.status || "active",
      reportCount: reportedUser.reportCount || 0,
      lastReportDate: formatTimeRemaining(reportedUser.latestReport?.created_at || new Date().toISOString())
    };
  };
  
  // Create analytics cards
  const analyticsCards = [
    {
      title: "Active Disputes",
      value: analyticsData.activeDisputes.toString(),
      change: "+3", // This would ideally be calculated
      trend: "up",
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
    },
    {
      title: "Resolved Today",
      value: analyticsData.resolvedToday.toString(),
      change: "+8", // This would ideally be calculated
      trend: "up",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      title: "Avg. Resolution Time",
      value: `${analyticsData.avgResolutionTime}h`,
      change: "-0.3h", // This would ideally be calculated
      trend: "down",
      icon: <Clock className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Flagged Accounts",
      value: analyticsData.flaggedAccounts.toString(),
      change: "+2", // This would ideally be calculated
      trend: "up",
      icon: <Flag className="h-5 w-5 text-red-500" />
    }
  ];

  const formattedDisputes = disputes.map(formatDispute);
  const formattedUsers = reportedUsers.map(formatUser);
  
  const filteredDisputes = formattedDisputes.filter(dispute => {
    return (statusFilter === "all" || dispute.status === statusFilter);
  });
  
  const filteredUsers = formattedUsers.filter(user => {
    return (statusFilter === "all" || user.currentStatus === statusFilter);
  });

  if (!moderatorId) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Moderator Panel</h1>
            <p className="text-gray-400 mt-2">Manage disputes, monitor users, and maintain fair play</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-tacktix-blue/10 flex items-center gap-1 px-3 py-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{analyticsData.activeDisputes} Active</span>
            </Badge>
            <Button variant="gradient" size="sm" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Moderation Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {analyticsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <p className={`text-xs flex items-center ${card.trend === 'up' ? 'text-green-500' : 'text-tacktix-blue'}`}>
                    {card.change} from yesterday
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-dark-deeper flex items-center justify-center">
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search disputes or users..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="active">Active</option>
                <option value="warned">Warned</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full md:w-auto">
            <TabsList className="bg-tacktix-dark-deeper">
              <TabsTrigger value="disputes" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Active Disputes
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Reported Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {tab === "disputes" && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Match Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={dispute.reportedBy.avatar} alt={dispute.reportedBy.name} />
                                <AvatarFallback>{dispute.reportedBy.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">vs</span>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={dispute.againstPlayer.avatar} alt={dispute.againstPlayer.name} />
                                <AvatarFallback>{dispute.againstPlayer.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{dispute.createdAt}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dispute.type === "result" && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Result Dispute
                            </Badge>
                          )}
                          {dispute.type === "cheating" && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Cheating Report
                            </Badge>
                          )}
                          {dispute.type === "behavior" && (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              Behavior Report
                            </Badge>
                          )}
                          {dispute.type === "technical" && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Technical Issue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{dispute.mode}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>{dispute.map}</span>
                              <span>•</span>
                              <span>₦{dispute.betAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dispute.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Pending Review
                            </Badge>
                          )}
                          {dispute.status === "reviewing" && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Under Review
                            </Badge>
                          )}
                          {dispute.status === "resolved" && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Resolved
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{dispute.reportedBy.name}</span>
                            <span className="text-xs text-red-400">reported</span>
                            <span className="font-medium">{dispute.againstPlayer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dispute.priority === "high" && (
                            <Badge variant="destructive" size="sm">
                              High
                            </Badge>
                          )}
                          {dispute.priority === "medium" && (
                            <Badge variant="badge" size="sm">
                              Medium
                            </Badge>
                          )}
                          {dispute.priority === "low" && (
                            <Badge variant="outline" size="sm">
                              Low
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => window.location.href = `/match/${dispute.matchId}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {dispute.status === "pending" && (
                              <Button 
                                variant="gradient" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleUpdateDisputeStatus(dispute.id, "reviewing")}
                              >
                                Review
                              </Button>
                            )}
                            {dispute.status === "reviewing" && (
                              <Button 
                                variant="gradient" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleUpdateDisputeStatus(dispute.id, "resolved")}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredDisputes.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No disputes found</h3>
                    <p className="text-gray-400 text-center">All disputes matching your filters have been resolved</p>
                  </div>
                )}
              </Card>
            )}

            {tab === "users" && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Report Count</TableHead>
                      <TableHead>Last Report</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <p className="text-xs text-gray-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              user.violations > 10 ? 'text-red-500' : 
                              user.violations > 5 ? 'text-orange-500' : 
                              user.violations > 0 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {user.violations}
                            </span>
                            <span className="text-xs text-gray-400">offenses</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.currentStatus === "active" && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          )}
                          {user.currentStatus === "warned" && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Warned
                            </Badge>
                          )}
                          {user.currentStatus === "suspended" && (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                              Suspended
                            </Badge>
                          )}
                          {user.currentStatus === "banned" && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Banned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span>{user.reportCount}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-400">{user.lastReportDate}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => window.location.href = `/profile?id=${user.id}`}
                            >
                              View History
                            </Button>
                            <Button 
                              variant={user.currentStatus === "banned" ? "secondary" : "destructive"} 
                              size="sm" 
                              className="h-8"
                              onClick={() => {
                                if (user.currentStatus === "active") {
                                  handleUpdateUserStatus(user.id, "warn");
                                } else if (user.currentStatus === "warned") {
                                  handleUpdateUserStatus(user.id, "suspend");
                                } else if (user.currentStatus === "suspended") {
                                  handleUpdateUserStatus(user.id, "ban");
                                } else if (user.currentStatus === "banned") {
                                  handleUpdateUserStatus(user.id, "unban");
                                }
                              }}
                            >
                              {user.currentStatus === "active" ? "Warn" : 
                               user.currentStatus === "warned" ? "Suspend" :
                               user.currentStatus === "suspended" ? "Ban" : "Unban"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUsers.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No users found</h3>
                    <p className="text-gray-400 text-center">Try adjusting your search criteria</p>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ModeratorPanel;
