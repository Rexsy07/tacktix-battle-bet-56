
import { useState } from "react";
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
import { Flame, Users, Trophy, Wallet, ArrowRight, Lock, Clock, Crown, Star, Plus, Search } from "lucide-react";

interface HighStakeMatch {
  id: string;
  mode: string;
  map: string;
  betAmount: number;
  status: "open" | "ongoing" | "completed";
  participants: {
    name: string;
    avatar: string;
    wins: number;
  }[];
  createdAt: string;
}

interface VipPlayer {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  winRate: number;
  totalWinnings: number;
  status: "online" | "in-match" | "offline";
}

const VipDashboard = () => {
  const [tab, setTab] = useState("matches");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Dummy data
  const highStakeMatches: HighStakeMatch[] = [
    {
      id: "vip-1",
      mode: "Search & Destroy",
      map: "Standoff",
      betAmount: 50000,
      status: "open",
      participants: [
        { name: "EliteSniper", avatar: "/placeholder.svg", wins: 156 },
        { name: "TacktixPro", avatar: "/placeholder.svg", wins: 143 }
      ],
      createdAt: "2 minutes ago"
    },
    {
      id: "vip-2",
      mode: "1v1 Duel",
      map: "Gulag Showers",
      betAmount: 25000,
      status: "ongoing",
      participants: [
        { name: "Shadow_Assassin", avatar: "/placeholder.svg", wins: 98 },
        { name: "DeadlyAim", avatar: "/placeholder.svg", wins: 112 }
      ],
      createdAt: "15 minutes ago"
    },
    {
      id: "vip-3",
      mode: "Battle Royale",
      map: "Isolated",
      betAmount: 100000,
      status: "open",
      participants: [
        { name: "VictoryHunter", avatar: "/placeholder.svg", wins: 201 },
      ],
      createdAt: "1 hour ago"
    },
    {
      id: "vip-4",
      mode: "Hardpoint",
      map: "Nuketown",
      betAmount: 75000,
      status: "completed",
      participants: [
        { name: "TackticalGenius", avatar: "/placeholder.svg", wins: 187 },
        { name: "SharpShooter", avatar: "/placeholder.svg", wins: 165 }
      ],
      createdAt: "3 hours ago"
    }
  ];

  const vipPlayers: VipPlayer[] = [
    {
      id: "player-1",
      name: "EliteSniper",
      avatar: "/placeholder.svg",
      rank: "Diamond I",
      winRate: 87.5,
      totalWinnings: 850000,
      status: "online"
    },
    {
      id: "player-2",
      name: "Shadow_Assassin",
      avatar: "/placeholder.svg",
      rank: "Legendary",
      winRate: 92.3,
      totalWinnings: 1250000,
      status: "in-match"
    },
    {
      id: "player-3",
      name: "VictoryHunter",
      avatar: "/placeholder.svg",
      rank: "Master II",
      winRate: 78.1,
      totalWinnings: 620000,
      status: "online"
    },
    {
      id: "player-4",
      name: "DeadlyAim",
      avatar: "/placeholder.svg",
      rank: "Diamond II",
      winRate: 83.7,
      totalWinnings: 750000,
      status: "offline"
    }
  ];

  const filteredMatches = highStakeMatches.filter(match => {
    const matchesQuery = match.mode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          match.map.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          match.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (showOnlyAvailable) {
      return matchesQuery && match.status === "open";
    }
    return matchesQuery;
  });

  const filteredPlayers = vipPlayers.filter(player => {
    const matchesQuery = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          player.rank.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showOnlyAvailable) {
      return matchesQuery && player.status === "online";
    }
    return matchesQuery;
  });

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
                  <p className="text-lg font-bold text-tacktix-blue">Elite</p>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy className="text-yellow-400 mb-1 h-5 w-5" />
                  <h4 className="text-sm text-gray-400">Win Rate</h4>
                  <p className="text-lg font-bold text-tacktix-blue">76%</p>
                </div>
                <div className="flex flex-col items-center">
                  <Wallet className="text-yellow-400 mb-1 h-5 w-5" />
                  <h4 className="text-sm text-gray-400">Total Earnings</h4>
                  <p className="text-lg font-bold text-tacktix-blue">₦435,000</p>
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
                          {match.status === "open" && (
                            <Badge variant="success" size="sm">Open to Join</Badge>
                          )}
                          {match.status === "ongoing" && (
                            <Badge variant="badge" size="sm" className="animate-pulse">In Progress</Badge>
                          )}
                          {match.status === "completed" && (
                            <Badge variant="secondary" size="sm">Completed</Badge>
                          )}
                          <span className="text-xs text-gray-400">{match.createdAt}</span>
                        </div>
                        <h3 className="text-lg font-semibold flex items-center">
                          {match.mode}
                          <span className="mx-2 text-gray-500">•</span>
                          {match.map}
                        </h3>
                        <p className="text-tacktix-blue font-bold text-xl mt-1">₦{match.betAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex -space-x-3">
                          {match.participants.map((player, index) => (
                            <Avatar key={index} className="border-2 border-tacktix-dark-deeper">
                              <AvatarImage src={player.avatar} alt={player.name} />
                              <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {match.status === "open" && (
                            <div className="h-10 w-10 rounded-full bg-tacktix-blue/20 flex items-center justify-center border-2 border-tacktix-dark-deeper">
                              <Plus className="h-5 w-5 text-tacktix-blue" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-400 mt-2">
                          {match.participants.length} of 2 players
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-tacktix-dark-deeper flex items-center justify-center p-4 md:w-[180px]">
                    {match.status === "open" && (
                      <Button variant="gradient" className="w-full">
                        Join Match
                      </Button>
                    )}
                    {match.status === "ongoing" && (
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
                  <TableHead>Rank</TableHead>
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
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-tacktix-blue/10">
                        {player.rank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-tacktix-blue font-semibold">{player.winRate}%</span>
                    </TableCell>
                    <TableCell>
                      <span>₦{player.totalWinnings.toLocaleString()}</span>
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
