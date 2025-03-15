import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import PlayerRating from "@/components/match/PlayerRating";
import MatchEvidence from "@/components/match/MatchEvidence";

const MatchDetails = () => {
  const { matchId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [isUserInMatch, setIsUserInMatch] = useState(false);
  
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (matchId) {
          // Fix the select query by using specific column hints for foreign key relationships
          const { data, error } = await supabase
            .from("matches")
            .select(`
              *,
              host:host_id(id, username, avatar_url),
              opponent:opponent_id(id, username, avatar_url)
            `)
            .eq("id", matchId)
            .single();
            
          if (error) {
            console.error("Error fetching match:", error);
            // If match doesn't exist, use mock data instead
            setMatchData({
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
            });
          } else {
            // If real data exists, map it to our model
            const formattedData = {
              id: data.id,
              title: `${data.game_mode} Match`,
              mode: data.game_mode,
              map: data.map_name,
              teamSize: "5v5", // This would come from DB in a real app
              betAmount: data.bet_amount,
              status: data.status,
              host: {
                id: data.host?.id,
                name: data.host?.username,
                avatar: data.host?.avatar_url?.charAt(0) || "X",
                winRate: "78%" // This would come from DB in a real app
              },
              rules: [
                `Standard ${data.game_mode} rules`,
                "First to 6 rounds wins",
                "Screenshots required for verification",
                "Voice chat required"
              ],
              teams: {
                alpha: [
                  { id: data.host?.id, name: data.host?.username, status: "ready", avatar: data.host?.avatar_url?.charAt(0) || "X" },
                  { id: "player2", name: null, status: "empty", avatar: null },
                  { id: "player3", name: null, status: "empty", avatar: null },
                  { id: "player4", name: null, status: "empty", avatar: null },
                  { id: "player5", name: null, status: "empty", avatar: null },
                ],
                bravo: data.opponent ? [
                  { id: data.opponent?.id, name: data.opponent?.username, status: "ready", avatar: data.opponent?.avatar_url?.charAt(0) || "O" },
                  { id: "player7", name: null, status: "empty", avatar: null },
                  { id: "player8", name: null, status: "empty", avatar: null },
                  { id: "player9", name: null, status: "empty", avatar: null },
                  { id: "player10", name: null, status: "empty", avatar: null },
                ] : [
                  { id: "player6", name: null, status: "empty", avatar: null },
                  { id: "player7", name: null, status: "empty", avatar: null },
                  { id: "player8", name: null, status: "empty", avatar: null },
                  { id: "player9", name: null, status: "empty", avatar: null },
                  { id: "player10", name: null, status: "empty", avatar: null },
                ]
              },
              createdAt: data.created_at,
              startTime: data.start_time || new Date(new Date().getTime() + 30 * 60000).toISOString(), // Default to 30 mins from now
              lobbyCode: data.lobby_code,
              escrowAmount: data.bet_amount * 2,
            };
            
            setMatchData(formattedData);
            
            // Check if current user is in the match
            if (session?.user) {
              if (data.host?.id === session.user.id || data.opponent?.id === session.user.id) {
                setIsUserInMatch(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchData();
  }, [matchId]);
  
  const timeLeft = () => {
    if (!matchData) return "Loading...";
    
    const start = new Date(matchData.startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return "Starting now";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };
  
  const handleJoinMatch = async () => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join a match",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }
      
      setIsJoining(true);
      
      // Check user wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", session.user.id)
        .single();
        
      if (walletError) {
        throw new Error("Could not retrieve wallet information");
      }
      
      if (walletData.balance < matchData.betAmount) {
        toast({
          title: "Insufficient Funds",
          description: `You need ₦${matchData.betAmount.toLocaleString()} to join this match.`,
          variant: "destructive",
        });
        return;
      }
      
      // Update the match with the user as the opponent
      const { error: matchError } = await supabase
        .from("matches")
        .update({ 
          opponent_id: session.user.id,
          status: "waiting",
          updated_at: new Date().toISOString()
        })
        .eq("id", matchData.id)
        .eq("status", "pending"); // Only join if match is still open
        
      if (matchError) {
        if (matchError.code === "23505") {
          toast({
            title: "Match Already Full",
            description: "This match has already been joined by another player.",
            variant: "destructive",
          });
        } else {
          throw matchError;
        }
        return;
      }
      
      // Deduct bet amount from user's wallet
      const { error: deductError } = await supabase
        .from("wallets")
        .update({ 
          balance: walletData.balance - matchData.betAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", session.user.id);
        
      if (deductError) {
        throw deductError;
      }
      
      // Record transaction
      await supabase
        .from("transactions")
        .insert({
          wallet_id: session.user.id,
          amount: -matchData.betAmount,
          type: "bet",
          status: "completed",
          description: `Bet placed on match ${matchData.id}`
        });
        
      toast({
        title: "Match Joined!",
        description: `You have successfully joined the ${matchData.mode} match on ${matchData.map}.`,
        variant: "default",
      });
      
      // Redirect to match lobby
      navigate(`/join-match/${matchData.id}`);
      
    } catch (error: any) {
      console.error("Error joining match:", error);
      toast({
        title: "Failed to Join Match",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleCopyLobbyCode = () => {
    navigator.clipboard.writeText(matchData.lobbyCode);
    toast({
      title: "Copied!",
      description: "Lobby code copied to clipboard",
      variant: "default",
    });
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }
  
  if (!matchData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Match not found</h2>
          <p className="text-gray-400 mt-2">The match you're looking for doesn't exist or has been removed.</p>
          <Button variant="gradient" className="mt-4" onClick={() => navigate('/matchmaking')}>
            Browse Matches
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full">
              <PlayerRating 
                playerName={matchData.status === "completed" ? 
                  (matchData.host.id === matchData.winner ? matchData.host.name : "Opponent") : 
                  matchData.host.name
                }
                playerId={matchData.host.id}
                matchId={matchData.id}
                onClose={() => setShowRatingModal(false)}
              />
            </div>
          </div>
        )}
        
        {/* Evidence Modal */}
        {showEvidenceModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="max-w-lg w-full">
              <MatchEvidence 
                matchId={matchData.id}
                matchStatus={matchData.status === "open" ? "waiting" : matchData.status}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowEvidenceModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      
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
              ₦{Number(matchData.betAmount).toLocaleString()}
            </div>
            {matchData.status === "completed" ? (
              <Button 
                variant="outline" 
                className="flex-1 md:flex-grow-0" 
                onClick={() => setShowRatingModal(true)}
              >
                Rate Player
              </Button>
            ) : matchData.status === "in-progress" ? (
              <Button 
                variant="gradient" 
                className="flex-1 md:flex-grow-0" 
                onClick={() => navigate(`/spectate/${matchData.id}`)}
              >
                Spectate Match
              </Button>
            ) : isUserInMatch ? (
              <Button 
                variant="gradient" 
                className="flex-1 md:flex-grow-0" 
                onClick={() => setShowEvidenceModal(true)}
              >
                Submit Evidence
              </Button>
            ) : (
              <Button 
                variant="gradient" 
                className="flex-1 md:flex-grow-0" 
                onClick={handleJoinMatch} 
                disabled={isJoining || matchData.status !== "open"}
              >
                {isJoining ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Joining...
                  </>
                ) : matchData.status === "open" ? (
                  "Join Match"
                ) : (
                  "Match Full"
                )}
              </Button>
            )}
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
                      <Badge variant="outline" size="sm">
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
                    <div className="font-medium text-tacktix-blue">₦{Number(matchData.betAmount).toLocaleString()}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Status
                    </div>
                    <Badge variant="outline" className={`
                      ${matchData.status === "open" ? "bg-green-600/10 text-green-500" : ""}
                      ${matchData.status === "waiting" ? "bg-yellow-600/10 text-yellow-400" : ""}
                      ${matchData.status === "in-progress" ? "bg-blue-600/10 text-blue-400" : ""}
                      ${matchData.status === "completed" ? "bg-purple-600/10 text-purple-400" : ""}
                    `}>
                      {matchData.status === "open" ? "Recruiting Players" : ""}
                      {matchData.status === "waiting" ? "Waiting to Start" : ""}
                      {matchData.status === "in-progress" ? "In Progress" : ""}
                      {matchData.status === "completed" ? "Completed" : ""}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400 flex items-center">
                      <Timer size={16} className="mr-2" />
                      {matchData.status === "completed" ? "Completed" : "Starts in"}
                    </div>
                    <div className="font-medium text-yellow-400">{matchData.status === "completed" ? "Match Over" : timeLeft()}</div>
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
                        By joining this match, ₦{Number(matchData.betAmount).toLocaleString()} will be deducted from your wallet and held in escrow until the match is completed.
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
