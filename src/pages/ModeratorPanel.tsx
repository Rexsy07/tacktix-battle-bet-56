
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, DollarSign, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DisputeDetails from "@/components/moderator/DisputeDetails";
import UserActions from "@/components/moderator/UserActions";
import DepositVerification from "@/components/admin/DepositVerification";

interface ModeratorStats {
  totalUsers: number;
  activeDisputes: number;
  pendingDeposits: number;
  totalMatches: number;
  platformEarnings: number;
}

const ModeratorPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ModeratorStats>({
    totalUsers: 0,
    activeDisputes: 0,
    pendingDeposits: 0,
    totalMatches: 0,
    platformEarnings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkModeratorAccess();
    fetchStats();
  }, []);

  const checkModeratorAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the moderator panel",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_moderator")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_moderator) {
      toast({
        title: "Access Denied",
        description: "You don't have moderator privileges",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch various statistics
      const [usersResult, disputesResult, depositsResult, matchesResult, earningsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending_verification").eq("type", "deposit"),
        supabase.from("matches").select("id", { count: "exact", head: true }),
        supabase.from("platform_earnings").select("amount")
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeDisputes: disputesResult.count || 0,
        pendingDeposits: depositsResult.count || 0,
        totalMatches: matchesResult.count || 0,
        platformEarnings: totalEarnings
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load moderator statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Shield className="h-7 w-7 text-tacktix-blue mr-2" />
            Moderator Panel
          </h1>
          <p className="text-gray-400">Manage platform operations and user activities</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Disputes</p>
                  <p className="text-2xl font-bold">{stats.activeDisputes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pending Deposits</p>
                  <p className="text-2xl font-bold">{stats.pendingDeposits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Matches</p>
                  <p className="text-2xl font-bold">{stats.totalMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Platform Earnings</p>
                  <p className="text-2xl font-bold">₦{stats.platformEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposits" className="relative">
              Deposit Verification
              {stats.pendingDeposits > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                  {stats.pendingDeposits}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disputes" className="relative">
              Disputes
              {stats.activeDisputes > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {stats.activeDisputes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <DepositVerification />
          </TabsContent>

          <TabsContent value="disputes">
            <DisputeDetails />
          </TabsContent>

          <TabsContent value="users">
            <UserActions />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium mb-2">Revenue Overview</h3>
                    <p className="text-2xl font-bold text-green-500">₦{stats.platformEarnings.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total platform earnings from matches</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium mb-2">User Growth</h3>
                    <p className="text-2xl font-bold text-blue-500">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-400">Registered users on platform</p>
                  </div>
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
