
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search, Users } from "lucide-react";
import MatchTypeCard from "@/components/ui/MatchTypeCard";

interface FindMatchTabProps {
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
  isSearchingMatch: boolean;
  handleFindMatch: () => void;
  currentUser: any;
  matches: any[];
  loading: boolean;
  navigate: (path: string) => void;
  onCreateTabClick: () => void;
}

const FindMatchTab: React.FC<FindMatchTabProps> = ({
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
  isSearchingMatch,
  handleFindMatch,
  currentUser,
  matches,
  loading,
  navigate,
  onCreateTabClick
}) => {
  return (
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
              {matches.slice(0, 6).map((match) => (
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
                    <Button variant="default" size="sm" onClick={onCreateTabClick}>
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
  );
};

export default FindMatchTab;
