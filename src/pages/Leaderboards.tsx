
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import LeaderboardTable from "@/components/ui/LeaderboardTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, TrendingUp, Gamepad, Target } from "lucide-react";

const Leaderboards = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample data for different leaderboard categories
  const overallTopPlayers = [
    {
      position: 1,
      name: "xSniperKing",
      matches: 145,
      winRate: "78%",
      earnings: "₦125,750"
    },
    {
      position: 2,
      name: "DeadlyAssault",
      matches: 132,
      winRate: "72%",
      earnings: "₦98,500"
    },
    {
      position: 3,
      name: "ShadowNinja",
      matches: 128,
      winRate: "69%",
      earnings: "₦87,250"
    },
    {
      position: 4,
      name: "FragMaster",
      matches: 115,
      winRate: "65%",
      earnings: "₦76,300"
    },
    {
      position: 5,
      name: "TacticalOps",
      matches: 106,
      winRate: "61%",
      earnings: "₦64,800"
    },
    {
      position: 6,
      name: "StealthKiller",
      matches: 98,
      winRate: "58%",
      earnings: "₦57,200"
    },
    {
      position: 7,
      name: "SharpShooter",
      matches: 94,
      winRate: "56%",
      earnings: "₦52,600"
    },
    {
      position: 8,
      name: "EliteSniper",
      matches: 89,
      winRate: "53%",
      earnings: "₦48,950"
    },
    {
      position: 9,
      name: "GhostRecon",
      matches: 83,
      winRate: "51%",
      earnings: "₦43,700"
    },
    {
      position: 10,
      name: "SilentAssassin",
      matches: 78,
      winRate: "49%",
      earnings: "₦40,200"
    }
  ];
  
  const sndChampions = [
    {
      position: 1,
      name: "xSniperKing",
      matches: 87,
      winRate: "82%",
      earnings: "₦76,450"
    },
    {
      position: 2,
      name: "BombExpert",
      matches: 72,
      winRate: "78%",
      earnings: "₦63,200"
    },
    {
      position: 3,
      name: "LastManStanding",
      matches: 65,
      winRate: "76%",
      earnings: "₦57,900"
    },
    {
      position: 4,
      name: "ClutchMaster",
      matches: 61,
      winRate: "71%",
      earnings: "₦48,350"
    },
    {
      position: 5,
      name: "ShadowStep",
      matches: 58,
      winRate: "68%",
      earnings: "₦42,700"
    },
    {
      position: 6,
      name: "SilentDefuse",
      matches: 52,
      winRate: "65%",
      earnings: "₦37,800"
    },
    {
      position: 7,
      name: "SteelNerve",
      matches: 49,
      winRate: "63%",
      earnings: "₦35,200"
    },
    {
      position: 8,
      name: "GhostPlanter",
      matches: 45,
      winRate: "61%",
      earnings: "₦32,100"
    },
    {
      position: 9,
      name: "DeadlyRotation",
      matches: 42,
      winRate: "59%",
      earnings: "₦29,800"
    },
    {
      position: 10,
      name: "SiteHolder",
      matches: 39,
      winRate: "58%",
      earnings: "₦27,500"
    }
  ];
  
  const hardpointKings = [
    {
      position: 1,
      name: "ObjectiveMaster",
      matches: 79,
      winRate: "80%",
      earnings: "₦68,200"
    },
    {
      position: 2,
      name: "HillDefender",
      matches: 67,
      winRate: "76%",
      earnings: "₦59,750"
    },
    {
      position: 3,
      name: "PointSecurer",
      matches: 63,
      winRate: "74%",
      earnings: "₦56,800"
    },
    {
      position: 4,
      name: "TimeKeeper",
      matches: 59,
      winRate: "71%",
      earnings: "₦51,200"
    },
    {
      position: 5,
      name: "RotationKing",
      matches: 54,
      winRate: "68%",
      earnings: "₦45,300"
    },
    {
      position: 6,
      name: "AnchorPlayer",
      matches: 51,
      winRate: "65%",
      earnings: "₦39,600"
    },
    {
      position: 7,
      name: "HillHunter",
      matches: 47,
      winRate: "62%",
      earnings: "₦36,200"
    },
    {
      position: 8,
      name: "ZoneController",
      matches: 43,
      winRate: "60%",
      earnings: "₦32,800"
    },
    {
      position: 9,
      name: "ClockRunner",
      matches: 39,
      winRate: "57%",
      earnings: "₦28,900"
    },
    {
      position: 10,
      name: "ScrapFighter",
      matches: 36,
      winRate: "55%",
      earnings: "₦25,700"
    }
  ];
  
  const brKillers = [
    {
      position: 1,
      name: "BattleRoyale",
      matches: 92,
      winRate: "32%",
      earnings: "₦87,600"
    },
    {
      position: 2,
      name: "LastSurvivor",
      matches: 84,
      winRate: "28%",
      earnings: "₦74,300"
    },
    {
      position: 3,
      name: "ZoneRunner",
      matches: 77,
      winRate: "25%",
      earnings: "₦65,800"
    },
    {
      position: 4,
      name: "AirDropHunter",
      matches: 72,
      winRate: "24%",
      earnings: "₦61,200"
    },
    {
      position: 5,
      name: "SoloSquadKing",
      matches: 68,
      winRate: "23%",
      earnings: "₦57,900"
    },
    {
      position: 6,
      name: "HighKill",
      matches: 63,
      winRate: "22%",
      earnings: "₦52,400"
    },
    {
      position: 7,
      name: "SafeZonePro",
      matches: 59,
      winRate: "20%",
      earnings: "₦48,300"
    },
    {
      position: 8,
      name: "LootMaster",
      matches: 54,
      winRate: "19%",
      earnings: "₦44,700"
    },
    {
      position: 9,
      name: "ChopperPilot",
      matches: 51,
      winRate: "18%",
      earnings: "₦41,200"
    },
    {
      position: 10,
      name: "AlcatrazWinner",
      matches: 47,
      winRate: "17%",
      earnings: "₦38,600"
    }
  ];

  // Filter players based on search query
  const filterPlayers = (players) => {
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
