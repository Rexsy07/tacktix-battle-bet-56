
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, Gamepad2, Target, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeRemaining } from "@/utils/matchmaking-helpers";
import MatchCard from "@/components/matchmaking/MatchCard";

const Matchmaking = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  // Create Match State
  const [activeMode, setActiveMode] = useState("battle-royale");
  const [selectedMap, setSelectedMap] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [scheduledTime, setScheduledTime] = useState("");
  const [teamSize, setTeamSize] = useState("1v1");
  const [isVIPMatch, setIsVIPMatch] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const gameModes = [
    {
      id: "battle-royale",
      name: "Battle Royale",
      icon: <Target className="h-6 w-6" />,
      maps: ["Erangel", "Miramar", "Sanhok", "Vikendi"]
    },
    {
      id: "team-deathmatch",
      name: "Team Deathmatch",
      icon: <Users className="h-6 w-6" />,
      maps: ["Dust2", "Inferno", "Mirage", "Cache"]
    },
    {
      id: "quick-match",
      name: "Quick Match",
      icon: <Zap className="h-6 w-6" />,
      maps: ["Random"]
    }
  ];

  useEffect(() => {
    if (activeTab === "browse") {
      fetchMatches();
    }
  }, [activeTab]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          host:profiles!matches_created_by_fkey(username),
          opponent:profiles!matches_opponent_id_fkey(username)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a match title",
        variant: "destructive"
      });
      return;
    }

    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid entry fee",
        variant: "destructive"
      });
      return;
    }

    if (isVIPMatch && fee < 10000) {
      toast({
        title: "VIP Match Error",
        description: "VIP matches require a minimum entry fee of ₦10,000",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentMode = gameModes.find(mode => mode.id === activeMode);
      
      const { error } = await supabase
        .from("matches")
        .insert({
          created_by: user.id,
          host_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          game_mode: activeMode,
          map_name: selectedMap || null,
          lobby_code: lobbyCode.trim() || null,
          host_notes: hostNotes.trim() || null,
          entry_fee: fee,
          bet_amount: fee,
          prize_pool: fee * 2,
          max_players: parseInt(maxPlayers),
          team_size: teamSize,
          scheduled_time: scheduledTime || null,
          is_vip_match: isVIPMatch,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setLobbyCode("");
      setHostNotes("");
      setEntryFee("0");
      setScheduledTime("");
      setActiveTab("browse");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const currentMode = gameModes.find(mode => mode.id === activeMode);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Find Your Perfect Match</h1>
          <p className="text-gray-400">
            Challenge players, create tournaments, or join exciting matches
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Match</TabsTrigger>
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">VIP Match</Label>
                    <p className="text-xs text-gray-400">Higher stakes, exclusive features</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isVIPMatch}
                      onCheckedChange={setIsVIPMatch}
                    />
                    {isVIPMatch && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Match Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter match title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <Label htmlFor="entry-fee">Entry Fee (₦) *</Label>
                    <Input
                      id="entry-fee"
                      type="number"
                      placeholder={isVIPMatch ? "10000" : "0"}
                      min={isVIPMatch ? "10000" : "0"}
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      disabled={isCreating}
                    />
                    {isVIPMatch && (
                      <p className="text-xs text-yellow-500 mt-1">Minimum ₦10,000 for VIP matches</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your match rules and requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isCreating}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lobby-code">Lobby Code</Label>
                    <Input
                      id="lobby-code"
                      placeholder="Enter lobby/room code..."
                      value={lobbyCode}
                      onChange={(e) => setLobbyCode(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-players">Max Players</Label>
                    <Select value={maxPlayers} onValueChange={setMaxPlayers} disabled={isCreating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select max players" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Players</SelectItem>
                        <SelectItem value="4">4 Players</SelectItem>
                        <SelectItem value="6">6 Players</SelectItem>
                        <SelectItem value="8">8 Players</SelectItem>
                        <SelectItem value="10">10 Players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Game Mode *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {gameModes.map((mode) => (
                      <Card
                        key={mode.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          activeMode === mode.id
                            ? "border-tacktix-blue bg-tacktix-blue/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => setActiveMode(mode.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex justify-center mb-2">{mode.icon}</div>
                          <h3 className="font-medium text-sm">{mode.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {currentMode?.maps.length > 0 && (
                  <div>
                    <Label>Map</Label>
                    <Select value={selectedMap} onValueChange={setSelectedMap} disabled={isCreating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a map" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentMode.maps.map((map) => (
                          <SelectItem key={map} value={map}>
                            {map}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={handleCreateMatch}
                  disabled={isCreating}
                  className="w-full"
                  variant={isVIPMatch ? "gradient" : "default"}
                >
                  {isCreating ? "Creating..." : `Create ${isVIPMatch ? "VIP " : ""}Match`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
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
                ) : matches.length > 0 ? (
                  matches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      formatTimeRemaining={formatTimeRemaining}
                    />
                  ))
                ) : (
                  <Card className="glass-card p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Gamepad2 size={48} className="text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">No Matches Found</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        No matches available right now. Create your own match to get started!
                      </p>
                      <Button variant="gradient" onClick={() => setActiveTab("create")}>
                        Create a Match
                        <Plus size={16} className="ml-2" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Matchmaking;
