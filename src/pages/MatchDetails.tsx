import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PlayerRating from "@/components/match/PlayerRating";
import MatchEvidence from "@/components/match/MatchEvidence";
import { supabase } from "@/integrations/supabase/client";
import { 
  Swords, Trophy, Clock, Flag, ClipboardCheck, User, Info, 
  AlertTriangle, ArrowRight, CheckCircle, XCircle, 
  Copy, ThumbsUp, MessageSquare, Shield, Loader2, CreditCard
} from "lucide-react";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchMatchDetails();
      checkCurrentUser();
    }
  }, [id]);
  
  const checkCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (!error) {
        setCurrentUser(data);
      }
    }
  };
  
  const fetchMatchDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch match with properly hinted columns for host and opponent
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          host:profiles!matches_host_id_fkey(id, username, avatar_url),
          opponent:profiles!matches_opponent_id_fkey(id, username, avatar_url)
        `)
        .eq("id", id)
        .single();
      
      if (matchError) throw matchError;
      
      setMatch(matchData);
      
      // Check if current user has rated the opponent
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: ratingData } = await supabase
          .from("user_ratings")
          .select("*")
          .eq("match_id", id)
          .eq("rater_id", session.user.id)
          .single();
        
        setHasRated(!!ratingData);
      }
      
    } catch (error) {
      console.error("Error fetching match details:", error);
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
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to join a match",
        variant: "destructive",
      });
      navigate("/sign-in");
      return;
    }
    
    setIsJoining(true);
    try {
      // Get user wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();
      
      if (walletError) throw walletError;
      
      // Check if user has enough funds
      if (walletData.balance < match.bet_amount) {
        throw new Error("Insufficient funds in your wallet");
      }
      
      // Update match with opponent
      const { error: matchError } = await supabase
        .from("matches")
        .update({ 
          opponent_id: currentUser.id,
          status: "active",
          start_time: new Date().toISOString()
        })
        .eq("id", id);
      
      if (matchError) throw matchError;
      
      // Deduct bet amount from user wallet
      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ 
          balance: walletData.balance - match.bet_amount 
        })
        .eq("id", walletData.id);
      
      if (walletUpdateError) throw walletUpdateError;
      
      // Add transaction record
      await supabase
        .from("transactions")
        .insert({
          wallet_id: walletData.id,
          amount: match.bet_amount,
          transaction_type: "match_join",
          type: "bet", // Adding the required type field
          status: "completed",
          details: JSON.stringify({ match_id: id })
        });
      
      toast({
        title: "Match Joined",
        description: "You have successfully joined the match",
      });
      
      // Reload match details
      fetchMatchDetails();
      
    } catch (error: any) {
      toast({
        title: "Failed to Join",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleReportMatch = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to report a match",
        variant: "destructive",
      });
      return;
    }
    
    if (!reportReason.trim()) {
      toast({
        title: "Report Failed",
        description: "Please provide a reason for your report",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingReport(true);
    try {
      // Determine who to report
      const reportedId = currentUser.id === match.host.id 
        ? match.opponent.id 
        : match.host.id;
      
      // Create dispute
      const { error: disputeError } = await supabase
        .from("disputes")
        .insert({
          match_id: id,
          reported_by: currentUser.id,
          reason: reportReason,
        });
      
      if (disputeError) throw disputeError;
      
      toast({
        title: "Report Submitted",
        description: "Your report has been sent to moderators for review",
      });
      
      setIsReportDialogOpen(false);
      setReportReason("");
      
    } catch (error: any) {
      toast({
        title: "Report Failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };
  
  const handleSubmitResult = async (isWin: boolean) => {
    if (!currentUser) return;
    
    setIsSubmittingResult(true);
    try {
      // Update match with winner
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          winner_id: isWin ? currentUser.id : null,
          status: "completed"
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      // If marked as win, process the payout
      if (isWin) {
        const { error: rpcError } = await supabase.rpc(
          "process_match_outcome",
          {
            match_id: id,
            winner_id: currentUser.id
          }
        );
        
        if (rpcError) throw rpcError;
      }
      
      toast({
        title: "Result Submitted",
        description: "Match result has been updated",
      });
      
      // Refresh match details
      fetchMatchDetails();
      
    } catch (error: any) {
      toast({
        title: "Failed to Submit Result",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingResult(false);
    }
  };
  
  const copyLobbyCode = () => {
    navigator.clipboard.writeText(match?.lobby_code || "");
    toast({
      title: "Copied!",
      description: "Lobby code copied to clipboard",
    });
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Clock className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Loading match details...</h2>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!match) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Match Not Found</h2>
            <p className="text-gray-400 mt-2">The match you're looking for doesn't exist or has been removed</p>
            <Button className="mt-6" onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isHost = currentUser?.id === match.host.id;
  const isOpponent = currentUser?.id === match.opponent?.id;
  const isParticipant = isHost || isOpponent;
  const isActiveMatch = match.status === "active";
  const isPendingMatch = match.status === "pending";
  const isCompletedMatch = match.status === "completed";
  const canJoin = isPendingMatch && !isHost && !isOpponent;
  const canSubmitResult = isActiveMatch && isParticipant;
  const canReport = isActiveMatch && isParticipant;
  const canRateOpponent = isCompletedMatch && isParticipant && !hasRated;
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Match Details</h1>
            <p className="text-gray-400">View all information about this match</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {canJoin && (
              <Button 
                onClick={handleJoinMatch}
                disabled={isJoining}
                className="gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Swords className="h-4 w-4" />
                    Join Match
                  </>
                )}
              </Button>
            )}
            
            {canReport && (
              <Button 
                variant="outline" 
                onClick={() => setIsReportDialogOpen(true)}
                className="gap-2"
              >
                <Flag className="h-4 w-4" />
                Report Issue
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap justify-between gap-2 items-center">
                  <CardTitle className="flex items-center">
                    <Swords className="h-5 w-5 mr-2 text-tacktix-blue" />
                    {match.game_mode} on {match.map_name}
                  </CardTitle>
                  
                  <Badge variant={
                    isPendingMatch ? "outline" :
                    isActiveMatch ? "badge" :
                    match.winner_id ? "success" : "destructive"
                  }>
                    {isPendingMatch && "Waiting for Opponent"}
                    {isActiveMatch && "In Progress"}
                    {isCompletedMatch && match.winner_id ? "Completed" : "Cancelled"}
                  </Badge>
                </div>
                
                {match.is_vip_match && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <Shield className="h-3 w-3 mr-1" />
                    VIP Match
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  {/* Host */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={match.host.avatar_url} />
                      <AvatarFallback>{match.host.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{match.host.username}</p>
                      <p className="text-gray-400 text-sm">Host</p>
                    </div>
                    
                    {match.winner_id === match.host.id && (
                      <Badge variant="success" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Winner
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold mb-2">VS</div>
                    <Badge variant="outline" className="bg-tacktix-blue/10 text-tacktix-blue">
                      <CreditCard className="h-3 w-3 mr-1" />
                      ₦{match.bet_amount.toLocaleString()}
                    </Badge>
                  </div>
                  
                  {/* Opponent */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-3">
                    {match.opponent ? (
                      <>
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={match.opponent.avatar_url} />
                          <AvatarFallback>{match.opponent.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{match.opponent.username}</p>
                          <p className="text-gray-400 text-sm">Opponent</p>
                        </div>
                        
                        {match.winner_id === match.opponent.id && (
                          <Badge variant="success" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                          <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-500">Waiting...</p>
                          <p className="text-gray-400 text-sm">No opponent yet</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Info size={16} className="text-gray-400" />
                      Match Details
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match ID:</span>
                        <span>{match.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span>{new Date(match.created_at).toLocaleString()}</span>
                      </div>
                      {match.start_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Started:</span>
                          <span>{new Date(match.start_time).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant={isPendingMatch ? "outline" : isActiveMatch ? "badge" : "success"} className="text-xs">
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <ClipboardCheck size={16} className="text-gray-400" />
                      Lobby Information
                    </h3>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="text-gray-400 mb-1">Lobby Code:</div>
                        <div className="flex gap-2 items-center">
                          <code className="bg-tacktix-dark-deeper px-3 py-1.5 rounded flex-1 text-center">
                            {match.lobby_code}
                          </code>
                          <Button size="icon" variant="ghost" onClick={copyLobbyCode}>
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isActiveMatch && isParticipant && (
                  <>
                    <Separator />
                    
                    <div className="p-4 bg-tacktix-dark-light rounded-lg">
                      <h3 className="font-medium mb-3">Report Match Result</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="flex-1 gap-2" 
                          onClick={() => handleSubmitResult(true)}
                          disabled={isSubmittingResult}
                        >
                          {isSubmittingResult ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          I Won
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-2"
                          onClick={() => handleSubmitResult(false)}
                          disabled={isSubmittingResult}
                        >
                          {isSubmittingResult ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          I Lost / Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {isCompletedMatch && isParticipant && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                    Rate Your Opponent
                  </CardTitle>
                  <CardDescription>How was your experience with this player?</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasRated ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-medium">Thanks for your rating!</p>
                      <p className="text-gray-400">You've already rated your opponent for this match.</p>
                    </div>
                  ) : (
                    <PlayerRating 
                      playerName={isHost ? match.opponent.username : match.host.username}
                      playerId={isHost ? match.opponent.id : match.host.id}
                      matchId={match.id}
                      playerAvatar={isHost ? match.opponent.avatar_url : match.host.avatar_url}
                      onClose={() => setHasRated(true)}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-tacktix-blue" />
                  Match Evidence
                </CardTitle>
                <CardDescription>Upload screenshots as evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchEvidence 
                  matchId={match.id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Match Issue</DialogTitle>
            <DialogDescription>
              Describe the issue you're experiencing with this match
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason for Report</Label>
              <textarea
                id="report-reason"
                className="w-full min-h-[120px] p-3 rounded-md bg-tacktix-dark-deeper border border-tacktix-dark-light focus:border-tacktix-blue focus:ring-1 focus:ring-tacktix-blue outline-none"
                placeholder="Describe what happened..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
            
            <p className="text-sm text-gray-400">
              A moderator will review your report and take appropriate action. 
              Please provide as much detail as possible.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReportDialogOpen(false)}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReportMatch}
              disabled={isSubmittingReport || !reportReason.trim()}
            >
              {isSubmittingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MatchDetails;
