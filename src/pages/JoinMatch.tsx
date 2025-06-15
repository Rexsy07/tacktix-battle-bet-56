
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, DollarSign, Trophy, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getUserBalance, deductFromBalance } from "@/utils/wallet-utils";

interface Match {
  id: string;
  title: string;
  description: string;
  game_mode: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  status: string;
  scheduled_time: string;
  created_by: string;
  host_id: string;
  opponent_id: string | null;
  created_at: string;
  bet_amount: number;
  map_name: string;
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  total_earnings: number;
}

const JoinMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      checkAuth();
    }
  }, [matchId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      const balance = await getUserBalance(session.user.id);
      setUserBalance(balance);
    }
  };

  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error) throw error;

      setMatch(data);
    } catch (error) {
      console.error("Error fetching match:", error);
      toast({
        title: "Error",
        description: "Failed to load match details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!match || !currentUser) return;

    setIsJoining(true);
    try {
      console.log("=== STARTING JOIN MATCH PROCESS ===");
      console.log("Match ID:", match.id);
      console.log("Current user:", currentUser.id);
      console.log("Match details:", {
        id: match.id,
        status: match.status,
        opponent_id: match.opponent_id,
        host_id: match.host_id,
        bet_amount: match.bet_amount
      });
      console.log("User balance:", userBalance);

      // Check if user has sufficient balance
      if (userBalance < match.bet_amount) {
        console.log("❌ Insufficient balance");
        toast({
          title: "Insufficient Balance",
          description: "Please deposit funds to join this match",
          variant: "destructive",
        });
        navigate("/wallet");
        return;
      }

      // Check if user is not the host
      if (match.host_id === currentUser.id) {
        console.log("❌ User is the host");
        toast({
          title: "Cannot Join Own Match",
          description: "You cannot join a match you created",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Basic validation checks passed");

      // Simplified update without complex WHERE conditions
      console.log("🚀 Attempting to update match with opponent...");
      
      const updateData = {
        opponent_id: currentUser.id,
        status: 'active',
        current_players: 2,
        start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("📝 Update data:", updateData);

      // Simple update with just the match ID - let the database handle concurrency
      const { data: updatedMatches, error: matchError } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", match.id)
        .select();

      console.log("🔄 Database update response:");
      console.log("  - Updated matches data:", updatedMatches);
      console.log("  - Error:", matchError);

      if (matchError) {
        console.error("❌ Match update failed:", matchError);
        throw new Error(`Failed to join match: ${matchError.message}`);
      }

      if (!updatedMatches || updatedMatches.length === 0) {
        console.error("❌ No match was updated");
        toast({
          title: "Failed to Join",
          description: "Could not update the match. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const updatedMatch = updatedMatches[0];
      console.log("✅ Match updated successfully:", updatedMatch);

      // Deduct bet amount from user's balance
      console.log("💰 Deducting balance...");
      const { success: deductSuccess, error: deductError } = await deductFromBalance(
        currentUser.id,
        match.bet_amount
      );

      if (!deductSuccess) {
        console.error("❌ Balance deduction failed:", deductError);
        // Try to rollback the match update
        console.log("🔄 Attempting to rollback match update...");
        await supabase
          .from("matches")
          .update({
            opponent_id: null,
            status: 'pending',
            current_players: 1,
            start_time: null
          })
          .eq("id", match.id);
        
        throw new Error(deductError || "Failed to deduct bet amount");
      }

      console.log("✅ Balance deducted successfully");

      // Create transaction record
      console.log("📝 Creating transaction record...");
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: currentUser.id,
          type: "bet",
          amount: match.bet_amount,
          status: "completed",
          description: `Bet placed on match: ${match.title}`,
          match_id: match.id
        });

      if (transactionError) {
        console.error("⚠️ Transaction error (non-critical):", transactionError);
        // Don't throw here, just log - the match join was successful
      } else {
        console.log("✅ Transaction created successfully");
      }

      console.log("🎉 JOIN PROCESS COMPLETED SUCCESSFULLY");

      toast({
        title: "Successfully Joined!",
        description: "You have joined the match. Good luck!",
      });

      // Navigate to featured match details
      navigate(`/featured-match/${match.id}`);

    } catch (error: any) {
      console.error("💥 CRITICAL ERROR in join process:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast({
        title: "Failed to Join",
        description: error.message || "There was an error joining the match",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
          <p className="text-gray-400 mb-6">The match you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/matchmaking")}>
            Browse Matches
          </Button>
        </div>
      </Layout>
    );
  }

  const canJoin = match.status === 'pending' && !match.opponent_id && userBalance >= match.bet_amount && currentUser;
  const isUserHost = currentUser && match.host_id === currentUser.id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{match.title}</h1>
          <p className="text-gray-400">{match.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Match Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Game Mode</span>
                  <Badge variant="outline">{match.game_mode}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Map</span>
                  <span className="font-medium">{match.map_name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bet Amount</span>
                  <span className="font-medium">₦{match.bet_amount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-medium text-green-500">₦{match.prize_pool.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="font-medium">{match.current_players}/{match.max_players}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge variant={match.status === 'pending' ? 'default' : 'secondary'}>
                    {match.status}
                  </Badge>
                </div>
                
                {match.scheduled_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Scheduled</span>
                    <span className="font-medium">
                      {new Date(match.scheduled_time).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Join Match Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-tacktix-blue">
                  ₦{userBalance.toLocaleString()}
                </div>
                <p className="text-sm text-gray-400 mt-1">Available funds</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {!currentUser && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Please sign in to join</span>
                    </div>
                  </div>
                )}

                {!canJoin && currentUser && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {userBalance < match.bet_amount 
                          ? "Insufficient balance"
                          : match.opponent_id
                          ? "Match is full"
                          : "Match not available"
                        }
                      </span>
                    </div>
                  </div>
                )}

                {isUserHost ? (
                  <Button className="w-full" disabled>
                    You are the host
                  </Button>
                ) : match.opponent_id ? (
                  <Button className="w-full" disabled>
                    Match is full
                  </Button>
                ) : !currentUser ? (
                  <Button
                    className="w-full"
                    onClick={() => navigate("/sign-in")}
                  >
                    Sign In to Join
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoinMatch}
                    disabled={!canJoin || isJoining}
                  >
                    {isJoining ? "Joining..." : `Join Match - ₦${match.bet_amount.toLocaleString()}`}
                  </Button>
                )}

                {currentUser && userBalance < match.bet_amount && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => navigate("/wallet")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinMatch;
