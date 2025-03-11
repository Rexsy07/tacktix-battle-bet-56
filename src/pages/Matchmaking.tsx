
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/layout/Layout";
import MatchTypeCard from "@/components/ui/MatchTypeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, FilterX, Target, Trophy, Shield, Swords, Gamepad2, Users, 
  Timer, Map, Crosshair, AlertCircle, ArrowRight, PlusCircle
} from "lucide-react";

const gameModes = [
  { id: "snd", name: "Search & Destroy", icon: <Shield size={20} />, maps: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"] },
  { id: "hp", name: "Hardpoint", icon: <Target size={20} />, maps: ["Nuketown", "Raid", "Hijacked", "Takeoff", "Scrapyard"] },
  { id: "dom", name: "Domination", icon: <Crosshair size={20} />, maps: ["Terminal", "Hackney Yard", "Meltdown", "Tunisia", "Highrise"] },
  { id: "tdm", name: "Team Deathmatch", icon: <Swords size={20} />, maps: ["Killhouse", "Shipment", "Rust", "Dome", "Coastal"] },
  { id: "br", name: "Battle Royale", icon: <Map size={20} />, maps: ["Isolated", "Alcatraz"] },
  { id: "gf", name: "Gunfight", icon: <Trophy size={20} />, maps: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"] },
];

const teamSizes = [
  { id: "1v1", name: "1v1", modes: ["snd", "tdm", "gf", "br"] },
  { id: "2v2", name: "2v2", modes: ["snd", "tdm", "gf", "hp"] },
  { id: "3v3", name: "3v3", modes: ["snd", "tdm", "hp", "dom"] },
  { id: "5v5", name: "5v5", modes: ["snd", "tdm", "hp", "dom"] },
  { id: "squads", name: "Squads", modes: ["br"] },
];

const betAmounts = [1000, 2000, 3000, 5000, 10000];

const Matchmaking = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMode, setActiveMode] = useState("snd");
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedTeamSize, setSelectedTeamSize] = useState("1v1");
  const [selectedBetAmount, setSelectedBetAmount] = useState(1000);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  
  const activeGameMode = gameModes.find(mode => mode.id === activeMode);
  const availableTeamSizes = teamSizes.filter(size => size.modes.includes(activeMode));

  const handleCreateMatch = () => {
    setIsCreatingMatch(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreatingMatch(false);
      toast({
        title: "Match Created!",
        description: `Your ${activeGameMode?.name} match on ${selectedMap} has been created.`,
        variant: "default",
      });
    }, 1500);
  };
  
  const handleFindMatch = () => {
    setIsSearchingMatch(true);
    
    // Simulate searching
    setTimeout(() => {
      setIsSearchingMatch(false);
      toast({
        title: "Match Found!",
        description: "We've found a match for you. Get ready to play!",
        variant: "default",
      });
    }, 2500);
  };
  
  const filteredMatches = [
    {
      id: "match-1",
      mode: "Search & Destroy",
      map: "Standoff",
      teamSize: "5v5",
      betAmount: "₦5,000",
      host: "xSniperKing",
      timeLeft: "10:45",
      players: {
        required: 10,
        joined: 7
      }
    },
    {
      id: "match-2",
      mode: "Hardpoint",
      map: "Nuketown",
      teamSize: "3v3",
      betAmount: "₦3,000",
      host: "FragMaster",
      timeLeft: "5:30",
      players: {
        required: 6,
        joined: 4
      }
    },
    {
      id: "match-3",
      mode: "Battle Royale",
      map: "Isolated",
      teamSize: "Squads",
      betAmount: "₦10,000",
      host: "VictoryHunter",
      timeLeft: "15:20",
      players: {
        required: 8,
        joined: 5
      }
    }
  ].filter(match => {
    if (!searchTerm) return true;
    return (
      match.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.map.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.host.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Matchmaking</h1>
            <p className="text-gray-400">Find or create matches and start betting</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search matches..."
                className="pl-9 bg-tacktix-dark-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm("")}
                >
                  <FilterX size={16} />
                </button>
              )}
            </div>
            <Button variant="gradient" onClick={() => document.getElementById('create-tab')?.click()}>
              <PlusCircle size={16} className="mr-2" />
              Create
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
            <TabsTrigger value="find" id="find-tab">Find Match</TabsTrigger>
            <TabsTrigger value="create" id="create-tab">Create Match</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map(match => (
                    <Card key={match.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 p-5 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                              {match.mode}
                            </Badge>
                          </div>
                          <h3 className="text-white font-medium mt-2">{match.map}</h3>
                          <div className="flex items-center text-gray-400 text-sm mt-1">
                            <Users size={14} className="mr-1 text-tacktix-blue" />
                            <span>{match.teamSize}</span>
                          </div>
                          <div className="text-tacktix-blue font-bold mt-2">{match.betAmount}</div>
                        </div>
                        
                        <div className="md:w-2/4 p-5 border-b md:border-b-0 md:border-r border-white/5">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mr-2">
                                    {match.host.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{match.host}</div>
                                    <div className="text-xs text-gray-400">Host</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                  <Timer size={14} className="mr-1" />
                                  <span>Starts in {match.timeLeft}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="w-full bg-tacktix-dark h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-tacktix-blue to-tacktix-blue-light h-2 rounded-full"
                                  style={{ width: `${(match.players.joined / match.players.required) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{match.players.joined} joined</span>
                                <span>{match.players.required - match.players.joined} slots left</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-1/4 p-5 flex flex-col justify-center items-center">
                          <Button variant="gradient" className="w-full mb-2">
                            Join Match
                          </Button>
                          <Button variant="outline" className="w-full text-xs">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <AlertCircle size={48} className="text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">No Matches Found</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        We couldn't find any matches matching your search criteria. Try adjusting your filters or create your own match.
                      </p>
                      <Button variant="gradient" onClick={() => document.getElementById('create-tab')?.click()}>
                        Create a Match
                        <PlusCircle size={16} className="ml-2" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="find">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="glass-card sticky top-24">
                  <CardHeader>
                    <CardTitle>Match Preferences</CardTitle>
                    <CardDescription>Set your game preferences for matchmaking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Game Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        {gameModes.slice(0, 6).map(mode => (
                          <MatchTypeCard
                            key={mode.id}
                            title={mode.name}
                            icon={mode.icon}
                            isActive={activeMode === mode.id}
                            onClick={() => {
                              setActiveMode(mode.id);
                              setSelectedMap("");
                              
                              // Check if current team size is valid for new mode
                              const teamSize = teamSizes.find(size => size.id === selectedTeamSize);
                              if (!teamSize?.modes.includes(mode.id)) {
                                setSelectedTeamSize(availableTeamSizes[0]?.id || "1v1");
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Map</label>
                      <Select value={selectedMap} onValueChange={setSelectedMap}>
                        <SelectTrigger className="bg-tacktix-dark-light text-white">
                          <SelectValue placeholder="Select a map" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeGameMode?.maps.map(map => (
                            <SelectItem key={map} value={map}>{map}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Team Size</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTeamSizes.map(size => (
                          <Button
                            key={size.id}
                            type="button"
                            variant={selectedTeamSize === size.id ? "gradient" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTeamSize(size.id)}
                            className="bg-tacktix-dark-light border-white/10"
                          >
                            {size.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bet Amount (₦)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {betAmounts.map(amount => (
                          <Button
                            key={amount}
                            type="button"
                            variant={selectedBetAmount === amount && !customBetAmount ? "gradient" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedBetAmount(amount);
                              setCustomBetAmount("");
                            }}
                            className="bg-tacktix-dark-light border-white/10"
                          >
                            ₦{amount.toLocaleString()}
                          </Button>
                        ))}
                        
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Custom amount (min ₦1,000)"
                            className="bg-tacktix-dark-light text-white"
                            value={customBetAmount}
                            onChange={(e) => {
                              setCustomBetAmount(e.target.value);
                              if (parseInt(e.target.value) >= 1000) {
                                setSelectedBetAmount(parseInt(e.target.value));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="gradient" 
                      className="w-full" 
                      onClick={handleFindMatch}
                      disabled={isSearchingMatch || !selectedMap || selectedBetAmount < 1000}
                    >
                      {isSearchingMatch ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Finding Match...
                        </>
                      ) : (
                        <>
                          Find Match
                          <Search size={16} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle>Available Players</CardTitle>
                    <CardDescription>Players currently looking for matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-tacktix-dark-light/50 border border-white/5"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {["X", "S", "F", "G", "V", "T"][idx]}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {["xSniperKing", "ShadowNinja", "FragMaster", "GhostSniper", "VictoryHunter", "TacticalOps"][idx]}
                              </div>
                              <div className="text-xs text-tacktix-blue">
                                {["78%", "69%", "72%", "63%", "70%", "61%"][idx]} Win Rate
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button variant="outline" size="sm" className="text-xs">
                              Challenge
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-6">
                      <Button variant="ghost" className="text-gray-400 text-sm">
                        Load More Players
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="create">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Create a Match</CardTitle>
                  <CardDescription>Set up a custom game and wait for players to join</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Game Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {gameModes.slice(0, 6).map(mode => (
                        <MatchTypeCard
                          key={mode.id}
                          title={mode.name}
                          icon={mode.icon}
                          isActive={activeMode === mode.id}
                          onClick={() => {
                            setActiveMode(mode.id);
                            setSelectedMap("");
                            
                            // Check if current team size is valid for new mode
                            const teamSize = teamSizes.find(size => size.id === selectedTeamSize);
                            if (!teamSize?.modes.includes(mode.id)) {
                              setSelectedTeamSize(availableTeamSizes[0]?.id || "1v1");
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Map</label>
                    <Select value={selectedMap} onValueChange={setSelectedMap}>
                      <SelectTrigger className="bg-tacktix-dark-light text-white">
                        <SelectValue placeholder="Select a map" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeGameMode?.maps.map(map => (
                          <SelectItem key={map} value={map}>{map}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTeamSizes.map(size => (
                        <Button
                          key={size.id}
                          type="button"
                          variant={selectedTeamSize === size.id ? "gradient" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTeamSize(size.id)}
                          className="bg-tacktix-dark-light border-white/10"
                        >
                          {size.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bet Amount (₦)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {betAmounts.map(amount => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedBetAmount === amount && !customBetAmount ? "gradient" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedBetAmount(amount);
                            setCustomBetAmount("");
                          }}
                          className="bg-tacktix-dark-light border-white/10"
                        >
                          ₦{amount.toLocaleString()}
                        </Button>
                      ))}
                      
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Custom amount (min ₦1,000)"
                          className="bg-tacktix-dark-light text-white"
                          value={customBetAmount}
                          onChange={(e) => {
                            setCustomBetAmount(e.target.value);
                            if (parseInt(e.target.value) >= 1000) {
                              setSelectedBetAmount(parseInt(e.target.value));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleCreateMatch}
                    disabled={isCreatingMatch || !selectedMap || selectedBetAmount < 1000}
                  >
                    {isCreatingMatch ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Creating Match...
                      </>
                    ) : (
                      <>
                        Create Match
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Match Preview</CardTitle>
                  <CardDescription>How your match will appear to other players</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-tacktix-dark-deeper to-tacktix-dark p-4 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                          {activeGameMode?.name || "Select a mode"}
                        </Badge>
                        <div className="text-tacktix-blue font-bold">
                          {selectedBetAmount ? `₦${selectedBetAmount.toLocaleString()}` : "₦0"}
                        </div>
                      </div>
                      <h3 className="font-medium text-white mt-2">{selectedMap || "Select a map"}</h3>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Users size={14} className="mr-1" />
                        <span>{selectedTeamSize || "Select team size"}</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          X
                        </div>
                        <div>
                          <div className="font-medium text-white">xSniperKing</div>
                          <div className="text-xs text-gray-400">Host</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-2">Match Rules</div>
                          <div className="bg-tacktix-dark-light/50 rounded-md p-3 text-sm">
                            <p>• Standard {activeGameMode?.name || "game"} rules apply</p>
                            <p>• First to win according to game rules</p>
                            <p>• Screenshots required for verification</p>
                            <p>• Voice chat optional but recommended</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400 mb-2">Required Players</div>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: parseInt(selectedTeamSize?.charAt(0) || "1") * 2 }).map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`h-10 w-full rounded-md flex items-center justify-center ${
                                  idx === 0 
                                    ? "bg-tacktix-blue text-white" 
                                    : "bg-tacktix-dark-light/30 text-gray-500"
                                }`}
                              >
                                {idx === 0 ? "You" : "?"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle size={18} className="text-tacktix-blue mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-300">
                          Once created, this match will be visible to all players. Funds will be locked in escrow when the match is filled and both teams confirm participation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Matchmaking;
