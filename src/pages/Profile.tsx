
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Settings, Wallet, History, Trophy, Edit, 
  CheckCircle, AlertCircle, Moon, Sun, LogOut, Copy, 
  Shield, KeyRound, CreditCard, Gamepad, MapPin
} from "lucide-react";

// Define theme options type
type Theme = "dark" | "light";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [leaderboardStats, setLeaderboardStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [theme, setTheme] = useState<Theme>("dark");
  
  // Fetch user data and theme preference on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Redirect to sign-in if not authenticated
          navigate("/sign-in");
          return;
        }
        
        setUser(user);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfileData(profileData);
        
        // Fetch wallet data
        const { data: walletData, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (walletError) throw walletError;
        setWalletData(walletData);
        
        // Fetch leaderboard stats
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from("leaderboard_stats")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (leaderboardError) throw leaderboardError;
        setLeaderboardStats(leaderboardData);
        
        // Fetch recent matches (last 5)
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            id,
            game_mode,
            map_name,
            bet_amount,
            status,
            created_at,
            winner_id,
            host:profiles!matches_host_id_fkey(username),
            opponent:profiles!matches_opponent_id_fkey(username)
          `)
          .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (matchesError) throw matchesError;
        setRecentMatches(matchesData || []);
        
        // Get theme from localStorage instead of database
        const savedTheme = localStorage.getItem("userTheme") as Theme | null;
        if (savedTheme) {
          setTheme(savedTheme);
          // Apply theme to document
          document.documentElement.classList.toggle("light-mode", savedTheme === "light");
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Clean up theme when component unmounts
    return () => {
      document.documentElement.classList.remove("light-mode");
    };
  }, [navigate, toast]);
  
  // Handle theme toggle
  const handleThemeToggle = async (checked: boolean) => {
    const newTheme = checked ? "light" : "dark";
    setTheme(newTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle("light-mode", newTheme === "light");
    
    try {
      // Store theme preference in localStorage instead of database
      localStorage.setItem("userTheme", newTheme);
      
      toast({
        title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
        description: `Switched to ${newTheme} theme`,
      });
    } catch (error) {
      console.error("Error saving theme preference:", error);
      toast({
        title: "Error",
        description: "Failed to save theme preference",
        variant: "destructive",
      });
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 rounded-full border-4 border-tacktix-blue border-t-transparent animate-spin mb-4"></div>
            <p className="text-tacktix-blue">Loading profile data...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Your Profile</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Moon className={`h-4 w-4 ${theme === "dark" ? "text-tacktix-blue" : "text-gray-400"}`} />
              <Switch
                checked={theme === "light"}
                onCheckedChange={handleThemeToggle}
              />
              <Sun className={`h-4 w-4 ${theme === "light" ? "text-tacktix-blue" : "text-gray-400"}`} />
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile info and wallet */}
          <div className="md:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Basic Info</CardTitle>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profileData?.avatar_url} />
                    <AvatarFallback className="bg-tacktix-blue-dark">
                      {profileData?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{profileData?.username}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="flex items-center">
                      {profileData?.is_vip && (
                        <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                      )}
                      {profileData?.is_vip ? "VIP Player" : "Player"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">CoDM ID</Label>
                    <div className="flex items-center mt-1">
                      <p className="text-sm flex-1">{profileData?.codm_id || "Not set"}</p>
                      {profileData?.codm_id && (
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm">{profileData?.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Account Status</Label>
                    <div className="flex items-center mt-1">
                      {profileData?.is_verified ? (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Wallet Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Current Balance</p>
                  <h2 className="text-3xl font-bold text-tacktix-blue mt-1">
                    ₦{walletData?.balance.toLocaleString()}
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="gradient">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button variant="outline">
                    Withdraw
                  </Button>
                </div>
                
                <Link to="/wallet" className="block text-center text-sm text-tacktix-blue hover:underline mt-2">
                  View Transaction History
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Tabs for all other sections */}
          <div className="md:col-span-2">
            <Card>
              <Tabs defaultValue="stats">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="stats">
                    <Trophy className="h-4 w-4 mr-2 d-none d-sm-block" />
                    <span className="hidden sm:inline">Stats</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-2 d-none d-sm-block" />
                    <span className="hidden sm:inline">Matches</span>
                    <span className="sm:hidden">Matches</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences">
                    <Gamepad className="h-4 w-4 mr-2 d-none d-sm-block" />
                    <span className="hidden sm:inline">Preferences</span>
                    <span className="sm:hidden">Prefs</span>
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Shield className="h-4 w-4 mr-2 d-none d-sm-block" />
                    <span className="hidden sm:inline">Security</span>
                    <span className="sm:hidden">Security</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Stats Tab */}
                <TabsContent value="stats" className="p-6">
                  <h3 className="text-lg font-medium mb-4">Match Statistics</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-tacktix-dark-light rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Matches</p>
                      <p className="text-2xl font-bold">{leaderboardStats?.matches_played || 0}</p>
                    </div>
                    <div className="bg-tacktix-dark-light rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Wins</p>
                      <p className="text-2xl font-bold">{leaderboardStats?.matches_won || 0}</p>
                    </div>
                    <div className="bg-tacktix-dark-light rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold">
                        {leaderboardStats?.matches_played 
                          ? Math.round((leaderboardStats?.matches_won / leaderboardStats?.matches_played) * 100) 
                          : 0}%
                      </p>
                    </div>
                    <div className="bg-tacktix-dark-light rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Earnings</p>
                      <p className="text-2xl font-bold">₦{leaderboardStats?.total_earnings?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Achievements</h3>
                    <div className="bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-lg p-4 text-center">
                      <p className="text-sm mb-2">No achievements yet. Start playing matches to earn achievements!</p>
                      <Button variant="default" size="sm">
                        Find a Match
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Matches History Tab */}
                <TabsContent value="history" className="p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Matches</h3>
                  
                  {recentMatches.length > 0 ? (
                    <div className="space-y-4">
                      {recentMatches.map((match) => {
                        const isHost = match.host?.username === profileData?.username;
                        const opponent = isHost ? match.opponent?.username : match.host?.username;
                        const isWinner = match.winner_id === user.id;
                        const matchStatus = match.status === "completed" 
                          ? (isWinner ? "Won" : "Lost")
                          : match.status.charAt(0).toUpperCase() + match.status.slice(1);
                        
                        return (
                          <div 
                            key={match.id} 
                            className="bg-tacktix-dark-light rounded-lg p-4 hover:bg-tacktix-dark-light/80 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{match.game_mode} on {match.map_name}</p>
                                <p className="text-sm text-gray-400">
                                  vs {opponent || "Unknown"}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  className={
                                    match.status === "completed"
                                      ? (isWinner ? "bg-green-600" : "bg-tacktix-red")
                                      : "bg-tacktix-blue"
                                  }
                                >
                                  {matchStatus}
                                </Badge>
                                <p className="text-sm mt-1">₦{match.bet_amount}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <Link to={`/match/${match.id}`} className="text-xs text-tacktix-blue hover:underline">
                                View Details
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-tacktix-dark-light rounded-lg p-6 text-center">
                      <p className="text-sm mb-4">You haven't played any matches yet</p>
                      <Link to="/matchmaking">
                        <Button variant="default" size="sm">
                          Find a Match Now
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {recentMatches.length > 0 && (
                    <div className="mt-6 text-center">
                      <Link to="/history">
                        <Button variant="outline">
                          View All Match History
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
                
                {/* Game Preferences Tab */}
                <TabsContent value="preferences" className="p-6">
                  <h3 className="text-lg font-medium mb-4">Gaming Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="default-bet">Default Bet Amount (₦)</Label>
                      <Input 
                        id="default-bet" 
                        type="number" 
                        placeholder="1000" 
                        className="bg-tacktix-dark-light"
                      />
                      <p className="text-xs text-gray-400">This will be pre-selected when creating matches</p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="preferred-gamemode">Preferred Game Mode</Label>
                      <select 
                        id="preferred-gamemode" 
                        className="w-full rounded-md bg-tacktix-dark-light border border-white/10 p-2"
                      >
                        <option value="search-destroy">Search & Destroy</option>
                        <option value="hardpoint">Hardpoint</option>
                        <option value="domination">Domination</option>
                        <option value="battle-royale">Battle Royale</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="preferred-map">Favorite Map</Label>
                      <select 
                        id="preferred-map" 
                        className="w-full rounded-md bg-tacktix-dark-light border border-white/10 p-2"
                      >
                        <option value="standoff">Standoff</option>
                        <option value="firing-range">Firing Range</option>
                        <option value="nuketown">Nuketown</option>
                        <option value="crash">Crash</option>
                        <option value="summit">Summit</option>
                      </select>
                    </div>
                    
                    <Button className="w-full">Save Preferences</Button>
                  </div>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security" className="p-6">
                  <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-start">
                        <KeyRound className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <Label className="font-medium">Change Password</Label>
                          <p className="text-sm text-gray-400 mb-3">Update your account password</p>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-medium">Two-Factor Authentication</Label>
                              <p className="text-sm text-gray-400 mb-3">Enhance account security</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-start">
                        <User className="h-5 w-5 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <Label className="font-medium">Linked Accounts</Label>
                          <p className="text-sm text-gray-400 mb-3">Manage connected accounts</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <p>Call of Duty Mobile</p>
                              <Badge variant={profileData?.codm_id ? "default" : "outline"}>
                                {profileData?.codm_id ? "Connected" : "Not Connected"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <p>Google</p>
                              <Badge variant="outline">Not Connected</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
