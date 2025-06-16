
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Flame, Users, Trophy, Wallet, ArrowRight, Clock, Crown, Star, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HighStakeMatch {
  id: string;
  title: string;
  game_mode: string;
  map_name: string;
  bet_amount: number;
  status: "pending" | "active" | "completed";
  participants: {
    host: any;
    opponent: any;
  };
  created_at: string;
  current_players: number;
  max_players: number;
}

interface VipPlayer {
  id: string;
  username: string;
  avatar_url: string;
  rating: number;
  wins: number;
  total_matches: number;
  total_earnings: number;
  win_rate: number;
  is_vip: boolean;
  status: "online" | "in-match" | "offline";
}

const VipDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("matches");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [highStakeMatches, setHighStakeMatches] = useState<HighStakeMatch[]>([]);
  const [vipPlayers, setVipPlayers] = useState<VipPlayer[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState({
    winRate: 0,
    totalEarnings: 0,
    vipLevel: "Standard"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVipData();
  }, []);

  const fetchVipData = async () => {
    try {
      await Promise.all([
        fetchHighStakeMatches(),
        fetchVipPlayers(),
        fetchCurrentUserStats()
      ]);
    } catch (error) {
      console.error("Error fetching VIP data:", error);
      toast({
        title: "Error",
        description: "Failed to load VIP dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHighStakeMatches = async () => {
    try {
      const { data: matches, error } = await supabase
        .from("matches")
        .select(`
          *,
          host:profiles!matches_host_id_fkey(*),
          opponent:profiles!matches_opponent_id_fkey(*)
        `)
        .gte("bet_amount", 25000)
        .in("status", ["pending", "active", "completed"])
        .order("bet_amount", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedMatches = matches?.map(match => ({
        id: match.id,
        title: match.title,
        game_mode: match.game_mode,
        map_name: match.map_name || "TBD",
        bet_amount: match.bet_amount,
        status: match.status,
        participants: {
          host: match.host,
          opponent: match.opponent
        },
        created_at: match.created_at,
        current_players: match.current_players,
        max_players: match.max_players
      })) || [];

      setHighStakeMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching high stake matches:", error);
    }
  };

  const fetchVipPlayers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_vip", true)
        .gt("total_matches", 5)
        .order("total_earnings", { ascending: false })
        .limit(50);

      if (error) throw error;

      const playersWithStats = profiles?.map(profile => ({
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        rating: profile.rating,
        wins: profile.wins,
        total_matches: profile.total_matches,
        total_earnings: profile.total_earnings,
        win_rate: profile.total_matches > 0 ? (profile.wins / profile.total_matches) * 100 : 0,
        is_vip: profile.is_vip,
        status: Math.random() > 0.5 ? "online" : "offline" as "online" | "offline" // Simulated status
      })) || [];

      setVipPlayers(playersWithStats);
    } catch (error) {
      console.error("Error fetching VIP players:", error);
    }
  };

  const fetchCurrentUserStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      const { data: transactions, error: transactionError } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", session.user.id)
        .eq("status", "completed");

      if (transactionError) throw transactionError;

      let totalEarnings = 0;
      transactions?.forEach(tx => {
        if (tx.type === 'win') {
          totalEarnings += tx.amount;
        }
      });

      const winRate = profile.total_matches > 0 ? (profile.wins / profile.total_matches) * 100 : 0;
      const vipLevel = profile.is_vip ? "Elite" : totalEarnings > 100000 ? "Gold" : "Standard";

      setCurrentUserStats({
        winRate,
        totalEarnings,
        vipLevel
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const filteredMatches = highStakeMatches.filter(match => {
    const matchesQuery = match.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          match.game_mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          match.map_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showOnlyAvailable) {
      return matchesQuery && match.status === "pending";
    }
    return matchesQuery;
  });

  const filteredPlayers = vipPlayers.filter(player => {
    const matchesQuery = player.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showOnlyAvailable) {
      return matchesQuery && player.status === "online";
    }
    return matchesQuery;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">VIP Betting Dashboard</h1>
            <p className="text-gray-400 mt-2">Exclusive high-stakes matches for elite players</p>
          </div>
          <Button variant="glow" size="lg" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Create VIP Match
            <Badge variant="outline" className="ml-1 bg-tacktix-blue/20">₦25K+</Badge>
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <Crown className="text-yellow-400 mb-1 h-5 w-5" />
                  <h4 className="text-sm text-gray-400">Your VIP Level</h4>
                  <p className="text-lg font-bold text-tacktix-blue">{currentUserStats.vipLevel}</p>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy className="text-yellow-400 mb-1 h-5 w-5" />
                  <h4 className="text-sm text-gray-400">Win Rate</h4>
                  <p className="text-lg font-bold text-tacktix-blue">{currentUserStats.winRate.toFixed(1)}%</p>
                </div>
                <div className="flex flex-col items-center">
                  <Wallet className="text-yellow-400 mb-1 h-5 w-5" />
                  <h4 className="text-sm text-gray-400">Total Earnings</h4>
                  <p className="text-lg font-bold text-tacktix-blue">₦{currentUserStats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  VIP Community
                </Button>
                <Button variant="gradient" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Upgrade VIP Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search matches or players..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="available-only" 
                checked={showOnlyAvailable} 
                onCheckedChange={setShowOnlyAvailable}
              />
              <Label htmlFor="available-only">Available only</Label>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
            <TabsList className="bg-tacktix-dark-deeper">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                High-Stake Matches
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                VIP Players
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {tab === "matches" && (
          <div className="grid gap-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="overflow-hidden hover:border-tacktix-blue/30 transition-all duration-200">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {match.status === "pending" && (
                            <Badge variant="success" size="sm">Open to Join</Badge>
                          )}
                          {match.status === "active" && (
                            <Badge variant="badge" size="sm" className="animate-pulse">In Progress</Badge>
                          )}
                          {match.status === "completed" && (
                            <Badge variant="secondary" size="sm">Completed</Badge>
                          )}
                          <span className="text-xs text-gray-400">{getTimeAgo(match.created_at)}</span>
                        </div>
                        <h3 className="text-lg font-semibold flex items-center">
                          {match.title}
                          <span className="mx-2 text-gray-500">•</span>
                          {match.map_name}
                        </h3>
                        <p className="text-tacktix-blue font-bold text-xl mt-1">₦{match.bet_amount.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex -space-x-3">
                          {match.participants.host && (
                            <Avatar className="border-2 border-tacktix-dark-deeper">
                              <AvatarImage src={match.participants.host.avatar_url} alt={match.participants.host.username} />
                              <AvatarFallback>{match.participants.host.username?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          )}
                          {match.participants.opponent ? (
                            <Avatar className="border-2 border-tacktix-dark-deeper">
                              <AvatarImage src={match.participants.opponent.avatar_url} alt={match.participants.opponent.username} />
                              <AvatarFallback>{match.participants.opponent.username?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          ) : match.status === "pending" && (
                            <div className="h-10 w-10 rounded-full bg-tacktix-blue/20 flex items-center justify-center border-2 border-tacktix-dark-deeper">
                              <Plus className="h-5 w-5 text-tacktix-blue" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-400 mt-2">
                          {match.current_players} of {match.max_players} players
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-tacktix-dark-deeper flex items-center justify-center p-4 md:w-[180px]">
                    {match.status === "pending" && (
                      <Button variant="gradient" className="w-full">
                        Join Match
                      </Button>
                    )}
                    {match.status === "active" && (
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        Spectate
                      </Button>
                    )}
                    {match.status === "completed" && (
                      <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                        View Results
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {filteredMatches.length === 0 && (
              <Card className="p-12 flex flex-col items-center justify-center">
                <Search className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                <p className="text-gray-400 text-center mb-6">Try adjusting your filters or create a new VIP match</p>
                <Button variant="glow">Create VIP Match</Button>
              </Card>
            )}
          </div>
        )}

        {tab === "players" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Total Winnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.avatar_url} alt={player.username} />
                          <AvatarFallback>{player.username?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-tacktix-blue/10">
                        {player.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-tacktix-blue font-semibold">{player.win_rate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell>
                      <span>₦{player.total_earnings.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {player.status === "online" && (
                        <Badge variant="success" size="sm">Online</Badge>
                      )}
                      {player.status === "in-match" && (
                        <Badge variant="badge" size="sm">In Match</Badge>
                      )}
                      {player.status === "offline" && (
                        <Badge variant="secondary" size="sm">Offline</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.status === "online" ? (
                        <Button variant="gradient" size="sm">Challenge</Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled={player.status !== "offline"}>
                          {player.status === "in-match" ? "Spectate" : "Invite Later"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPlayers.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center">
                <Users className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No players found</h3>
                <p className="text-gray-400 text-center">Try adjusting your search criteria</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default VipDashboard;
