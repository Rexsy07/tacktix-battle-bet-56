
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDown, 
  ArrowUp, 
  Trophy, 
  X, 
  Star, 
  Clock, 
  Search, 
  ChevronDown 
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Sample match history data
const matchHistory = [
  {
    id: 1,
    gameMode: "Search & Destroy",
    map: "Standoff",
    betAmount: 2000,
    result: "win",
    opponent: "FragMaster",
    score: "6-4",
    date: "Sep 25, 2023",
    earnings: 3800,
    rated: true,
    rating: 4
  },
  {
    id: 2,
    gameMode: "Hardpoint",
    map: "Nuketown",
    betAmount: 1000,
    result: "loss",
    opponent: "ShadowNinja",
    score: "145-200",
    date: "Sep 26, 2023",
    earnings: -1000,
    rated: true,
    rating: 3
  },
  {
    id: 3,
    gameMode: "Battle Royale",
    map: "Isolated",
    betAmount: 3000,
    result: "win",
    opponent: "DeadlyAssault",
    score: "1st place",
    date: "Sep 27, 2023",
    earnings: 5700,
    rated: false,
    rating: 0
  },
  {
    id: 4,
    gameMode: "Gunfight",
    map: "Pine",
    betAmount: 5000,
    result: "win",
    opponent: "GhostSniper",
    score: "6-2",
    date: "Sep 28, 2023",
    earnings: 9500,
    rated: true,
    rating: 5
  },
  {
    id: 5,
    gameMode: "Team Deathmatch",
    map: "Shipment",
    betAmount: 2000,
    result: "loss",
    opponent: "EliteWarrior",
    score: "45-50",
    date: "Sep 29, 2023",
    earnings: -2000,
    rated: true,
    rating: 4
  }
];

// Match filters
const GAME_MODES = [
  "All Modes",
  "Search & Destroy",
  "Hardpoint",
  "Domination",
  "Team Deathmatch",
  "Gunfight",
  "Battle Royale"
];

const RESULT_FILTERS = ["All Results", "Wins Only", "Losses Only"];

const TIME_FILTERS = ["All Time", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameMode, setGameMode] = useState(GAME_MODES[0]);
  const [resultFilter, setResultFilter] = useState(RESULT_FILTERS[0]);
  const [timeFilter, setTimeFilter] = useState(TIME_FILTERS[0]);

  const winCount = matchHistory.filter(match => match.result === "win").length;
  const lossCount = matchHistory.filter(match => match.result === "loss").length;
  const totalEarnings = matchHistory.reduce((sum, match) => sum + match.earnings, 0);
  const winRate = Math.round((winCount / matchHistory.length) * 100);

  // Filter matches based on search query and filters
  const filteredMatches = matchHistory.filter(match => {
    // Search filter
    if (searchQuery && !match.opponent.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Game mode filter
    if (gameMode !== "All Modes" && match.gameMode !== gameMode) {
      return false;
    }
    
    // Result filter
    if (resultFilter === "Wins Only" && match.result !== "win") {
      return false;
    }
    if (resultFilter === "Losses Only" && match.result !== "loss") {
      return false;
    }
    
    // Time filter is simplified for the mockup
    return true;
  });

  return (
    <Layout>
      <div className="py-6">
        <div className="container max-w-5xl">
          <h1 className="text-2xl font-bold mb-6">Match History</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 rounded-lg flex flex-col justify-between">
              <h3 className="text-sm text-gray-400 mb-2">Total Matches</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{matchHistory.length}</span>
                <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-tacktix-blue" />
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg flex flex-col justify-between">
              <h3 className="text-sm text-gray-400 mb-2">Win Rate</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{winRate}%</span>
                <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center">
                  <Trophy size={16} className="text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg flex flex-col justify-between">
              <h3 className="text-sm text-gray-400 mb-2">W/L Ratio</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{winCount}/{lossCount}</span>
                <div className="flex">
                  <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center mr-1">
                    <ArrowUp size={16} className="text-green-500" />
                  </div>
                  <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <ArrowDown size={16} className="text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-lg flex flex-col justify-between">
              <h3 className="text-sm text-gray-400 mb-2">Net Earnings</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</span>
                <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center">
                  <ArrowUp size={16} className="text-tacktix-blue" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="matches">
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Search opponents..."
                        className="pl-10 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="text-sm">
                            {gameMode}
                            <ChevronDown size={14} className="ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {GAME_MODES.map((mode) => (
                            <DropdownMenuItem
                              key={mode}
                              onClick={() => setGameMode(mode)}
                            >
                              {mode}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="text-sm">
                            {resultFilter}
                            <ChevronDown size={14} className="ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {RESULT_FILTERS.map((filter) => (
                            <DropdownMenuItem
                              key={filter}
                              onClick={() => setResultFilter(filter)}
                            >
                              {filter}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="text-sm">
                            {timeFilter}
                            <ChevronDown size={14} className="ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {TIME_FILTERS.map((filter) => (
                            <DropdownMenuItem
                              key={filter}
                              onClick={() => setTimeFilter(filter)}
                            >
                              {filter}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Match History Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Date</th>
                          <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Game Mode</th>
                          <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Map</th>
                          <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Opponent</th>
                          <th className="py-3 px-4 text-center text-xs uppercase tracking-wider text-gray-400 font-medium">Score</th>
                          <th className="py-3 px-4 text-center text-xs uppercase tracking-wider text-gray-400 font-medium">Result</th>
                          <th className="py-3 px-4 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Bet</th>
                          <th className="py-3 px-4 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Earnings</th>
                          <th className="py-3 px-4 text-center text-xs uppercase tracking-wider text-gray-400 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMatches.map((match) => (
                          <tr key={match.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-4 px-4">
                              <span className="text-gray-300">{match.date}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white">{match.gameMode}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-300">{match.map}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white">{match.opponent}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-gray-300">{match.score}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {match.result === "win" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">
                                  <Trophy size={12} className="mr-1" />
                                  Win
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
                                  <X size={12} className="mr-1" />
                                  Loss
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-gray-300">₦{match.betAmount.toLocaleString()}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={match.earnings > 0 ? "text-green-500" : "text-red-500"}>
                                {match.earnings > 0 ? "+" : ""}₦{match.earnings.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {match.rated ? (
                                <div className="flex items-center justify-center">
                                  {[...Array(match.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className="text-yellow-500 fill-yellow-500"
                                    />
                                  ))}
                                  {[...Array(5 - match.rating)].map((_, i) => (
                                    <Star
                                      key={i + match.rating}
                                      size={14}
                                      className="text-gray-500"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" className="text-xs py-1 h-auto">
                                  Rate
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                <div className="text-center py-10">
                  <p className="text-gray-400">
                    View your transaction history in the Wallet section.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = "/wallet"}
                  >
                    Go to Wallet
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
