
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import MatchTypeCard from "@/components/ui/MatchTypeCard";
import { 
  Search, Target, Bomb, Flag, Users, Crosshair, Map as MapIcon, 
  PlusCircle, Filter, DollarSign, Users as UsersIcon, Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import GameCard from "@/components/ui/GameCard";
import { useToast } from "@/components/ui/use-toast";

const gameModes = [
  { id: 'snd', title: "Search & Destroy", icon: <Bomb size={24} /> },
  { id: 'hp', title: "Hardpoint", icon: <Target size={24} /> },
  { id: 'dom', title: "Domination", icon: <Flag size={24} /> },
  { id: 'tdm', title: "Team Deathmatch", icon: <Users size={24} /> },
  { id: 'gf', title: "Gunfight", icon: <Crosshair size={24} /> },
  { id: 'br', title: "Battle Royale", icon: <MapIcon size={24} /> },
];

const modeToMaps = {
  snd: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"],
  hp: ["Nuketown", "Raid", "Hijacked", "Takeoff", "Scrapyard"],
  dom: ["Terminal", "Hackney Yard", "Meltdown", "Tunisia", "Highrise"],
  tdm: ["Killhouse", "Shipment", "Rust", "Dome", "Coastal"],
  gf: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"],
  br: ["Isolated", "Alcatraz"]
};

const teamSizeOptions = [
  { value: "1v1", label: "1v1" },
  { value: "2v2", label: "2v2" },
  { value: "3v3", label: "3v3" },
  { value: "5v5", label: "5v5" },
  { value: "squads", label: "Squads (BR)" },
];

const betAmountPresets = [
  { value: 1000, label: "₦1,000" },
  { value: 2000, label: "₦2,000" },
  { value: 3000, label: "₦3,000" },
  { value: 5000, label: "₦5,000" },
  { value: 10000, label: "₦10,000" },
];

// Sample available matches
const availableMatches = [
  {
    id: 1,
    mode: "Search & Destroy",
    map: "Standoff",
    betAmount: "₦5,000",
    teamSize: "5v5",
    timeLeft: "12 min",
    players: [
      { name: "xSniperKing", winRate: "78%" },
      { name: "DeadlyAssault", winRate: "65%" }
    ]
  },
  {
    id: 2,
    mode: "Hardpoint",
    map: "Nuketown",
    betAmount: "₦3,000",
    teamSize: "3v3",
    timeLeft: "5 min",
    players: [
      { name: "FragMaster", winRate: "82%" },
      { name: "ShadowNinja", winRate: "75%" }
    ]
  },
  {
    id: 3,
    mode: "Battle Royale",
    map: "Isolated",
    betAmount: "₦2,000",
    teamSize: "Squads",
    timeLeft: "8 min",
    players: [
      { name: "VictoryHunter", winRate: "70%" },
      { name: "GhostSniper", winRate: "63%" }
    ]
  },
  {
    id: 4,
    mode: "Team Deathmatch",
    map: "Shipment",
    betAmount: "₦1,000",
    teamSize: "5v5",
    timeLeft: "3 min",
    players: [
      { name: "EliteWarrior", winRate: "69%" },
      { name: "TacticalOps", winRate: "73%" }
    ]
  },
  {
    id: 5,
    mode: "Gunfight",
    map: "Pine",
    betAmount: "₦10,000",
    teamSize: "2v2",
    timeLeft: "15 min",
    players: [
      { name: "StealthKiller", winRate: "88%" },
      { name: "NinjaWarrior", winRate: "85%" }
    ]
  },
  {
    id: 6,
    mode: "Domination",
    map: "Firing Range",
    betAmount: "₦2,000",
    teamSize: "5v5",
    timeLeft: "10 min",
    players: [
      { name: "WarMachine", winRate: "75%" },
      { name: "SniperElite", winRate: "71%" }
    ]
  }
];

const MatchmakingPage = () => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState('snd');
  const [activeTab, setActiveTab] = useState('find');
  const [showFilters, setShowFilters] = useState(false);
  
  // Create match form state
  const [selectedMap, setSelectedMap] = useState(modeToMaps[activeMode][0]);
  const [selectedTeamSize, setSelectedTeamSize] = useState(teamSizeOptions[0].value);
  const [selectedBetAmount, setSelectedBetAmount] = useState(betAmountPresets[0].value);
  const [customBetAmount, setCustomBetAmount] = useState(1000);

  const handleFindMatch = () => {
    toast({
      title: "Finding Match",
      description: "Searching for opponents...",
    });
  };

  const handleCreateMatch = () => {
    toast({
      title: "Match Created",
      description: `Your ${gameModes.find(m => m.id === activeMode)?.title} match on ${selectedMap} has been created.`,
    });
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="container max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Matchmaking</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {gameModes.map((mode) => (
              <MatchTypeCard
                key={mode.id}
                title={mode.title}
                icon={mode.icon}
                isActive={activeMode === mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  setSelectedMap(modeToMaps[mode.id][0]);
                }}
              />
            ))}
          </div>

          <div className="glass-card rounded-xl p-6 mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="find" className="flex items-center">
                    <Search size={16} className="mr-2" />
                    Find Match
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center">
                    <PlusCircle size={16} className="mr-2" />
                    Create Match
                  </TabsTrigger>
                </TabsList>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
              </div>
              
              {showFilters && (
                <div className="mb-6 p-4 bg-tacktix-dark-light rounded-lg">
                  <h3 className="font-medium mb-4">Filter Matches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Bet Amount</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>₦1,000</span>
                          <span>₦10,000</span>
                        </div>
                        <Slider
                          defaultValue={[1000]}
                          max={10000}
                          min={1000}
                          step={1000}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Team Size</label>
                      <div className="grid grid-cols-5 gap-2">
                        {teamSizeOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`py-1 px-2 rounded-md text-sm transition-colors ${
                              selectedTeamSize === option.value
                                ? "bg-tacktix-blue text-white"
                                : "bg-tacktix-dark text-gray-300 hover:bg-tacktix-dark-light"
                            }`}
                            onClick={() => setSelectedTeamSize(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Map</label>
                      <select
                        className="w-full bg-tacktix-dark border border-tacktix-dark-light rounded-md px-3 py-2 text-sm text-white"
                        value={selectedMap}
                        onChange={(e) => setSelectedMap(e.target.value)}
                      >
                        {modeToMaps[activeMode].map((map) => (
                          <option key={map} value={map}>
                            {map}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" className="mr-2">
                      Reset
                    </Button>
                    <Button variant="default" size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
              
              <TabsContent value="find">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Available Matches</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableMatches
                      .filter(match => (activeMode === "snd" && match.mode === "Search & Destroy") ||
                                      (activeMode === "hp" && match.mode === "Hardpoint") ||
                                      (activeMode === "dom" && match.mode === "Domination") ||
                                      (activeMode === "tdm" && match.mode === "Team Deathmatch") ||
                                      (activeMode === "gf" && match.mode === "Gunfight") ||
                                      (activeMode === "br" && match.mode === "Battle Royale"))
                      .map((match) => (
                        <GameCard
                          key={match.id}
                          mode={match.mode}
                          map={match.map}
                          betAmount={match.betAmount}
                          teamSize={match.teamSize}
                          timeLeft={match.timeLeft}
                          players={match.players}
                        />
                      ))}
                  </div>
                  
                  {availableMatches.filter(match => 
                    (activeMode === "snd" && match.mode === "Search & Destroy") ||
                    (activeMode === "hp" && match.mode === "Hardpoint") ||
                    (activeMode === "dom" && match.mode === "Domination") ||
                    (activeMode === "tdm" && match.mode === "Team Deathmatch") ||
                    (activeMode === "gf" && match.mode === "Gunfight") ||
                    (activeMode === "br" && match.mode === "Battle Royale")
                  ).length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-gray-400 mb-4">
                        No available matches for this game mode. Create your own match!
                      </p>
                      <Button 
                        variant="gradient" 
                        onClick={() => setActiveTab('create')}
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Create a Match
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-tacktix-dark-deeper px-2 text-gray-400">Or</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-gray-400 mb-4">
                        Don't see a match you like? Find an opponent instantly!
                      </p>
                      <Button 
                        variant="gradient" 
                        size="lg" 
                        className="px-8"
                        onClick={handleFindMatch}
                      >
                        <Search size={18} className="mr-2" />
                        Quick Match
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="create">
                <div className="space-y-8">
                  <h3 className="text-lg font-medium">Create a New Match</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <Target size={16} className="mr-2 text-tacktix-blue" />
                          Game Mode
                        </label>
                        <div className="bg-tacktix-dark-light p-4 rounded-lg">
                          <h4 className="font-medium mb-2">
                            {gameModes.find(m => m.id === activeMode)?.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {activeMode === 'snd' && "Plant or defuse the bomb. No respawns."}
                            {activeMode === 'hp' && "Capture and hold the hardpoint to earn points."}
                            {activeMode === 'dom' && "Capture and hold three flags on the map."}
                            {activeMode === 'tdm' && "Eliminate enemy players to reach the score limit."}
                            {activeMode === 'gf' && "Small team tactical combat with limited lives."}
                            {activeMode === 'br' && "Be the last player or team standing."}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <MapIcon size={16} className="mr-2 text-tacktix-blue" />
                          Map
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {modeToMaps[activeMode].map((map) => (
                            <button
                              key={map}
                              className={`py-2 px-3 rounded-md text-sm transition-colors ${
                                selectedMap === map
                                  ? "bg-tacktix-blue text-white"
                                  : "bg-tacktix-dark-light text-gray-300 hover:bg-tacktix-dark"
                              }`}
                              onClick={() => setSelectedMap(map)}
                            >
                              {map}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <UsersIcon size={16} className="mr-2 text-tacktix-blue" />
                          Team Size
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {teamSizeOptions
                            .filter(option => 
                              // Only show Squads for Battle Royale
                              (activeMode === 'br' && option.value === 'squads') ||
                              // Don't show Squads for non-BR modes
                              (activeMode !== 'br' && option.value !== 'squads')
                            )
                            .map((option) => (
                              <button
                                key={option.value}
                                className={`py-2 px-3 rounded-md text-sm transition-colors ${
                                  selectedTeamSize === option.value
                                    ? "bg-tacktix-blue text-white"
                                    : "bg-tacktix-dark-light text-gray-300 hover:bg-tacktix-dark"
                                }`}
                                onClick={() => setSelectedTeamSize(option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <DollarSign size={16} className="mr-2 text-tacktix-blue" />
                          Bet Amount
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {betAmountPresets.map((preset) => (
                            <button
                              key={preset.value}
                              className={`py-2 px-3 rounded-md text-sm transition-colors ${
                                selectedBetAmount === preset.value && !customBetAmount
                                  ? "bg-tacktix-blue text-white"
                                  : "bg-tacktix-dark-light text-gray-300 hover:bg-tacktix-dark"
                              }`}
                              onClick={() => {
                                setSelectedBetAmount(preset.value);
                                setCustomBetAmount(0);
                              }}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Or Enter Custom Amount (Minimum ₦1,000)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400">₦</span>
                            </div>
                            <input
                              type="number"
                              min="1000"
                              step="100"
                              className="w-full pl-8 py-2 px-3 bg-tacktix-dark-light text-white border border-tacktix-dark-light rounded-md focus:border-tacktix-blue focus:outline-none"
                              value={customBetAmount || ""}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setCustomBetAmount(value);
                                setSelectedBetAmount(0);
                              }}
                              placeholder="Custom amount"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <Clock size={16} className="mr-2 text-tacktix-blue" />
                          Match Rules
                        </label>
                        <div className="bg-tacktix-dark-light p-4 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <p className="flex justify-between">
                              <span className="text-gray-300">Time Limit:</span>
                              <span className="text-white">
                                {activeMode === 'br' ? '30 minutes' : '10 minutes'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-300">Score Limit:</span>
                              <span className="text-white">
                                {activeMode === 'snd' ? '6 rounds' : 
                                 activeMode === 'hp' ? '250 points' :
                                 activeMode === 'dom' ? '200 points' :
                                 activeMode === 'tdm' ? '75 kills' :
                                 activeMode === 'gf' ? '6 rounds' :
                                 'Last team standing'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-300">Weapon Restrictions:</span>
                              <span className="text-white">None</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-300">Required Evidence:</span>
                              <span className="text-white">End-of-match screenshots</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Match Summary</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {gameModes.find(m => m.id === activeMode)?.title} on {selectedMap}, {selectedTeamSize} 
                        with ₦{customBetAmount || selectedBetAmount} bet
                      </p>
                    </div>
                    
                    <Button 
                      variant="gradient" 
                      size="lg"
                      onClick={handleCreateMatch}
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Create Match
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatchmakingPage;
