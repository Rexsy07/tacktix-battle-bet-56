import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Clock, Trophy, CalendarClock, Swords, MapPin, Coins, AlertTriangle, Users, CheckCircle, XCircle } from "lucide-react";
import MatchEvidence from "@/components/match/MatchEvidence";
import PlayerRating from "@/components/match/PlayerRating";

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isUserInMatch, setIsUserInMatch] = useState(false);
  const [isMatchCompleted, setIsMatchCompleted] = useState(false);
  const [hasRatedOpponent, setHasRatedOpponent] = useState(false);
  
  useEffect(() => {
    fetchMatchDetails();
    fetchCurrentUser();
  }, [id]);
  
  useEffect(() => {
    if (currentUser && match) {
      checkUserInMatch();
      checkMatchStatus();
      checkRatingStatus();
    }
  }, [currentUser, match]);
  
  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          host:host_id(id, username, avatar_url),
          opponent:opponent_id(id, username, avatar_url),
          winner:winner_id(id, username, avatar_url)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      setMatch(data);
    } catch (error) {
      console.error("Error fetching match:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (error) throw error;
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  
  const checkUserInMatch = () => {
    if (!currentUser || !match) return;
    
    const userId = currentUser.id;
    const isHost = match.host.id === userId;
    const isOpponent = match.opponent?.id === userId;
    
    setIsUserInMatch(isHost || isOpponent);
  };
  
  const checkMatchStatus = () => {
    if (!match) return;
    setIsMatchCompleted(match.status === "completed");
  };
  
  const checkRatingStatus = async () => {
    if (!currentUser || !match || !isUserInMatch || !isMatchCompleted) return;
    
    try {
      const opponentId = match.host.id === currentUser.id ? match.opponent.id : match.host.id;
      
      const { data, error } = await supabase
        .from("user_ratings")
        .select("*")
        .eq("match_id", match.id)
        .eq("rater_id", currentUser.id)
        .eq("rated_id", opponentId);
      
      if (error) throw error;
      
      setHasRatedOpponent(data && data.length > 0);
    } catch (error) {
      console.error("Error checking rating status:", error);
    }
  };
  
  const handleJoinMatch = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join this match",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Check if user has enough balance
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", currentUser.id)
        .single();
      
      if (walletError) throw walletError;
      
      if (walletData.balance < match.bet_amount) {
        throw new Error("Insufficient funds. Please add more funds to your wallet.");
      }
      
      // Update match with opponent
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          opponent_id: currentUser.id,
          status: "matched",
          updated_at: new Date().toISOString()
        })
        .eq("id", match.id);
      
      if (matchError) throw matchError;
      
      toast({
        title: "Match Joined",
        description: "You have successfully joined this match",
        variant: "default",
      });
      
      // Refresh match data
      fetchMatchDetails();
      
    } catch (error) {
      toast({
        title: "Failed to Join",
        description: error.message || "An error occurred while joining the match",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleReportMatch = async () => {
    if (!currentUser || !isUserInMatch) {
      toast({
        title: "Action Not Allowed",
        description: "You must be a participant in this match to report issues",
        variant: "destructive",
      });
      return;
    }
    
    setIsReporting(true);
    
    try {
      // Navigate to dispute form
      navigate(`/report-match/${match.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate report process",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Clock className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }
  
  if (!match) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
          <p className="text-gray-400 mb-6">The match you're looking for doesn't exist or has been removed</p>
          <Button onClick={() => navigate("/matches")}>
            View All Matches
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Match Details</h1>
            <p className="text-gray-400">View match information and status</p>
          </div>
          
          <div className="flex gap-2">
            {!isUserInMatch && match.status === "open" && (
              <Button 
                onClick={handleJoinMatch} 
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Swords className="mr-2 h-4 w-4" />
                    Join Match
                  </>
                )}
              </Button>
            )}
            
            {isUserInMatch && match.status !== "completed" && (
              <Button 
                variant="outline" 
                onClick={handleReportMatch}
                disabled={isReporting}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Match #{match.id.slice(0, 8)}</CardTitle>
                  <Badge variant={
                    match.status === "open" ? "outline" :
                    match.status === "matched" ? "badge" :
                    match.status === "in_progress" ? "badge" :
                    match.status === "completed" ? "success" :
                    "destructive"
                  }>
                    {match.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  Created {formatDate(match.created_at)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-tacktix-dark-light p-4 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Players
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={match.host.avatar_url} />
                            <AvatarFallback>{match.host.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{match.host.username}</p>
                            <p className="text-xs text-gray-400">Host</p>
                          </div>
                        </div>
                        
                        {match.winner && match.winner.id === match.host.id && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        {match.opponent ? (
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={match.opponent.avatar_url} />
                              <AvatarFallback>{match.opponent.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{match.opponent.username}</p>
                              <p className="text-xs text-gray-400">Opponent</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-400">Waiting for opponent...</p>
                            </div>
                          </div>
                        )}
                        
                        {match.winner && match.opponent && match.winner.id === match.opponent.id && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-tacktix-dark-light p-4 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Swords className="mr-2 h-4 w-4" />
                      Match Details
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Game Mode:</span>
                        <span className="font-medium">{match.game_mode}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Map:</span>
                        <span className="font-medium">{match.map_name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bet Amount:</span>
                        <span className="font-medium text-tacktix-blue">₦{match.bet_amount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lobby Code:</span>
                        <span className="font-medium">{match.lobby_code}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">VIP Match:</span>
                        <span className="font-medium">{match.is_vip_match ? "Yes" : "No"}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Start Time:</span>
                        <span className="font-medium">{formatDate(match.start_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {match.status === "completed" && (
                  <div className="bg-tacktix-dark-light p-4 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                      Match Result
                    </h3>
                    
                    <div className="flex items-center justify-center p-4">
                      {match.winner ? (
                        <div className="text-center">
                          <div className="flex justify-center mb-2">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={match.winner.avatar_url} />
                              <AvatarFallback>{match.winner.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <p className="font-medium text-lg">{match.winner.username}</p>
                          <Badge variant="success" className="mt-2">
                            Winner
                          </Badge>
                          <p className="text-tacktix-blue font-bold mt-2">
                            +₦{(match.bet_amount * 2).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <XCircle className="h-12 w-12 mx-auto mb-2" />
                          <p>No winner declared</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {isUserInMatch && match.status === "completed" && !hasRatedOpponent && (
                  <div className="bg-tacktix-dark-light p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Rate Your Opponent</h3>
                    <PlayerRating 
                      matchId={match.id}
                      opponentId={match.host.id === currentUser.id ? match.opponent.id : match.host.id}
                      opponentName={match.host.id === currentUser.id ? match.opponent.username : match.host.username}
                      onRatingComplete={() => setHasRatedOpponent(true)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {isUserInMatch && (
              <MatchEvidence matchId={match.id} userId={currentUser.id} matchStatus={match.status} />
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">General Rules</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                    <li>Both players must join the match lobby on time</li>
                    <li>Screenshots of match results are required</li>
                    <li>No cheating or exploits allowed</li>
                    <li>Be respectful to your opponent</li>
                    <li>Report any issues immediately</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Game Specific Rules</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-300">
                    <li>Mode: {match.game_mode}</li>
                    <li>Map: {match.map_name}</li>
                    <li>First to 10 kills wins</li>
                    <li>No restricted weapons</li>
                    <li>Maximum match time: 15 minutes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  If you're experiencing issues with this match or have questions, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatchDetails;
