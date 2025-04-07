
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CreditCard, Map, Trophy, Clock, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const JoinMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userWalletId, setUserWalletId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please sign in to join matches",
            variant: "destructive",
          });
          navigate("/sign-in");
          return;
        }
        
        setCurrentUser({
          id: session.user.id
        });

        // Fetch match details
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            host:profiles!matches_host_id_fkey(id, username, avatar_url),
            opponent:profiles!matches_opponent_id_fkey(id, username, avatar_url)
          `)
          .eq("id", id)
          .single();

        if (matchError) {
          console.error("Match fetch error:", matchError);
          throw new Error("Could not find match details");
        }
        
        if (!matchData) {
          toast({
            title: "Match not found",
            description: "The match you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate("/matchmaking");
          return;
        }
        
        setMatchDetails(matchData);
        
        // Fetch user's wallet balance and wallet ID
        const { data: walletData, error: walletError } = await supabase
          .from("wallets")
          .select("id, balance")
          .eq("user_id", session.user.id)
          .single();
          
        if (walletError) {
          console.error("Wallet fetch error:", walletError);
          throw new Error("Could not fetch wallet balance");
        }
        
        setWalletBalance(walletData?.balance || 0);
        setUserWalletId(walletData?.id || null);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load match details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate, toast]);
  
  const handleJoinMatch = async () => {
    try {
      setJoining(true);
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please sign in to join matches",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }

      if (!userWalletId) {
        toast({
          title: "Wallet not found",
          description: "Your wallet could not be found",
          variant: "destructive",
        });
        return;
      }
      
      // Check if match is already full
      if (matchDetails.opponent_id) {
        toast({
          title: "Match is full",
          description: "This match already has an opponent",
          variant: "destructive",
        });
        return;
      }
      
      // Verify lobby code if entered
      if (lobbyCodeInput && lobbyCodeInput !== matchDetails.lobby_code) {
        toast({
          title: "Invalid Lobby Code",
          description: "The lobby code you entered is incorrect",
          variant: "destructive",
        });
        return;
      }
      
      // Check if user has enough balance
      if (walletBalance < matchDetails.bet_amount) {
        toast({
          title: "Insufficient funds",
          description: "You don't have enough funds to join this match",
          variant: "destructive",
        });
        navigate("/wallet");
        return;
      }

      console.log("Joining match with wallet ID:", userWalletId);
      
      // First deduct the bet amount from player's wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: walletBalance - matchDetails.bet_amount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", currentUser.id);
        
      if (walletError) {
        console.error("Wallet update error:", walletError);
        throw walletError;
      }
      
      // Create transaction record for the bet
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: userWalletId,
          amount: matchDetails.bet_amount,
          type: "bet",
          status: "completed",
          description: `Bet placed on match ${id}`,
          // Add required fields that might be missing
          transaction_type: "bet",
          payment_method: "wallet"
        });
      
      if (transactionError) {
        console.error("Transaction insert error:", transactionError);
        throw transactionError;
      }
      
      // Join match
      const { error: joinError } = await supabase
        .from("matches")
        .update({ 
          opponent_id: currentUser.id,
          status: "waiting",
          start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (joinError) {
        console.error("Match join error:", joinError);
        throw joinError;
      }
      
      toast({
        title: "Match joined successfully",
        description: "You have successfully joined the match",
      });
      
      navigate(`/match/${id}`);
    } catch (error: any) {
      console.error("Error joining match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join match",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-tacktix-blue" />
            <p className="text-lg">Loading match details...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isMatchHost = currentUser?.id === matchDetails?.host?.id;
  
  return (
    <Layout>
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Join Match</h1>
          <p className="text-gray-400">Review the match details before joining</p>
        </div>
        
        {matchDetails && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    {matchDetails.game_mode}
                    <Badge variant="outline" className="ml-3 bg-tacktix-blue/10">
                      {matchDetails.bet_amount && `₦${Number(matchDetails.bet_amount).toLocaleString()}`}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Hosted by {matchDetails.host?.username || "Unknown"}
                  </CardDescription>
                </div>
                <Badge variant="badge" size="sm">
                  {matchDetails.status === "pending" ? "Open to Join" : matchDetails.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-tacktix-dark-light p-4 rounded-lg flex items-center">
                  <Map className="text-tacktix-blue mr-3" size={24} />
                  <div>
                    <div className="text-sm text-gray-400">Map</div>
                    <div className="font-medium">{matchDetails.map_name}</div>
                  </div>
                </div>
                
                <div className="bg-tacktix-dark-light p-4 rounded-lg flex items-center">
                  <Trophy className="text-tacktix-blue mr-3" size={24} />
                  <div>
                    <div className="text-sm text-gray-400">Prize Pool</div>
                    <div className="font-medium">
                      ₦{(Number(matchDetails.bet_amount) * 2).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="bg-tacktix-dark-light p-4 rounded-lg flex items-center">
                  <Clock className="text-tacktix-blue mr-3" size={24} />
                  <div>
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="font-medium">
                      {new Date(matchDetails.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-b border-white/10 py-4">
                <h3 className="text-lg font-medium mb-4">Players</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={matchDetails.host?.avatar_url} />
                    <AvatarFallback className="bg-tacktix-blue text-white">
                      {matchDetails.host?.username?.charAt(0).toUpperCase() || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{matchDetails.host?.username || "Unknown"}</div>
                    <div className="text-sm text-gray-400">Host</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-4 mb-2">
                  <div className="text-center px-6 py-2 bg-tacktix-dark-light rounded-full text-sm">
                    VS
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {matchDetails.opponent ? (
                    <>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={matchDetails.opponent?.avatar_url} />
                        <AvatarFallback className="bg-tacktix-green text-white">
                          {matchDetails.opponent?.username?.charAt(0).toUpperCase() || "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{matchDetails.opponent?.username}</div>
                        <div className="text-sm text-gray-400">Opponent</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-tacktix-dark-light text-gray-300">
                          <Users size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Waiting for opponent</div>
                        <div className="text-sm text-tacktix-blue">This could be you!</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {isMatchHost && (
                <div className="bg-tacktix-dark-light p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Manage Lobby</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Lobby Code</label>
                      <div className="flex gap-2">
                        <Input 
                          value={matchDetails.lobby_code} 
                          readOnly 
                          className="bg-tacktix-dark-deeper"
                        />
                        <Button
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            navigator.clipboard.writeText(matchDetails.lobby_code);
                            toast({
                              title: "Copied!",
                              description: "Lobby code copied to clipboard",
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Share this code with your opponent</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Match Instructions</label>
                      <Textarea 
                        className="bg-tacktix-dark-deeper resize-none h-24"
                        placeholder="Provide any additional instructions for your opponent..."
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {!isMatchHost && !matchDetails.opponent && (
                <div className="bg-tacktix-dark-light p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Join Match</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Enter Lobby Code</label>
                    <Input 
                      value={lobbyCodeInput} 
                      onChange={(e) => setLobbyCodeInput(e.target.value)}
                      placeholder="Enter the lobby code provided by the host" 
                      className="bg-tacktix-dark-deeper"
                    />
                    <p className="text-xs text-gray-400 mt-1">The lobby code is required to join this match</p>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-tacktix-dark-light rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-tacktix-blue mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Important Information</p>
                    <p className="text-sm text-gray-400">
                      By joining this match, you agree to bet ₦{Number(matchDetails.bet_amount).toLocaleString()} which will be locked until the match is completed. 
                      You must follow all platform rules and provide valid evidence of match results.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center text-sm">
                <CreditCard size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-400">Your Balance:</span>
                <span className="ml-2 font-medium">
                  ₦{walletBalance.toLocaleString()}
                </span>
                {walletBalance < (matchDetails.bet_amount || 0) && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Insufficient
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => navigate("/matchmaking")}>
                  Back
                </Button>
                
                {!isMatchHost && !matchDetails.opponent && (
                  <Button 
                    variant="gradient" 
                    onClick={handleJoinMatch}
                    disabled={joining || walletBalance < (matchDetails.bet_amount || 0)}
                  >
                    {joining ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Joining...
                      </>
                    ) : (
                      `Join for ₦${(matchDetails.bet_amount || 0).toLocaleString()}`
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default JoinMatch;
