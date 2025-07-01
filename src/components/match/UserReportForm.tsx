
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserReportFormProps {
  matchId: string;
  reportedUserId: string;
  reportedUsername: string;
  currentUserId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserReportForm = ({
  matchId,
  reportedUserId,
  reportedUsername,
  currentUserId,
  onSuccess,
  onCancel
}: UserReportFormProps) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    { value: "cheating", label: "Cheating/Hacking" },
    { value: "toxic_behavior", label: "Toxic Behavior" },
    { value: "harassment", label: "Harassment" },
    { value: "poor_sportsmanship", label: "Poor Sportsmanship" },
    { value: "other", label: "Other" }
  ];
  
  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for reporting",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide details about the incident",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("user_reports")
        .insert({
          match_id: matchId,
          reporter_id: currentUserId,
          reported_user_id: reportedUserId,
          reason,
          description: description.trim()
        });
        
      if (error) throw error;
      
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted and will be reviewed by our team",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-500" />
          Report {reportedUsername}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Reason for Report</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {reportReasons.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Please provide specific details about what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {description.length}/500 characters
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason || !description.trim()}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserReportForm;
