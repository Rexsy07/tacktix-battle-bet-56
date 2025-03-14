
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Camera, Upload, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MatchEvidenceProps {
  matchId: string;
  matchStatus: "waiting" | "in-progress" | "completed" | "disputed";
}

const MatchEvidence = ({ matchId, matchStatus }: MatchEvidenceProps) => {
  const { toast } = useToast();
  const [preMatchStatus, setPreMatchStatus] = useState<"pending" | "uploaded" | "verified">("pending");
  const [postMatchStatus, setPostMatchStatus] = useState<"pending" | "uploaded" | "verified">("pending");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (type: "pre" | "post") => {
    try {
      setIsUploading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload evidence",
          variant: "destructive",
        });
        return;
      }
      
      // In a real app, you would open a file picker here
      // For now, we'll simulate file upload with a timeout
      
      toast({
        title: "Uploading...",
        description: `Uploading your ${type === "pre" ? "pre-match" : "post-match"} screenshot`,
      });
      
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake URL for the "uploaded" image
      const evidenceUrl = `https://example.com/evidence/${matchId}_${type}_${Date.now()}.jpg`;
      
      // Add evidence to database
      const { error } = await supabase
        .from("match_evidence")
        .insert({
          match_id: matchId,
          submitted_by: session.user.id,
          evidence_url: evidenceUrl,
          evidence_type: type === "pre" ? "pre_match" : "post_match"
        });
        
      if (error) throw error;
      
      // Update local state
      if (type === "pre") {
        setPreMatchStatus("uploaded");
      } else {
        setPostMatchStatus("uploaded");
      }
      
      toast({
        title: "Screenshot Uploaded",
        description: `Your ${type === "pre" ? "pre-match" : "post-match"} screenshot has been uploaded.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload screenshot",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleVerify = async (type: "pre" | "post") => {
    try {
      // In a real app, this would be handled by a moderator or automatically
      // For now, we'll simulate verification
      
      toast({
        title: "Verifying...",
        description: `Verifying your ${type === "pre" ? "pre-match" : "post-match"} screenshot`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type === "pre") {
        setPreMatchStatus("verified");
      } else {
        setPostMatchStatus("verified");
      }
      
      toast({
        title: "Screenshot Verified",
        description: `Your ${type === "pre" ? "pre-match" : "post-match"} screenshot has been verified.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify screenshot",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = (type: "pre" | "post") => {
    // In a real app, this would be handled by a moderator
    if (type === "pre") {
      setPreMatchStatus("pending");
    } else {
      setPostMatchStatus("pending");
    }
    
    toast({
      title: "Screenshot Rejected",
      description: `Your ${type === "pre" ? "pre-match" : "post-match"} screenshot was rejected. Please upload a valid screenshot.`,
      variant: "destructive",
    });
  };
  
  const renderUploadSection = (
    type: "pre" | "post", 
    status: "pending" | "uploaded" | "verified"
  ) => {
    const isDisabled = matchStatus === "waiting" && type === "post";
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white">{type === "pre" ? "Pre-Match Screenshot" : "Post-Match Screenshot"}</h3>
          {status === "pending" && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">Required</Badge>
          )}
          {status === "uploaded" && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400">Awaiting Verification</Badge>
          )}
          {status === "verified" && (
            <Badge variant="success">Verified</Badge>
          )}
        </div>
        
        {status === "pending" ? (
          <div className="border border-dashed border-white/10 rounded-lg p-4 text-center">
            <div className="flex flex-col items-center">
              <Camera size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-400 mb-4">
                {type === "pre" 
                  ? "Upload a screenshot of the match lobby with all players" 
                  : "Upload a screenshot of the final match results"}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={() => handleUpload(type)}
                disabled={isDisabled || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} className="mr-1" />
                    Upload Screenshot
                  </>
                )}
              </Button>
              {isDisabled && (
                <p className="text-xs text-gray-500 mt-2">
                  Available after match starts
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-tacktix-dark-light rounded-md flex items-center justify-center">
                  <Camera size={24} className="text-tacktix-blue" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {type === "pre" ? "lobby_screenshot.jpg" : "match_results.jpg"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Uploaded on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {status === "uploaded" ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                    onClick={() => handleVerify(type)}
                  >
                    <Check size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => handleReject(type)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <Check size={16} className="text-green-500" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Match Evidence</CardTitle>
        <CardDescription>
          Upload the required screenshots to validate your match
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderUploadSection("pre", preMatchStatus)}
        {renderUploadSection("post", postMatchStatus)}
        
        <div className="p-4 bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-md">
          <div className="flex items-start">
            <AlertCircle size={18} className="text-tacktix-blue mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300">
                Both teams must submit evidence for the match to be verified. The match result will be automatically confirmed if both teams submit matching evidence.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchEvidence;
