
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerRatingProps {
  playerName: string;
  playerId: string;
  matchId: string;
  playerAvatar?: string;
  onRatingComplete: () => void;
}

const PlayerRating = ({
  playerName,
  playerId,
  matchId,
  playerAvatar,
  onRatingComplete
}: PlayerRatingProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be signed in to rate a player");
      }
      
      // Submit rating
      const { error } = await supabase
        .from("user_ratings")
        .insert({
          rater_id: session.user.id,
          rated_id: playerId,
          match_id: matchId,
          rating: rating,
          comment: comment.trim() || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Rating Submitted",
        description: "Thank you for rating your opponent",
      });
      
      // Inform parent component that rating is complete
      onRatingComplete();
      
    } catch (error: any) {
      toast({
        title: "Failed to Submit Rating",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderStar = (position: number) => {
    const filled = (hoverRating || rating) >= position;
    
    return (
      <Star
        key={position}
        size={32}
        className={`cursor-pointer transition-colors ${
          filled ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
        }`}
        onClick={() => setRating(position)}
        onMouseEnter={() => setHoverRating(position)}
        onMouseLeave={() => setHoverRating(0)}
      />
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-full bg-tacktix-dark-light flex items-center justify-center overflow-hidden">
          {playerAvatar ? (
            <img src={playerAvatar} alt={playerName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-medium">{playerName.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium">{playerName}</h3>
          <p className="text-sm text-gray-400">Your opponent</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">How would you rate this player?</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(position => renderStar(position))}
        </div>
        <p className="text-sm text-gray-500">
          {rating === 1 && "Poor experience"}
          {rating === 2 && "Below average"}
          {rating === 3 && "Average"}
          {rating === 4 && "Good experience"}
          {rating === 5 && "Excellent player"}
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Additional feedback (optional)</label>
        <Textarea
          placeholder="Share your experience with this player..."
          className="bg-tacktix-dark-light resize-none"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>
      
      <Button
        className="w-full"
        onClick={handleRatingSubmit}
        disabled={rating === 0 || submitting}
      >
        {submitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit Rating"
        )}
      </Button>
    </div>
  );
};

export default PlayerRating;
