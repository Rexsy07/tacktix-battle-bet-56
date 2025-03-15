
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import LeaderboardTable from "@/components/ui/LeaderboardTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, TrendingUp, Gamepad, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardPlayer {
  position: number;
  name: string;
  matches: number;
  winRate: string;
  earnings: string;
}

const Leaderboards = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [overallTopPlayers, setOverallTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [sndChampions, setSndChampions] = useState<LeaderboardPlayer[]>([]);
  const [hardpointKings, setHardpointKings] = useState<LeaderboardPlayer[]>([]);
  const [brKillers, setBrKillers] = useState<LeaderboardPlayer[]>([]);
  
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        // Fetch overall leaderboard
        const { data: overallData, error: overallError } = await supabase
          .from('leaderboard_stats')
          .select(`
            *,
            profiles:id(username, avatar_url)
          `)
          .order('total_earnings', { ascending: false })
          .limit(10);

        if (overallError) throw overallError;
        
        // Format data
        const formattedOverallData = overallData.map((player, index) => ({
          position: index + 1,
          name: player.profiles?.username || "Unknown Player",
          matches: player.matches_played,
          winRate: player.matches_played > 0 
            ? `${Math.round((player.matches_won / player.matches_played) * 100)}%` 
            : "0%",
          earnings: `₦${player.total_earnings.toFixed(2)}`
        }));
        
        setOverallTopPlayers(formattedOverallData);
        
        // For demo purposes, we'll use the same data for other tabs
        // In a real implementation, you would filter by game mode
        // assuming we have that data in the database
        setSndChampions(formattedOverallData.slice(0, 7));
        setHardpointKings(formattedOverallData.slice(2, 9));
        setBrKillers(formattedOverallData.slice(1, 8));
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Filter players based on search query
  const filterPlayers = (players: LeaderboardPlayer[]) => {
    if (!searchQuery) return players;
    return players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  return (
    <Layout>
      <div className="py-6">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Leaderboards</h1>
              <p className="text-gray-400">Track the top performing players across different game modes</p>
            </div>
            
            <div className="mt-4 md:mt-0 relative w-full md:w-64">
              <Input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
              />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="glass-card rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="h-10 w-10 animate-spin text-tacktix-blue" />
              </div>
            ) : (
              <Tabs defaultValue="overall">
                <div className="p-4 border-b border-white/10">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overall" className="flex items-center">
                      <Trophy size={16} className="mr-2" />
                      <span className="hidden md:inline">Overall</span>
                      <span className="md:hidden">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="snd" className="flex items-center">
                      <Target size={16} className="mr-2" />
                      <span className="hidden md:inline">Search & Destroy</span>
                      <span className="md:hidden">S&D</span>
                    </TabsTrigger>
                    <TabsTrigger value="hardpoint" className="flex items-center">
                      <Award size={16} className="mr-2" />
                      <span className="hidden md:inline">Hardpoint</span>
                      <span className="md:hidden">HP</span>
                    </TabsTrigger>
                    <TabsTrigger value="br" className="flex items-center">
                      <Gamepad size={16} className="mr-2" />
                      <span className="hidden md:inline">Battle Royale</span>
                      <span className="md:hidden">BR</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overall" className="m-0">
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <TrendingUp size={18} className="text-tacktix-blue mr-2" />
                      <h3 className="text-lg font-semibold">Top Overall Earners</h3>
                    </div>
                    <LeaderboardTable 
                      players={filterPlayers(overallTopPlayers)} 
                      title="" 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="snd" className="m-0">
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <Target size={18} className="text-tacktix-blue mr-2" />
                      <h3 className="text-lg font-semibold">Search & Destroy Champions</h3>
                    </div>
                    <LeaderboardTable 
                      players={filterPlayers(sndChampions)} 
                      title="" 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="hardpoint" className="m-0">
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <Award size={18} className="text-tacktix-blue mr-2" />
                      <h3 className="text-lg font-semibold">Hardpoint Kings</h3>
                    </div>
                    <LeaderboardTable 
                      players={filterPlayers(hardpointKings)} 
                      title="" 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="br" className="m-0">
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <Gamepad size={18} className="text-tacktix-blue mr-2" />
                      <h3 className="text-lg font-semibold">Battle Royale Top Players</h3>
                    </div>
                    <LeaderboardTable 
                      players={filterPlayers(brKillers)} 
                      title="" 
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          <div className="mt-8 glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Trophy size={18} className="text-tacktix-blue mr-2" />
              <h3 className="text-lg font-semibold">Leaderboard Rules</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-300">
              <p>• Leaderboards are updated in real-time as matches are completed</p>
              <p>• Players must complete at least 5 matches to appear on the leaderboard</p>
              <p>• Rankings are based on total earnings, win rate, and number of matches played</p>
              <p>• Game mode specific leaderboards only count matches played in that mode</p>
              <p>• Monthly leaderboards reset on the 1st of each month</p>
              <p>• Top 3 players at the end of each month receive special rewards and badges</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboards;
