
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, Shield, Wallet, BarChart3, Settings, Lock, 
  Moon, Sun, Edit, TrendingUp, History, CreditCard, 
  ArrowDownRight, ArrowUpRight, Gamepad, Map
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: "PlayerOne",
    email: "player@example.com",
    codm_id: "CODM_123456",
    avatar_url: null,
    is_verified: true,
    is_vip: false,
  });
  
  const [userStats, setUserStats] = useState({
    matches_played: 45,
    matches_won: 32,
    win_rate: 71,
    total_earnings: 45000,
  });
  
  const [walletInfo, setWalletInfo] = useState({
    balance: 12500,
  });
  
  const [recentMatches, setRecentMatches] = useState([
    { id: "match-1", mode: "Search & Destroy", map: "Standoff", betAmount: 2000, won: true, date: "2023-07-15" },
    { id: "match-2", mode: "Hardpoint", map: "Firing Range", betAmount: 1000, won: false, date: "2023-07-14" },
    { id: "match-3", mode: "Search & Destroy", map: "Raid", betAmount: 5000, won: true, date: "2023-07-13" },
  ]);
  
  const [userSettings, setUserSettings] = useState({
    default_bet_amount: 1000,
    preferred_game_mode: "Search & Destroy",
    favorite_map: "Standoff",
    theme: "dark",
  });

  // Fetch user settings from Supabase
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Error fetching user settings:", settingsError);
          }

          if (settingsData) {
            setUserSettings(settingsData);
            setIsDarkMode(settingsData.theme === 'dark');
            document.documentElement.classList.toggle('light-mode', settingsData.theme === 'light');
          }

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
          } else if (profileData) {
            setUserProfile(profileData);
          }

          // Fetch user stats
          const { data: statsData, error: statsError } = await supabase
            .from('leaderboard_stats')
            .select('*')
            .eq('id', user.id)
            .single();

          if (statsError) {
            console.error("Error fetching user stats:", statsError);
          } else if (statsData) {
            setUserStats(statsData);
          }

          // Fetch wallet info
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (walletError) {
            console.error("Error fetching wallet:", walletError);
          } else if (walletData) {
            setWalletInfo(walletData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserSettings();
  }, []);

  const toggleTheme = async () => {
    try {
      setIsLoading(true);
      const newTheme = isDarkMode ? 'light' : 'dark';
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('light-mode', newTheme === 'light');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update user settings in Supabase
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            theme: newTheme,
            default_bet_amount: userSettings.default_bet_amount,
            preferred_game_mode: userSettings.preferred_game_mode,
            favorite_map: userSettings.favorite_map
          })
          .select();
        
        if (error) {
          console.error("Error updating theme preference:", error);
          toast({
            title: "Error",
            description: "Failed to save theme preference",
            variant: "destructive",
          });
        } else {
          setUserSettings({ ...userSettings, theme: newTheme });
        }
      }
    } catch (error) {
      console.error("Error toggling theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBettingPreferences = async (field: string, value: string | number) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const updatedSettings = { ...userSettings, [field]: value };
        setUserSettings(updatedSettings);
        
        // Update user settings in Supabase
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            ...updatedSettings 
          })
          .select();
        
        if (error) {
          console.error(`Error updating ${field}:`, error);
          toast({
            title: "Error",
            description: `Failed to save ${field}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Preferences updated successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={toggleTheme}
              disabled={isLoading}
            >
              {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle>Profile Info</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center pb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userProfile.avatar_url || ""} />
                  <AvatarFallback className="bg-tacktix-blue text-xl">
                    {userProfile.username ? userProfile.username[0].toUpperCase() : <User />}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold mb-1">{userProfile.username}</h3>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {userProfile.is_verified && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Verified
                    </Badge>
                  )}
                  {userProfile.is_vip && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      VIP
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 w-full">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CoDM ID:</span>
                    <span>{userProfile.codm_id || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email:</span>
                    <span>{userProfile.email}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex-col gap-3">
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </CardFooter>
            </Card>
            
            <Card className="glass-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet size={18} className="mr-2" /> Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Available Balance</div>
                  <div className="text-3xl font-bold text-tacktix-blue">₦{walletInfo.balance.toLocaleString()}</div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <ArrowDownRight size={16} className="mr-2" /> Deposit
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center">
                    <ArrowUpRight size={16} className="mr-2" /> Withdraw
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
                  <History size={14} className="mr-2" /> View Transaction History
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="stats">
              <TabsList className="grid grid-cols-4 h-auto">
                <TabsTrigger value="stats" className="py-2">
                  <BarChart3 size={16} className="mr-2" /> Stats
                </TabsTrigger>
                <TabsTrigger value="matches" className="py-2">
                  <History size={16} className="mr-2" /> Matches
                </TabsTrigger>
                <TabsTrigger value="preferences" className="py-2">
                  <Gamepad size={16} className="mr-2" /> Preferences
                </TabsTrigger>
                <TabsTrigger value="security" className="py-2">
                  <Lock size={16} className="mr-2" /> Security
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-6 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Game Statistics</CardTitle>
                    <CardDescription>Your performance across all matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-tacktix-dark-light p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-1">Matches</div>
                        <div className="text-2xl font-bold">{userStats.matches_played}</div>
                      </div>
                      <div className="bg-tacktix-dark-light p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-1">Wins</div>
                        <div className="text-2xl font-bold">{userStats.matches_won}</div>
                      </div>
                      <div className="bg-tacktix-dark-light p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold">{userStats.win_rate || 0}%</div>
                      </div>
                      <div className="bg-tacktix-dark-light p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-1">Earnings</div>
                        <div className="text-2xl font-bold text-tacktix-blue">₦{userStats.total_earnings.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-4">Earnings Trend</h4>
                      <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-md">
                        <p className="text-gray-400 text-sm">Earnings chart will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="matches" className="mt-6 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Recent Matches</CardTitle>
                    <CardDescription>Your last 10 matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Map</TableHead>
                          <TableHead>Bet</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentMatches.map((match) => (
                          <TableRow key={match.id}>
                            <TableCell>{match.date}</TableCell>
                            <TableCell>{match.mode}</TableCell>
                            <TableCell>{match.map}</TableCell>
                            <TableCell>₦{match.betAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              {match.won ? (
                                <Badge variant="success">Win</Badge>
                              ) : (
                                <Badge variant="destructive">Loss</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Link to={`/match/${match.id}`}>
                                <Button variant="ghost" size="sm">Details</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Betting Preferences</CardTitle>
                    <CardDescription>Customize your default bet settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Default Bet Amount</Label>
                      <Select 
                        defaultValue={userSettings.default_bet_amount.toString()} 
                        onValueChange={(value) => updateBettingPreferences('default_bet_amount', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">₦1,000</SelectItem>
                          <SelectItem value="2000">₦2,000</SelectItem>
                          <SelectItem value="5000">₦5,000</SelectItem>
                          <SelectItem value="10000">₦10,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preferred Game Mode</Label>
                      <Select 
                        defaultValue={userSettings.preferred_game_mode} 
                        onValueChange={(value) => updateBettingPreferences('preferred_game_mode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select game mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Search & Destroy">Search & Destroy</SelectItem>
                          <SelectItem value="Hardpoint">Hardpoint</SelectItem>
                          <SelectItem value="Domination">Domination</SelectItem>
                          <SelectItem value="Free For All">Free For All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Favorite Map</Label>
                      <Select 
                        defaultValue={userSettings.favorite_map} 
                        onValueChange={(value) => updateBettingPreferences('favorite_map', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select map" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standoff">Standoff</SelectItem>
                          <SelectItem value="Firing Range">Firing Range</SelectItem>
                          <SelectItem value="Raid">Raid</SelectItem>
                          <SelectItem value="Summit">Summit</SelectItem>
                          <SelectItem value="Nuketown">Nuketown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Change Password</Label>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="block">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-400">Add an extra layer of security</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="mb-2 block">Manage Linked Accounts</Label>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-tacktix-dark-light/50 rounded-md">
                          <div className="flex items-center">
                            <Gamepad size={20} className="mr-3 text-tacktix-blue" />
                            <div>
                              <div className="font-medium">CoDM Account</div>
                              <div className="text-sm text-gray-400">{userProfile.codm_id || "Not linked"}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Update</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
