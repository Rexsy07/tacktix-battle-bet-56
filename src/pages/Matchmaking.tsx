import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterX, Target, Trophy, Shield, Swords, Map, Crosshair, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BrowseMatchesTab from "@/components/matchmaking/BrowseMatchesTab";
import FindMatchTab from "@/components/matchmaking/FindMatchTab";
import CreateMatchTab from "@/components/matchmaking/CreateMatchTab";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";
import { getUserBalance } from "@/utils/wallet-utils";

const gameModes = [
  { id: "search_destroy", name: "Search & Destroy", icon: <Shield size={20} />, maps: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"] },
  { id: "hardpoint", name: "Hardpoint", icon: <Target size={20} />, maps: ["Nuketown", "Raid", "Hijacked", "Takeoff", "Scrapyard"] },
  { id: "domination", name: "Domination", icon: <Crosshair size={20} />, maps: ["Terminal", "Hackney Yard", "Meltdown", "Tunisia", "Highrise"] },
  { id: "team_deathmatch", name: "Team Deathmatch", icon: <Swords size={20} />, maps: ["Killhouse", "Shipment", "Rust", "Dome", "Coastal"] },
  { id: "battle_royale", name: "Battle Royale", icon: <Map size={20} />, maps: ["Isolated", "Alcatraz"] },
  { id: "gunfight", name: "Gunfight", icon: <Trophy size={20} />, maps: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"] },
];

const teamSizes = [
  { id: "1v1", name: "1v1", modes: ["search_destroy", "team_deathmatch", "gunfight", "battle_royale"] },
  { id: "2v2", name: "2v2", modes: ["search_destroy", "team_deathmatch", "gunfight", "hardpoint"] },
  { id: "3v3", name: "3v3", modes: ["search_destroy", "team_deathmatch", "hardpoint", "domination"] },
  { id: "5v5", name: "5v5", modes: ["search_destroy", "team_deathmatch", "hardpoint", "domination"] },
  { id: "squads", name: "Squads", modes: ["battle_royale"] },
];

const betAmounts = [1000, 2000, 3000, 5000, 10000];

const Matchmaking = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMode, setActiveMode] = useState("search_destroy");
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedTeamSize, setSelectedTeamSize] = useState("1v1");
  const [selectedBetAmount, setSelectedBetAmount] = useState(1000);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [lobbyCode, setLobbyCode] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [isVIPMatch, setIsVIPMatch] = useState(false);
  
  const activeGameMode = gameModes.find(mode => mode.id === activeMode);
  const availableTeamSizes = teamSizes.filter(size => size.modes.includes(activeMode));

  useEffect(() => {
    // Check URL params for VIP mode
    if (searchParams.get('vip') === 'true') {
      setIsVIPMatch(true);
      setSelectedBetAmount(10000); // Set minimum VIP bet amount
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUser(session.user);
          const balance = await getUserBalance(session.user.id);
          setWalletBalance(balance);
        }
        
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('status', 'pending')
          .is('opponent_id', null)
          .order('created_at', { ascending: false });
          
        if (matchesError) {
          console.error("Error fetching matches:", matchesError);
          throw matchesError;
        }
        
        if (matchesData && matchesData.length > 0) {
          const hostIds = [...new Set(matchesData.map(match => match.host_id).filter(Boolean))];
          
          if (hostIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', hostIds);
              
            if (!profilesError && profilesData) {
              const matchesWithHosts = matchesData.map(match => ({
                ...match,
                host: profilesData.find(profile => profile.id === match.host_id)
              }));
              setMatches(matchesWithHosts);
            } else {
              setMatches(matchesData);
            }
          } else {
            setMatches(matchesData);
          }
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again.",
          variant: "destructive",
        });
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  useEffect(() => {
    console.log("Setting up real-time subscription for matches");
    
    const matchesSubscription = supabase
      .channel('matches-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches' 
      }, async (payload) => {
        console.log("Real-time matches update received:", payload);
        
        if (payload.eventType === 'UPDATE' && payload.new.opponent_id) {
          setMatches(prevMatches => 
            prevMatches.filter(match => match.id !== payload.new.id)
          );
          
          toast({
            title: "Match Updated",
            description: "A match has been joined by another player",
          });
        } else if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
          const { data: hostProfile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', payload.new.host_id)
            .single();
          
          const newMatch = {
            ...payload.new,
            host: hostProfile
          };
          
          setMatches(prevMatches => [newMatch, ...prevMatches]);
        }
      })
      .subscribe();

    return () => {
      console.log("Cleaning up matches real-time subscription");
      supabase.removeChannel(matchesSubscription);
    };
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

    if (!lobbyCode) {
      toast({
        title: "Lobby Code Required",
        description: "Please enter a lobby code for the match",
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

    if (isVIPMatch && selectedBetAmount < 10000) {
      toast({
        title: "Invalid VIP Bet Amount",
        description: "Minimum VIP bet amount is ₦10,000",
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
      const platformFee = selectedBetAmount * 0.10;
      const prizePool = selectedBetAmount * 2 - platformFee;
      
      console.log("Creating match with data:", {
        created_by: currentUser.id,
        host_id: currentUser.id,
        title: `${activeGameMode!.name} on ${selectedMap}`,
        description: `${selectedTeamSize} ${activeGameMode!.name} match on ${selectedMap}`,
        game_mode: activeMode,
        map_name: selectedMap,
        bet_amount: selectedBetAmount,
        entry_fee: selectedBetAmount,
        prize_pool: prizePool,
        platform_fee: platformFee,
        lobby_code: lobbyCode,
        host_notes: hostNotes,
        team_size: selectedTeamSize,
        status: 'pending',
        is_vip_match: isVIPMatch,
        max_players: 2,
        current_players: 1
      });
      
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          created_by: currentUser.id,
          host_id: currentUser.id,
          title: `${activeGameMode!.name} on ${selectedMap}`,
          description: `${selectedTeamSize} ${activeGameMode!.name} match on ${selectedMap}`,
          game_mode: activeMode,
          map_name: selectedMap,
          bet_amount: selectedBetAmount,
          entry_fee: selectedBetAmount,
          prize_pool: prizePool,
          platform_fee: platformFee,
          lobby_code: lobbyCode,
          host_notes: hostNotes,
          team_size: selectedTeamSize,
          status: 'pending',
          is_vip_match: isVIPMatch,
          max_players: 2,
          current_players: 1
        })
        .select()
        .single();
        
      if (matchError) {
        console.error("Match creation error:", matchError);
        throw matchError;
      }
      
      console.log("Match created successfully:", matchData);
      
      toast({
        title: `${isVIPMatch ? "VIP " : ""}Match Created!`,
        description: `Your ${activeGameMode!.name} match on ${selectedMap} has been created.`,
      });
      
      navigate(`/featured-match/${matchData.id}`);
    } catch (error: any) {
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
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'pending')
        .eq('game_mode', activeMode)
        .eq('map_name', selectedMap)
        .eq('bet_amount', selectedBetAmount)
        .is('opponent_id', null)
        .neq('host_id', currentUser.id)
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        navigate(`/join-match/${data[0].id}`);
      } else {
        toast({
          title: "No Matches Found",
          description: "We'll create a new match for you instead.",
        });
        
        document.getElementById('create-tab')?.click();
      }
    } catch (error: any) {
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

  const handleCreateTabClick = () => {
    document.getElementById('create-tab')?.click();
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
            <Button variant="gradient" onClick={handleCreateTabClick}>
              <PlusCircle size={16} className="mr-2" />
              Create
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={searchParams.get('tab') || "browse"} className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
            <TabsTrigger value="find" id="find-tab">Find Match</TabsTrigger>
            <TabsTrigger value="create" id="create-tab">Create Match</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <BrowseMatchesTab 
              loading={loading}
              filteredMatches={filteredMatches}
              formatTimeRemaining={formatTimeRemaining}
              onCreateMatchClick={handleCreateTabClick}
            />
          </TabsContent>
          
          <TabsContent value="find">
            <FindMatchTab 
              gameModes={gameModes}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              selectedMap={selectedMap}
              setSelectedMap={setSelectedMap}
              selectedTeamSize={selectedTeamSize}
              setSelectedTeamSize={setSelectedTeamSize}
              activeGameMode={activeGameMode}
              availableTeamSizes={availableTeamSizes}
              teamSizes={teamSizes}
              selectedBetAmount={selectedBetAmount}
              setSelectedBetAmount={setSelectedBetAmount}
              customBetAmount={customBetAmount}
              setCustomBetAmount={setCustomBetAmount}
              betAmounts={betAmounts}
              walletBalance={walletBalance}
              isSearchingMatch={isSearchingMatch}
              handleFindMatch={handleFindMatch}
              currentUser={currentUser}
              matches={matches}
              loading={loading}
              navigate={navigate}
              onCreateTabClick={handleCreateTabClick}
            />
          </TabsContent>
          
          <TabsContent value="create">
            <CreateMatchTab 
              gameModes={gameModes}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              selectedMap={selectedMap}
              setSelectedMap={setSelectedMap}
              teamSize={selectedTeamSize}
              setTeamSize={setSelectedTeamSize}
              activeGameMode={activeGameMode}
              availableTeamSizes={availableTeamSizes}
              teamSizes={teamSizes}
              selectedBetAmount={selectedBetAmount}
              setSelectedBetAmount={setSelectedBetAmount}
              customBetAmount={customBetAmount}
              setCustomBetAmount={setCustomBetAmount}
              betAmounts={betAmounts}
              walletBalance={walletBalance}
              isCreatingMatch={isCreatingMatch}
              handleCreateMatch={handleCreateMatch}
              currentUser={currentUser}
              lobbyCode={lobbyCode}
              setLobbyCode={setLobbyCode}
              hostNotes={hostNotes}
              setHostNotes={setHostNotes}
              isVIPMatch={isVIPMatch}
              setIsVIPMatch={setIsVIPMatch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Matchmaking;
