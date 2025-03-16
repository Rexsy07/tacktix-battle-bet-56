
import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerRating from "@/components/match/PlayerRating";
import MatchEvidence from "@/components/match/MatchEvidence";
import { supabase } from "@/integrations/supabase/client";
import { getMatchStatusVariant, getStatusText } from "@/utils/matchmaking-helpers";
import { 
  Swords, Trophy, Clock, Flag, ClipboardCheck, User, Info, 
  AlertTriangle, ArrowRight, CheckCircle, XCircle, 
  Copy, ThumbsUp, MessageSquare, Shield, Loader2, CreditCard,
  Play, FileCheck, Upload
} from "lucide-react";

const MatchDetails = () => {
  const { matchId } = useParams<{ matchId: string }>();
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
  const [isStartingMatch, setIsStartingMatch] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [proofNotes, setProofNotes] = useState("");
  const [resultType, setResultType] = useState<"win" | "loss" | "draw" | "dispute">("win");
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      checkCurrentUser();
    }
  }, [matchId]);
  
  const checkCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (!error) {
          setCurrentUser(data);
        } else {
          console.error("Error fetching profile:", error);
        }
      }
    } catch (error) {
      console.error("Error checking current user:", error);
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
        .eq("id", matchId)
        .single();
      
      if (matchError) {
        console.error("Error fetching match:", matchError);
        throw matchError;
      }
      
      setMatch(matchData);
      
      // Check if match has results
      setIsLoadingResult(true);
      const { data: resultData, error: resultError } = await supabase
        .from("match_results")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false })
        .limit(1);
        
      if (!resultError && resultData && resultData.length > 0) {
        setMatchResult(resultData[0]);
      }
      setIsLoadingResult(false);
      
      // Check if current user has rated the opponent
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: ratingData } = await supabase
          .from("user_ratings")
          .select("*")
          .eq("match_id", matchId)
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
          status: "in_progress",
          start_time: new Date().toISOString()
        })
        .eq("id", matchId);
      
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
          amount: -match.bet_amount,
          type: "bet",
          status: "completed",
          description: `Joined match ${matchId}`
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
  
  const handleStartMatch = async () => {
    if (!match || !currentUser) return;
    if (match.host.id !== currentUser.id) {
      toast({
        title: "Permission Denied",
        description: "Only the host can start the match",
        variant: "destructive"
      });
      return;
    }
    
    if (!match.opponent) {
      toast({
        title: "No Opponent",
        description: "You need an opponent to start the match",
        variant: "destructive"
      });
      return;
    }
    
    setIsStartingMatch(true);
    try {
      const { error } = await supabase
        .from("matches")
        .update({
          match_started: true,
          match_started_at: new Date().toISOString(),
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", matchId);
      
      if (error) throw error;
      
      toast({
        title: "Match Started",
        description: "The match has been started. Good luck!",
      });
      
      fetchMatchDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start match",
        variant: "destructive"
      });
    } finally {
      setIsStartingMatch(false);
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
        ? match.opponent?.id 
        : match.host.id;
      
      // Create dispute
      const { error: disputeError } = await supabase
        .from("disputes")
        .insert({
          match_id: matchId,
          reported_by: currentUser.id,
          reason: reportReason,
        });
      
      if (disputeError) throw disputeError;
      
      // Update match status
      await supabase
        .from("matches")
        .update({
          status: "disputed"
        })
        .eq("id", matchId);
      
      toast({
        title: "Report Submitted",
        description: "Your report has been sent to moderators for review",
      });
      
      setIsReportDialogOpen(false);
      setReportReason("");
      fetchMatchDetails();
      
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
          winner_id: isWin ? currentUser.id : match.opponent_id || match.host_id,
          status: "completed",
          result_submitted_by: currentUser.id,
          result_submitted_at: new Date().toISOString()
        })
        .eq("id", matchId);
      
      if (updateError) throw updateError;
      
      // If marked as win, process the payout
      if (isWin) {
        try {
          const { error: rpcError } = await supabase.rpc(
            "process_match_outcome",
            {
              match_id: matchId,
              winner_id: currentUser.id
            }
          );
          
          if (rpcError) throw rpcError;
        } catch (error) {
          console.error("Error processing match outcome:", error);
          // Continue execution even if RPC fails
        }
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
  
  const handleSubmitProof = async () => {
    if (!currentUser || !match) return;
    
    if (proofImages.length === 0) {
      toast({
        title: "Proof Required",
        description: "Please upload at least one screenshot as proof",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmittingProof(true);
    try {
      // Upload proof images to storage
      const proofUrls: string[] = [];
      for (const file of proofImages) {
        const fileName = `${matchId}/${currentUser.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("match-evidence")
          .upload(fileName, file);
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from("match-evidence")
          .getPublicUrl(fileName);
          
        proofUrls.push(publicUrl);
      }
      
      // Determine winner based on result type
      let winnerId = null;
      if (resultType === "win") {
        winnerId = currentUser.id;
      } else if (resultType === "loss") {
        winnerId = currentUser.id === match.host_id ? match.opponent_id : match.host_id;
      }
      
      // Create match result
      const { data: resultData, error: resultError } = await supabase
        .from("match_results")
        .insert({
          match_id: matchId,
          submitted_by: currentUser.id,
          winner_id: winnerId,
          result_type: resultType,
          proof_urls: proofUrls,
          notes: proofNotes
        })
        .select()
        .single();
        
      if (resultError) throw resultError;
      
      // Update match status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          result_submitted_by: currentUser.id,
          result_submitted_at: new Date().toISOString(),
          status: resultType === "dispute" ? "disputed" : "completed",
          winner_id: winnerId
        })
        .eq("id", matchId);
        
      if (matchError) throw matchError;
      
      // If winner is determined and not disputed, process payout
      if (winnerId && resultType !== "dispute") {
        try {
          const { error: rpcError } = await supabase.rpc(
            "process_match_outcome",
            {
              match_id: matchId,
              winner_id: winnerId
            }
          );
          
          if (rpcError) throw rpcError;
        } catch (error) {
          console.error("Error processing match outcome:", error);
          // Continue execution even if RPC fails
        }
      }
      
      toast({
        title: "Proof Submitted",
        description: "Your proof has been submitted for review",
      });
      
      setProofImages([]);
      setProofNotes("");
      setIsProofDialogOpen(false);
      fetchMatchDetails();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProof(false);
    }
  };
  
  const copyLobbyCode = () => {
    navigator.clipboard.writeText(match?.lobby_code || "");
    toast({
      title: "Copied!",
      description: "Lobby code copied to clipboard",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProofImages([...proofImages, ...filesArray]);
    }
  };
  
  const removeProofImage = (index: number) => {
    setProofImages(proofImages.filter((_, i) => i !== index));
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
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
            <Button className="mt-6" onClick={() => navigate("/matchmaking")}>Back to Matchmaking</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isHost = currentUser?.id === match.host.id;
  const isOpponent = currentUser?.id === match.opponent?.id;
  const isParticipant = isHost || isOpponent;
  const isActiveMatch = match.status === "active" || match.status === "in_progress";
  const isPendingMatch = match.status === "pending";
  const isCompletedMatch = match.status === "completed";
  const canJoin = isPendingMatch && !isHost && !isOpponent;
  const canSubmitResult = isActiveMatch && isParticipant;
  const canReport = isActiveMatch && isParticipant;
  const canRateOpponent = isCompletedMatch && isParticipant && !hasRated;
  const canStartMatch = isPendingMatch && isHost && match.opponent;
  
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
            
            {canStartMatch && (
              <Button 
                variant="gradient"
                onClick={handleStartMatch}
                disabled={isStartingMatch}
                className="gap-2"
              >
                {isStartingMatch ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Match
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
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-6">
            <TabsTrigger value="details">Match Details</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap justify-between gap-2 items-center">
                  <CardTitle className="flex items-center">
                    <Swords className="h-5 w-5 mr-2 text-tacktix-blue" />
                    {match.game_mode} on {match.map_name}
                  </CardTitle>
                  
                  <Badge variant={getMatchStatusVariant(match.status)}>
                    {getStatusText(match.status)}
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
                      <AvatarFallback>{match.host.username?.charAt(0) || 'H'}</AvatarFallback>
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
                          <AvatarFallback>{match.opponent.username?.charAt(0) || 'O'}</AvatarFallback>
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
                      {match.match_started_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Match Started:</span>
                          <span>{new Date(match.match_started_at).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant={getMatchStatusVariant(match.status)} className="text-xs">
                          {getStatusText(match.status)}
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
                
                {canSubmitResult && (
                  <>
                    <Separator />
                    
                    <div className="p-4 bg-tacktix-dark-light rounded-lg">
                      <h3 className="font-medium mb-3">Match Actions</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="flex-1 gap-2" 
                          onClick={() => setIsProofDialogOpen(true)}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Submit Match Proof
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-2"
                          onClick={() => setIsReportDialogOpen(true)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>View the outcome of this match</CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingResult ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : matchResult ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-tacktix-dark-light">
                      <h3 className="text-lg font-medium mb-4">
                        Match Result: {matchResult.result_type.charAt(0).toUpperCase() + matchResult.result_type.slice(1)}
                      </h3>
                      
                      {matchResult.winner_id && (
                        <div className="flex items-center mb-4">
                          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="font-medium">
                            Winner: {
                              matchResult.winner_id === match.host.id 
                                ? match.host.username 
                                : match.opponent?.username || "Unknown"
                            }
                          </span>
                        </div>
                      )}
                      
                      {matchResult.notes && (
                        <div className="mt-2 mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Notes:</h4>
                          <p className="text-sm bg-tacktix-dark p-3 rounded">{matchResult.notes}</p>
                        </div>
                      )}
                      
                      {matchResult.proof_urls && matchResult.proof_urls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Evidence:</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {matchResult.proof_urls.map((url: string, index: number) => (
                              <a 
                                key={index} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={url} 
                                  alt={`Match evidence ${index + 1}`} 
                                  className="rounded border border-gray-700 w-full object-cover h-24"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 text-xs text-gray-500">
                        Submitted by {
                          matchResult.submitted_by === match.host.id 
                            ? match.host.username 
                            : match.opponent?.username || "Unknown"
                        } on {new Date(matchResult.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    {match.result_verified && (
                      <div className="flex items-center p-3 rounded bg-green-900/20 border border-green-800/30">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>This result has been verified by a moderator</span>
                      </div>
                    )}
                  </div>
                ) : isActiveMatch ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-tacktix-blue/50 mb-3" />
                    <h3 className="text-xl font-medium">Match In Progress</h3>
                    <p className="text-gray-400 mt-1">
                      Results will be available once the match is completed.
                    </p>
                    
                    {isParticipant && (
                      <Button 
                        className="mt-4"
                        onClick={() => setIsProofDialogOpen(true)}
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        Submit Match Result
                      </Button>
                    )}
                  </div>
                ) : isPendingMatch ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-3" />
                    <h3 className="text-xl font-medium">Match Not Started</h3>
                    <p className="text-gray-400 mt-1">
                      The match hasn't started yet. Results will be available after completion.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <h3 className="text-xl font-medium">No Results Submitted</h3>
                    <p className="text-gray-400 mt-1">
                      No match results have been submitted yet.
                    </p>
                  </div>
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
                      playerName={isHost ? match.opponent?.username : match.host.username}
                      playerId={isHost ? match.opponent?.id : match.host.id}
                      matchId={match.id}
                      playerAvatar={isHost ? match.opponent?.avatar_url : match.host.avatar_url}
                      onRatingComplete={() => setHasRated(true)}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="evidence" className="space-y-6">
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
                  currentUserId={currentUser?.id}
                  matchStatus={match.status}
                />
                
                {canSubmitResult && (
                  <div className="mt-6 border-t border-gray-800 pt-4">
                    <Button 
                      onClick={() => setIsProofDialogOpen(true)}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Submit New Evidence
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
              <Textarea
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
      
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Submit Match Proof</DialogTitle>
            <DialogDescription>
              Upload screenshots and declare the result of your match
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="result-type">Match Result</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={resultType === "win" ? "default" : "outline"}
                  onClick={() => setResultType("win")}
                  className="w-full"
                >
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                  I Won
                </Button>
                <Button
                  type="button"
                  variant={resultType === "loss" ? "default" : "outline"}
                  onClick={() => setResultType("loss")}
                  className="w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  I Lost
                </Button>
                <Button
                  type="button"
                  variant={resultType === "draw" ? "default" : "outline"}
                  onClick={() => setResultType("draw")}
                  className="w-full"
                >
                  <Swords className="mr-2 h-4 w-4" />
                  Draw
                </Button>
                <Button
                  type="button"
                  variant={resultType === "dispute" ? "destructive" : "outline"}
                  onClick={() => setResultType("dispute")}
                  className="w-full"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Dispute
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="screenshot-upload">Upload Screenshots</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  <Upload className="mr-1 h-3 w-3" />
                  Add Images
                </Button>
              </div>
              
              <input
                type="file"
                id="screenshot-upload"
                className="hidden"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {proofImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {proofImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Proof ${index + 1}`}
                        className="h-20 w-full object-cover rounded border border-gray-700"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeProofImage(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center cursor-pointer hover:bg-tacktix-dark-light/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, or JPEG (Max 5MB each)
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proof-notes">Additional Notes</Label>
              <Textarea
                id="proof-notes"
                placeholder="Add any additional information about the match..."
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="bg-tacktix-dark-deeper border-tacktix-dark-light"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProofDialogOpen(false)}
              disabled={isSubmittingProof}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitProof}
              disabled={isSubmittingProof || proofImages.length === 0}
            >
              {isSubmittingProof ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Proof"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MatchDetails;
