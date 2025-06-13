
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
  created_at: string;
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

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      fetchParticipants();
      fetchUserBalance();
    }
  }, [matchId]);

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
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("match_participants")
        .select(`
          user_id,
          profiles!inner(id, username, avatar_url, total_earnings)
        `)
        .eq("match_id", matchId);

      if (error) throw error;

      const participantProfiles = data?.map((p: any) => p.profiles) || [];
      setParticipants(participantProfiles);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Calculate balance from transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("user_id", session.user.id)
        .eq("status", "completed");

      if (error) throw error;

      let balance = 0;
      transactions?.forEach(tx => {
        if (tx.type === 'deposit' || tx.type === 'win' || tx.type === 'refund') {
          balance += tx.amount;
        } else {
          balance -= tx.amount;
        }
      });

      setUserBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!match) return;

    setIsJoining(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join matches",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }

      // Check if user has sufficient balance
      if (userBalance < match.entry_fee) {
        toast({
          title: "Insufficient Balance",
          description: "Please deposit funds to join this match",
          variant: "destructive",
        });
        navigate("/wallet");
        return;
      }

      // Check if match is still open and has space
      if (match.status !== 'open' || match.current_players >= match.max_players) {
        toast({
          title: "Match Unavailable",
          description: "This match is no longer available",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a participant
      const isAlreadyParticipant = participants.some(p => p.id === session.user.id);
      if (isAlreadyParticipant) {
        toast({
          title: "Already Joined",
          description: "You have already joined this match",
          variant: "destructive",
        });
        return;
      }

      // Join the match
      const { error: participantError } = await supabase
        .from("match_participants")
        .insert({
          match_id: match.id,
          user_id: session.user.id,
          status: 'joined'
        });

      if (participantError) throw participantError;

      // Create entry fee transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          type: "loss",
          amount: match.entry_fee,
          status: "completed",
          description: `Entry fee for match: ${match.title}`,
          match_id: match.id
        } as any);

      if (transactionError) throw transactionError;

      // Update match current players count
      const { error: updateError } = await supabase
        .from("matches")
        .update({ 
          current_players: match.current_players + 1,
          status: match.current_players + 1 >= match.max_players ? 'full' : 'open'
        })
        .eq("id", match.id);

      if (updateError) throw updateError;

      toast({
        title: "Successfully Joined!",
        description: "You have joined the match. Good luck!",
      });

      // Refresh data
      await Promise.all([fetchMatchDetails(), fetchParticipants(), fetchUserBalance()]);

    } catch (error) {
      console.error("Error joining match:", error);
      toast({
        title: "Failed to Join",
        description: "There was an error joining the match",
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

  const canJoin = match.status === 'open' && match.current_players < match.max_players && userBalance >= match.entry_fee;
  const isUserParticipant = participants.some(p => p.id);

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
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="font-medium">₦{match.entry_fee.toLocaleString()}</span>
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
                  <Badge variant={match.status === 'open' ? 'default' : 'secondary'}>
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

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <Avatar>
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback>{participant.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{participant.username}</p>
                          <p className="text-sm text-gray-400">
                            Earnings: ₦{participant.total_earnings?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No participants yet. Be the first to join!
                  </p>
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
                {!canJoin && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {userBalance < match.entry_fee 
                          ? "Insufficient balance"
                          : match.current_players >= match.max_players
                          ? "Match is full"
                          : "Match not available"
                        }
                      </span>
                    </div>
                  </div>
                )}

                {isUserParticipant ? (
                  <Button className="w-full" disabled>
                    Already Joined
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoinMatch}
                    disabled={!canJoin || isJoining}
                  >
                    {isJoining ? "Joining..." : `Join Match - ₦${match.entry_fee.toLocaleString()}`}
                  </Button>
                )}

                {userBalance < match.entry_fee && (
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
