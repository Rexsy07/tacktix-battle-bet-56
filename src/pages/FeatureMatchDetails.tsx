
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, User, Clock, Map, X, CheckCircle, ShieldAlert } from "lucide-react";

// Function to format time remaining
const formatTimeRemaining = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
};

const FeatureMatchDetails = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [opponentProfile, setOpponentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserWallet, setCurrentUserWallet] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        // First get the match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .single();
        
        if (matchError) throw matchError;
        setMatch(matchData);
        
        // Get host profile
        const { data: hostData, error: hostError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", matchData.host_id)
          .single();
        
        if (hostError) throw hostError;
        setHostProfile(hostData);
        
        // Get opponent profile if exists
        if (matchData.opponent_id) {
          const { data: opponentData, error: opponentError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", matchData.opponent_id)
            .single();
          
          if (!opponentError) {
            setOpponentProfile(opponentData);
          }
        }
        
        // Get current user's session and wallet
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: walletData } = await supabase
            .from("wallets")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          
          setCurrentUserWallet(walletData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching match details:", error);
        toast({
          title: "Error",
          description: "Failed to load match details. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId, toast]);
  
  const handleJoinMatch = async () => {
    try {
      setIsJoining(true);
      
      // Check user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join this match",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      const userId = session.user.id;
      
      // Check user has enough balance
      if (!currentUserWallet || currentUserWallet.balance < match.bet_amount) {
        toast({
          title: "Insufficient Funds",
          description: "Please add funds to your wallet to join this match",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      // Check user is not the host
      if (userId === match.host_id) {
        toast({
          title: "Cannot Join Own Match",
          description: "You cannot join a match you created",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      // Check match is still available
      if (match.status !== "pending" || match.opponent_id) {
        toast({
          title: "Match Unavailable",
          description: "This match is no longer available to join",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }
      
      // Deduct the bet amount from the user's wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: currentUserWallet.balance - match.bet_amount,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUserWallet.id);
      
      if (walletError) throw walletError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: currentUserWallet.id,
          amount: -match.bet_amount,
          type: "bet",
          status: "completed",
          description: `Bet placed on match ${matchId}`
        });
      
      if (transactionError) throw transactionError;
      
      // Update the match with the opponent
      const { error: matchError } = await supabase
        .from("matches")
        .update({ 
          opponent_id: userId,
          status: "in_progress",
          start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", matchId);
      
      if (matchError) throw matchError;
      
      // Reload the match data
      const { data: updatedMatch, error: refreshError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();
      
      if (refreshError) throw refreshError;
      setMatch(updatedMatch);
      
      // Get updated opponent profile
      const { data: opponentData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      setOpponentProfile(opponentData);
      
      // Get updated wallet
      const { data: updatedWallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", currentUserWallet.id)
        .single();
      
      setCurrentUserWallet(updatedWallet);
      
      toast({
        title: "Match Joined!",
        description: "You have successfully joined this match. Good luck!",
      });
    } catch (error) {
      console.error("Error joining match:", error);
      toast({
        title: "Error",
        description: "Failed to join match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-tacktix-blue" />
            <span className="ml-2 text-lg">Loading match details...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!match) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
            <p className="text-gray-400 mb-6">The match you're looking for doesn't exist or has been removed.</p>
            <Button variant="gradient" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Determine match status display
  const getStatusDisplay = () => {
    switch (match.status) {
      case "pending":
        return (
          <div className="bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
            Waiting for opponent
          </div>
        );
      case "in_progress":
        return (
          <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            In Progress
          </div>
        );
      case "completed":
        return (
          <div className="bg-tacktix-blue/20 text-tacktix-blue px-3 py-1 rounded-full text-sm font-medium">
            Completed
          </div>
        );
      case "disputed":
        return (
          <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm font-medium">
            Disputed
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-gray-600/20 text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
            Cancelled
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="glass-card rounded-xl p-6 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Match Details</h1>
            {getStatusDisplay()}
          </div>
          
          {/* Match Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Game Mode</h3>
                <div className="flex items-center">
                  <Trophy className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">{match.game_mode}</span>
                </div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Map</h3>
                <div className="flex items-center">
                  <Map className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">{match.map_name}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Bet Amount</h3>
                <div className="text-tacktix-blue font-bold text-xl">₦{match.bet_amount.toFixed(2)}</div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Potential Winnings</h3>
                <div className="text-green-500 font-bold text-xl">₦{(match.bet_amount * 2).toFixed(2)}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Lobby Code</h3>
                <div className="font-mono bg-tacktix-dark p-2 rounded border border-tacktix-blue/30 text-white">
                  {match.lobby_code}
                </div>
              </div>
              
              <div className="bg-tacktix-dark-light rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">
                  {match.completion_deadline ? "Time Remaining" : "Created On"}
                </h3>
                <div className="flex items-center">
                  <Clock className="text-tacktix-blue mr-2 h-5 w-5" />
                  <span className="text-white font-medium">
                    {match.completion_deadline 
                      ? formatTimeRemaining(match.completion_deadline)
                      : new Date(match.created_at).toLocaleString()
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Players */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Players</h2>
            
            <div className="bg-tacktix-dark-light rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Host Player */}
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-tacktix-dark">
                  <div className="h-20 w-20 rounded-full bg-tacktix-blue/20 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-tacktix-blue" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{hostProfile?.username || "Unknown"}</h3>
                  <p className="text-gray-400 text-sm mb-4">Host Player</p>
                  {match.winner_id === hostProfile?.id && (
                    <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      Winner
                    </div>
                  )}
                </div>
                
                {/* VS Divider */}
                <div className="hidden md:flex items-center justify-center -mx-4">
                  <div className="bg-tacktix-blue/30 w-0.5 h-full"></div>
                </div>
                
                {/* Opponent Player or Join Button */}
                {opponentProfile ? (
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-tacktix-dark">
                    <div className="h-20 w-20 rounded-full bg-tacktix-blue/20 flex items-center justify-center mb-4">
                      <User className="h-10 w-10 text-tacktix-blue" />
                    </div>
                    <h3 className="text-white font-bold text-lg">{opponentProfile.username}</h3>
                    <p className="text-gray-400 text-sm mb-4">Challenger</p>
                    {match.winner_id === opponentProfile.id && (
                      <div className="bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                        Winner
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-tacktix-dark border-2 border-dashed border-gray-700">
                    {match.status === "pending" ? (
                      <>
                        <p className="text-gray-400 mb-4">This match is waiting for an opponent to join</p>
                        <Button 
                          variant="gradient" 
                          onClick={handleJoinMatch} 
                          disabled={isJoining}
                          className="w-full max-w-xs"
                        >
                          {isJoining ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            "Join This Match"
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          {currentUserWallet ? (
                            <>Balance: ₦{currentUserWallet.balance.toFixed(2)}</>
                          ) : (
                            <>Sign in to join</>
                          )}
                        </p>
                      </>
                    ) : (
                      <div className="text-center">
                        <X className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                        <p className="text-gray-400">No opponent joined this match</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Match Status & Actions */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold mb-2">Match Status</h2>
                <div className="flex items-center">
                  {match.status === "completed" ? (
                    <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                  ) : match.status === "disputed" ? (
                    <ShieldAlert className="text-red-500 mr-2 h-5 w-5" />
                  ) : (
                    <Clock className="text-tacktix-blue mr-2 h-5 w-5" />
                  )}
                  <span className="capitalize">{match.status.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
                
                {match.status === "in_progress" && (
                  <Button variant="gradient">
                    Submit Result
                  </Button>
                )}
                
                {match.status === "disputed" && (
                  <Button variant="gradient" animation="pulseglow">
                    View Dispute
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeatureMatchDetails;
