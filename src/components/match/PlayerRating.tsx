
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, User, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface PlayerRatingProps {
  playerName: string;
  playerId: string;
  matchId: string;
  playerAvatar?: string;
  onClose?: () => void;
}

const PlayerRating = ({ playerName, playerId, matchId, playerAvatar, onClose }: PlayerRatingProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be signed in to rate players",
          variant: "destructive",
        });
        return;
      }
      
      // Add rating to database
      const { error } = await supabase
        .from("user_ratings")
        .insert({
          rater_id: session.user.id,
          rated_id: playerId,
          match_id: matchId,
          rating: rating === "positive" ? 1 : -1,
          comment: feedback || null
        });
        
      if (error) throw error;
      
      toast({
        title: "Rating Submitted",
        description: "Thank you for rating your opponent!",
        variant: "default",
      });
      
      onClose?.();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast({
        title: "Report Reason Required",
        description: "Please provide a reason for your report",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be signed in to report players",
          variant: "destructive",
        });
        return;
      }
      
      // Add dispute to database
      const { error } = await supabase
        .from("disputes")
        .insert({
          match_id: matchId,
          reported_by: session.user.id,
          reason: reportReason
        });
        
      if (error) throw error;
      
      toast({
        title: "Report Submitted",
        description: "Our moderators will review your report soon",
        variant: "default",
      });
      
      setIsReporting(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card border-white/10 max-w-md w-full mx-auto">
      {!isReporting ? (
        <>
          <CardHeader className="text-center">
            <CardTitle>Rate Your Opponent</CardTitle>
            <CardDescription>
              How was your experience playing against {playerName}?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={playerAvatar} />
                <AvatarFallback className="bg-tacktix-dark-light text-lg">
                  {playerName ? playerName[0].toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant={rating === "positive" ? "gradient" : "outline"} 
                size="lg"
                className="flex flex-col items-center p-4 h-auto gap-2"
                onClick={() => setRating("positive")}
              >
                <ThumbsUp size={24} />
                <span>Positive</span>
              </Button>
              
              <Button 
                variant={rating === "negative" ? "destructive" : "outline"} 
                size="lg"
                className="flex flex-col items-center p-4 h-auto gap-2"
                onClick={() => setRating("negative")}
              >
                <ThumbsDown size={24} />
                <span>Negative</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Feedback (Optional)</label>
              <Textarea 
                placeholder="Share your thoughts about this player..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-tacktix-dark-light resize-none"
                rows={3}
              />
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full text-tacktix-red flex items-center justify-center" 
              onClick={() => setIsReporting(true)}
            >
              <Flag size={16} className="mr-2" />
              Report this player
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between space-x-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Skip
            </Button>
            <Button 
              variant="gradient" 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-tacktix-red flex items-center justify-center">
              <ShieldAlert className="mr-2" /> Report Player
            </CardTitle>
            <CardDescription>
              Report inappropriate behavior by {playerName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Report</label>
              <Textarea 
                placeholder="Describe the issue in detail..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="bg-tacktix-dark-light resize-none"
                rows={5}
              />
              <p className="text-xs text-gray-400">
                Please provide specific details, including timestamps if applicable. 
                Our moderation team will review your report.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between space-x-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsReporting(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={handleReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default PlayerRating;
