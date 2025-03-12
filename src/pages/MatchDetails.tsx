import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Trophy, Shield, Users, Map, Timer, AlertCircle, 
  CheckCircle2, XCircle, Camera, MessageSquare, Copy, ArrowLeft
} from "lucide-react";

const MatchDetails = () => {
  const { matchId } = useParams();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  // Mock data for a match (in a real app, this would come from an API)
  const matchData = {
    id: matchId,
    title: "High Stakes S&D",
    mode: "Search & Destroy",
    map: "Standoff",
    teamSize: "5v5",
    betAmount: 5000,
    status: "open", // open, in-progress, completed
    host: {
      id: "host123",
      name: "xSniperKing",
      avatar: "X",
      winRate: "78%"
    },
    rules: [
      "Standard Search & Destroy rules",
      "First to 6 rounds wins",
      "Screenshots required for verification",
      "Voice chat required"
    ],
    teams: {
      alpha: [
        { id: "player1", name: "xSniperKing", status: "ready", avatar: "X" },
        { id: "player2", name: "FragMaster", status: "ready", avatar: "F" },
        { id: "player3", name: null, status: "empty", avatar: null },
        { id: "player4", name: null, status: "empty", avatar: null },
        { id: "player5", name: null, status: "empty", avatar: null },
      ],
      bravo: [
        { id: "player6", name: "ShadowNinja", status: "ready", avatar: "S" },
        { id: "player7", name: null, status: "empty", avatar: null },
        { id: "player8", name: null, status: "empty", avatar: null },
        { id: "player9", name: null, status: "empty", avatar: null },
        { id: "player10", name: null, status: "empty", avatar: null },
      ]
    },
    createdAt: "2023-07-15T14:30:00Z",
    startTime: "2023-07-15T15:00:00Z",
    lobbyCode: "TXE75392",
    escrowAmount: 10000,
  };
  
  const timeLeft = () => {
    const start = new Date(matchData.startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return "Starting now";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };
  
  const handleJoinMatch = () => {
    setIsJoining(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsJoining(false);
      toast({
        title: "Match Joined!",
        description: `You have successfully joined the ${matchData.mode} match on ${matchData.map}.`,
        variant: "default",
      });
    }, 1500);
  };
  
  const handleCopyLobbyCode = () => {
    navigator.clipboard.writeText(matchData.lobbyCode);
    toast({
      title: "Copied!",
      description: "Lobby code copied to clipboard",
      variant: "default",
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Link to="/matchmaking">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{matchData.title}</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                  {matchData.mode}
                </Badge>
                <span>•</span>
                <span>{matchData.map}</span>
                <span>•</span>
                <span>{matchData.teamSize}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="text-tacktix-blue font-bold text-xl">
              ₦{matchData.betAmount.toLocaleString()}
            </div>
            <Button variant="gradient" className="flex-1 md:flex-grow-0" onClick={handleJoinMatch} disabled={isJoining}>
              {isJoining ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Joining...
                </>
              ) : (
                "Join Match"
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle>Teams</CardTitle>
                <CardDescription>Teams will be finalized when all slots are filled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Alpha */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white flex items-center">
                        <Badge variant="outline" className="mr-2 bg-tacktix-dark-light">ALPHA</Badge>
                        Team {matchData.host.name}
                      </h3>
                      {/* Fix: Change size from "badge" to "sm" */}
                      <Badge variant="badge" size="sm">
                        <Trophy size={12} className="mr-1" />
                        Host
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {matchData.teams.alpha.map((player, idx) => (
                        <div 
                          key={`alpha-${idx}`}
                          className="flex items-center justify-between p-2 rounded-md bg-tacktix-dark-light/30 border border-white/5"
                        >
                          {player.name ? (
                            <>
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium mr-2">
                                  {player.avatar}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">{player.name}</span>
                                  <span className="text-xs text-tacktix-blue">Player {idx + 1}</span>
                                </div>
                              </div>
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 size={12} className="mr-1" />
                                Ready
                              </Badge>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-tacktix-dark-light/50 rounded-full flex items-center justify-center text-sm font-medium text-gray-500 mr-2">
                                  ?
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-400">Empty Slot</span>
                                  <span className="text-xs text-gray-500">Player {idx + 1}</span>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs text-gray-400">
                                <XCircle size={12} className="mr-1" />
                                Open
                              </Badge>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Team Bravo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white flex items-center">
                        <Badge variant="outline" className="mr-2 bg-tacktix-dark-light">BRAVO</Badge>
                        Challengers
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {matchData.teams.bravo.map((player, idx) => (
                        <div 
                          key={`bravo-${idx}`}
                          className="flex items-center justify-between p-2 rounded-md bg-tacktix-dark-light/30 border border-white/5"
                        >
                          {player.name ? (
                            <>
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium mr-2">
                                  {player.avatar}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">{player.name}</span>
                                  <span className="text-xs text-tacktix-blue">Player {idx + 1}</span>
                                </div>
                              </div>
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 size={12} className="mr-1" />
                                Ready
                              </Badge>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-tacktix-dark-light/50 rounded-full flex items-center justify-center text-sm font-medium text-gray-500 mr-2">
                                  ?
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-400">Empty Slot</span>
                                  <span className="text-xs text-gray-500">Player {idx + 1}</span>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs text-gray-400">
                                <XCircle size={12} className="mr-1" />
                                Open
                              </Badge>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle>Match Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {matchData.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 size={16} className="text-tacktix-blue mr-2 mt-0.5 flex-shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle>Match Verification</CardTitle>
                  <CardDescription>Requirements for match validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-md bg-tacktix-dark-light/30 border border-white/5">
                      <div className="flex items-center">
                        <Camera size={18} className="text-tacktix-blue mr-2" />
                        <span>Pre-match Screenshot</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">Required</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-md bg-tacktix-dark-light/30 border border-white/5">
                      <div className="flex items-center">
                        <Camera size={18} className="text-tacktix-blue mr-2" />
                        <span>Post-match Screenshot</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">Required</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-md bg-tacktix-dark-light/30 border border-white/5">
                      <div className="flex items-center">
                        <MessageSquare size={18} className="text-tacktix-blue mr-2" />
                        <span>Report Match Result</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">Required</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="md:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle>Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Game Mode
                    </div>
                    <div className="font-medium">{matchData.mode}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Map size={16} className="mr-2" />
                      Map
                    </div>
                    <div className="font-medium">{matchData.map}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Users size={16} className="mr-2" />
                      Team Size
                    </div>
                    <div className="font-medium">{matchData.teamSize}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Trophy size={16} className="mr-2" />
                      Bet Amount
                    </div>
                    <div className="font-medium text-tacktix-blue">₦{matchData.betAmount.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Status
                    </div>
                    <Badge variant="outline" className="bg-green-600/10 text-green-500">
                      Recruiting Players
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Timer size={16} className="mr-2" />
                      Starts in
                    </div>
                    <div className="font-medium text-yellow-400">{timeLeft()}</div>
                  </div>
                  
                  <Separator className="my-2 bg-white/5" />
                  
                  <div>
                    <div className="text-gray-400 mb-2 text-sm">Match Host</div>
                    <div className="flex items-center p-3 rounded-md bg-tacktix-dark-light/30 border border-white/5">
                      <div className="h-10 w-10 bg-tacktix-dark rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {matchData.host.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-white">{matchData.host.name}</div>
                        <div className="text-xs text-tacktix-blue">{matchData.host.winRate} Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center bg-tacktix-dark-light border-white/10 mb-3"
                  onClick={handleCopyLobbyCode}
                >
                  <span>Lobby Code: <span className="font-bold">{matchData.lobbyCode}</span></span>
                  <Copy size={16} />
                </Button>
                
                <div className="p-4 bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-md w-full">
                  <div className="flex items-start">
                    <AlertCircle size={18} className="text-tacktix-blue mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">
                        By joining this match, ₦{matchData.betAmount.toLocaleString()} will be deducted from your wallet and held in escrow until the match is completed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle>Match Chat</CardTitle>
                <CardDescription>Communicate with other players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-md">
                  <p className="text-gray-400 text-sm">Chat will be available when you join the match</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatchDetails;
