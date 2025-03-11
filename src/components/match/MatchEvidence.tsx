
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Camera, Upload, Check, X } from "lucide-react";

interface MatchEvidenceProps {
  matchId: string;
  matchStatus: "waiting" | "in-progress" | "completed" | "disputed";
}

const MatchEvidence = ({ matchId, matchStatus }: MatchEvidenceProps) => {
  const { toast } = useToast();
  const [preMatchStatus, setPreMatchStatus] = useState<"pending" | "uploaded" | "verified">("pending");
  const [postMatchStatus, setPostMatchStatus] = useState<"pending" | "uploaded" | "verified">("pending");
  
  const handleUpload = (type: "pre" | "post") => {
    // In a real app, this would open a file picker and upload to a server
    setTimeout(() => {
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
    }, 1500);
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
                disabled={isDisabled}
              >
                <Upload size={14} className="mr-1" />
                Upload Screenshot
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-900/20">
                    <Check size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20">
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
