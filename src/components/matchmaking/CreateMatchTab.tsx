
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, ArrowRight, Copy, Crown } from "lucide-react";
import MatchTypeCard from "@/components/ui/MatchTypeCard";
import { useToast } from "@/components/ui/use-toast";

interface CreateMatchTabProps {
  gameModes: any[];
  activeMode: string;
  setActiveMode: (mode: string) => void;
  selectedMap: string;
  setSelectedMap: (map: string) => void;
  selectedTeamSize: string;
  setSelectedTeamSize: (size: string) => void;
  activeGameMode: any;
  availableTeamSizes: any[];
  teamSizes: any[];
  selectedBetAmount: number;
  setSelectedBetAmount: (amount: number) => void;
  customBetAmount: string;
  setCustomBetAmount: (amount: string) => void;
  betAmounts: number[];
  walletBalance: number;
  isCreatingMatch: boolean;
  handleCreateMatch: () => void;
  currentUser: any;
}

const CreateMatchTab: React.FC<CreateMatchTabProps> = ({
  gameModes,
  activeMode,
  setActiveMode,
  selectedMap,
  setSelectedMap,
  selectedTeamSize,
  setSelectedTeamSize,
  activeGameMode,
  availableTeamSizes,
  teamSizes,
  selectedBetAmount,
  setSelectedBetAmount,
  customBetAmount,
  setCustomBetAmount,
  betAmounts,
  walletBalance,
  isCreatingMatch,
  handleCreateMatch,
  currentUser
}) => {
  const { toast } = useToast();
  const [lobbyCode, setLobbyCode] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [isVIPMatch, setIsVIPMatch] = useState(false);

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    toast({
      title: "Copied!",
      description: "Lobby code copied to clipboard",
    });
  };

  // Calculate platform fee (10% of entry fee)
  const platformFee = selectedBetAmount * 0.10;
  const prizePool = selectedBetAmount * 2 - platformFee;

  return (
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Lobby Code</label>
            <div className="flex gap-2">
              <Input
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                placeholder="Enter your lobby code"
                className="bg-tacktix-dark-light text-white"
                maxLength={8}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyLobbyCode}
                className="bg-tacktix-dark-light border-white/10"
                disabled={!lobbyCode}
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Enter a custom lobby code that opponents will use to join your match.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Host Notes (Optional)</label>
            <Textarea
              value={hostNotes}
              onChange={(e) => setHostNotes(e.target.value)}
              placeholder="Add any additional information for your opponent..."
              className="bg-tacktix-dark-light text-white"
              rows={3}
            />
            <p className="text-xs text-gray-400">
              Share game rules, requirements, or any other details with your opponent.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="vip-match"
              checked={isVIPMatch}
              onCheckedChange={setIsVIPMatch}
            />
            <Label htmlFor="vip-match" className="flex items-center">
              <Crown className="h-4 w-4 mr-1 text-yellow-500" />
              VIP Match (High Stakes)
            </Label>
          </div>

          <div className="space-y-2 p-3 bg-tacktix-dark-light/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Entry Fee:</span>
              <span>₦{selectedBetAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee (10%):</span>
              <span>₦{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Prize Pool:</span>
              <span className="text-green-500">₦{prizePool.toLocaleString()}</span>
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
            disabled={isCreatingMatch || !selectedMap || !lobbyCode || selectedBetAmount < 1000 || !currentUser}
          >
            {isCreatingMatch ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Match...
              </>
            ) : (
              <>
                Create {isVIPMatch ? "VIP " : ""}Match
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
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                    {activeGameMode?.name || "Select a mode"}
                  </Badge>
                  {isVIPMatch && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
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
                  {currentUser?.username?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-medium text-white">{currentUser?.username || currentUser?.email || "Sign in to create"}</div>
                  <div className="text-xs text-gray-400">Host</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Lobby Code</div>
                  <div className="bg-tacktix-dark-light/50 rounded-md p-3 text-center font-mono font-medium text-lg">
                    {lobbyCode || "Enter lobby code"}
                  </div>
                </div>

                {hostNotes && (
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Host Notes</div>
                    <div className="bg-tacktix-dark-light/50 rounded-md p-3 text-sm">
                      {hostNotes}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">Match Rules</div>
                  <div className="bg-tacktix-dark-light/50 rounded-md p-3 text-sm">
                    <p>• Standard {activeGameMode?.name || "game"} rules apply</p>
                    <p>• First to reach the objective wins</p>
                    <p>• Screenshots of results required</p>
                    <p>• Platform fee: ₦{platformFee.toLocaleString()}</p>
                    <p>• Winner takes: ₦{prizePool.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatchTab;
