
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Settings, Trophy, Target, TrendingUp, Calendar,
  Mail, Phone, Shield, Star, Edit3, Save, X
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Profile data from profiles table
  const [profileData, setProfileData] = useState({
    username: "",
    phone: "",
    avatar_url: "",
    is_vip: false,
    rating: 1000,
    wins: 0,
    losses: 0,
    total_matches: 0,
    total_earnings: 0,
    skill_level: "beginner"
  });
  
  // Stats data calculated from matches
  const [statsData, setStatsData] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalEarnings: 0,
    currentStreak: 0
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/sign-in");
          return;
        }
        
        setCurrentUser(session.user);
        
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        setProfileData({
          username: profile.username || "",
          phone: profile.phone || "",
          avatar_url: profile.avatar_url || "",
          is_vip: profile.is_vip || false,
          rating: profile.rating || 1000,
          wins: profile.wins || 0,
          losses: profile.losses || 0,
          total_matches: profile.total_matches || 0,
          total_earnings: profile.total_earnings || 0,
          skill_level: profile.skill_level || "beginner"
        });

        // Calculate stats from matches where user participated
        const { data: matches, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`host_id.eq.${session.user.id},opponent_id.eq.${session.user.id}`)
          .eq("status", "completed");

        if (!matchesError && matches) {
          const wins = matches.filter(match => match.winner_id === session.user.id).length;
          const totalMatches = matches.length;
          const losses = totalMatches - wins;
          const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
          
          // Calculate total earnings from transactions
          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", session.user.id)
            .eq("status", "completed");
          
          let totalEarnings = 0;
          transactions?.forEach(tx => {
            if (tx.type === 'win') {
              totalEarnings += tx.amount;
            }
          });

          setStatsData({
            totalMatches,
            wins,
            losses,
            winRate,
            totalEarnings,
            currentStreak: 0 // This would need more complex calculation
          });
        }
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate, toast]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profileData.username,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileData.avatar_url} alt={profileData.username} />
            <AvatarFallback className="text-2xl">
              {profileData.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profileData.username}</h1>
              {profileData.is_vip && (
                <Badge variant="gradient" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  VIP
                </Badge>
              )}
            </div>
            <p className="text-gray-400 mb-4">Rating: {profileData.rating}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-green-500">
                <Trophy className="inline h-4 w-4 mr-1" />
                {statsData.wins} Wins
              </span>
              <span className="text-red-500">
                <X className="inline h-4 w-4 mr-1" />
                {statsData.losses} Losses
              </span>
              <span className="text-tacktix-blue">
                <Target className="inline h-4 w-4 mr-1" />
                {statsData.winRate.toFixed(1)}% Win Rate
              </span>
            </div>
          </div>
          
          <Button
            variant={editing ? "outline" : "gradient"}
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="flex items-center gap-2"
          >
            {editing ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">Completed matches</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.winRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{statsData.wins}/{statsData.totalMatches} wins</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{statsData.totalEarnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={profileData.avatar_url}
                    onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                
                {editing && (
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center py-8">
                  Match history will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
