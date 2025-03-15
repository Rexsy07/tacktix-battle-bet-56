import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMode, setActiveMode] = useState("snd");
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedTeamSize, setSelectedTeamSize] = useState("1v1");
  const [selectedBetAmount, setSelectedBetAmount] = useState(1000);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const activeGameMode = gameModes.find(mode => mode.id === activeMode);
  const availableTeamSizes = teamSizes.filter(size => size.modes.includes(activeMode));

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUser(session.user);
          
          // Fetch user's wallet balance
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', session.user.id)
            .single();
            
          if (!walletError) {
            setWalletBalance(walletData.balance);
          }
        }
        
        // Fetch matches that are still pending (no opponent yet)
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            host:host_id(id, username, avatar_url)
          `)
          .eq('status', 'pending')
          .is('opponent_id', null)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setMatches(data || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
    
    // Set up a polling interval to refresh matches
    const interval = setInterval(fetchMatches, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [toast]);

  const handleCreateMatch = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a match",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }
    
    if (!selectedMap) {
      toast({
        title: "Map Required",
        description: "Please select a map for the match",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedBetAmount < 1000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Minimum bet amount is ₦1,000",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedBetAmount > walletBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      navigate("/wallet");
      return;
    }
    
    setIsCreatingMatch(true);
    
    try {
      // Generate a random lobby code
      const lobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Insert new match into the database
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          host_id: currentUser.id,
          game_mode: activeGameMode.name,
          map_name: selectedMap,
          bet_amount: selectedBetAmount,
          lobby_code: lobbyCode,
          status: 'pending',
          is_vip_match: false
        })
        .select()
        .single();
        
      if (matchError) throw matchError;
      
      // Deduct bet amount from wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: walletBalance - selectedBetAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);
        
      if (walletError) throw walletError;
      
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: currentUser.id,
          amount: selectedBetAmount,
          type: 'bet',
          status: 'completed',
          description: `Bet placed on ${activeGameMode.name} match on ${selectedMap}`
        });
        
      if (transactionError) throw transactionError;
      
      toast({
        title: "Match Created!",
        description: `Your ${activeGameMode.name} match on ${selectedMap} has been created.`,
      });
      
      // Navigate to the match details page
      navigate(`/match/${matchData.id}`);
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Match Creation Failed",
        description: error.message || "Failed to create match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMatch(false);
    }
  };
  
  const handleFindMatch = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to find a match",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }
    
    if (!selectedMap) {
      toast({
        title: "Map Required",
        description: "Please select a map for the match",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedBetAmount > walletBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      navigate("/wallet");
      return;
    }
    
    setIsSearchingMatch(true);
    
    try {
      // Find a matching game
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'pending')
        .eq('game_mode', activeGameMode.name)
        .eq('map_name', selectedMap)
        .eq('bet_amount', selectedBetAmount)
        .is('opponent_id', null)
        .neq('host_id', currentUser.id)
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Found a match, navigate to join page
        navigate(`/join-match/${data[0].id}`);
      } else {
        // No match found, create one
        toast({
          title: "No Matches Found",
          description: "We'll create a new match for you instead.",
        });
        
        document.getElementById('create-tab')?.click();
      }
    } catch (error) {
      console.error("Error finding match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to find a match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingMatch(false);
    }
  };
  
  const filteredMatches = matches.filter(match => {
    if (!searchTerm) return true;
    return (
      match.game_mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.map_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.host?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format match time remaining
  const formatTimeRemaining = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const timeOpen = now.getTime() - created.getTime();
    const minutesOpen = Math.floor(timeOpen / (1000 * 60));
    
    if (minutesOpen < 60) {
      return `${minutesOpen}m`;
    } else {
      const hoursOpen = Math.floor(minutesOpen / 60);
      const remainingMinutes = minutesOpen % 60;
      return `${hoursOpen}h ${remainingMinutes}m`;
    }
  };

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
                {loading ? (
                  <Card className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue mb-4"></div>
                      <h3 className="text-xl font-medium text-white mb-2">Loading Matches</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Fetching available matches. This won't take long.
                      </p>
                    </div>
                  </Card>
                ) : filteredMatches.length > 0 ? (
                  filteredMatches.map(match => (
                    <Card key={match.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 p-5 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                              {match.game_mode}
                            </Badge>
                          </div>
                          <h3 className="text-white font-medium mt-2">{match.map_name}</h3>
                          <div className="flex items-center text-gray-400 text-sm mt-1">
                            <Users size={14} className="mr-1 text-tacktix-blue" />
                            <span>{match.team_size || "1v1"}</span>
                          </div>
                          <div className="text-tacktix-blue font-bold mt-2">₦{match.bet_amount.toLocaleString()}</div>
                        </div>
                        
                        <div className="md:w-2/4 p-5 border-b md:border-b-0 md:border-r border-white/5">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mr-2">
                                    {match.host?.username?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{match.host?.username || "Unknown"}</div>
                                    <div className="text-xs text-gray-400">Host</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                  <Timer size={14} className="mr-1" />
                                  <span>Open for {formatTimeRemaining(match.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="w-full bg-tacktix-dark h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-tacktix-blue to-tacktix-blue-light h-2 rounded-full"
                                  style={{ width: `50%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1 joined</span>
                                <span>1 slot left</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-1/4 p-5 flex flex-col justify-center items-center">
                          <Link to={`/join-match/${match.id}`} className="w-full mb-2">
                            <Button variant="gradient" className="w-full">
                              Join Match
                            </Button>
                          </Link>
                          <Link to={`/match/${match.id}`} className="w-full">
                            <Button variant="outline" className="w-full text-xs">
                              View Details
                            </Button>
                          </Link>
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
                    
                    {currentUser && (
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-400">Wallet Balance:</span>
                        <span className="text-tacktix-blue font-medium">₦{walletBalance.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="gradient" 
                      className="w-full" 
                      onClick={handleFindMatch}
                      disabled={isSearchingMatch || !selectedMap || selectedBetAmount < 1000 || !currentUser}
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
                      {matches.slice(0, 6).map((match, idx) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-tacktix-dark-light/50 border border-white/5"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {match.host?.username?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {match.host?.username || "Unknown Player"}
                              </div>
                              <div className="text-xs text-tacktix-blue">
                                {match.game_mode} on {match.map_name}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Link to={`/join-match/${match.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">
                                Join
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {matches.length === 0 && !loading && (
                        <div className="col-span-2 text-center py-8 text-gray-400">
                          No players are currently looking for matches.
                          <div className="mt-4">
                            <Button variant="default" size="sm" onClick={() => document.getElementById('create-tab')?.click()}>
                              Create a Match
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {matches.length > 6 && (
                      <div className="text-center mt-6">
                        <Button 
                          variant="ghost" 
                          className="text-gray-400 text-sm"
                          onClick={() => navigate('/matchmaking')}
                        >
                          View More Matches
                        </Button>
                      </div>
                    )}
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
                  
                  {currentUser && (
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-400">Wallet Balance:</span>
                      <span className="text-tacktix-blue font-medium">₦{walletBalance.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleCreateMatch}
                    disabled={isCreatingMatch || !selectedMap || selectedBetAmount < 1000 || !currentUser}
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
                          {currentUser?.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{currentUser?.email || "Sign in to create"}</div>
                          <div className="text-xs text-gray-400">Host</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-2">Match Rules</div>
                          <div className="bg-tacktix-dark-light/50 rounded-md p-3 text-sm">
                            <p>• Standard {activeGameMode?.name || "game"} rules apply
