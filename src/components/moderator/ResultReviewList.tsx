
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

interface ResultSubmission {
  id: string;
  match_id: string;
  submitted_by: string;
  result_type: string;
  winner_id: string | null;
  notes: string | null;
  proof_urls: string[] | null;
  created_at: string;
  match: {
    title: string;
    game_mode: string;
  };
  submitter: {
    username: string;
  };
  winner: {
    username: string;
  } | null;
}

const ResultReviewList = () => {
  const [submissions, setSubmissions] = useState<ResultSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("match_result_submissions")
        .select(`
          *,
          match:matches(title, game_mode),
          submitter:profiles!match_result_submissions_submitted_by_fkey(username),
          winner:profiles!match_result_submissions_winner_id_fkey(username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch result submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResult = async (submission: ResultSubmission) => {
    try {
      // Update match with winner and completed status
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          winner_id: submission.winner_id,
          status: "completed",
          end_time: new Date().toISOString()
        })
        .eq("id", submission.match_id);

      if (matchError) throw matchError;

      toast({
        title: "Result Approved",
        description: "Match result has been approved and winner declared",
      });

      fetchSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve result",
        variant: "destructive"
      });
    }
  };

  const handleRejectResult = async (submissionId: string) => {
    try {
      // For now, we'll just show a toast. In a full implementation,
      // you might want to add a rejection reason or status
      toast({
        title: "Result Rejected",
        description: "Match result has been rejected",
      });

      fetchSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject result",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Match Result Reviews</h2>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
          {submissions.length} Pending
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending result submissions to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {submission.match?.title || "Unknown Match"}
                  </CardTitle>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Game Mode</p>
                    <p className="font-medium">{submission.match?.game_mode || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Submitted By</p>
                    <p className="font-medium">{submission.submitter?.username || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Result Type</p>
                    <p className="font-medium capitalize">{submission.result_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Declared Winner</p>
                    <p className="font-medium">{submission.winner?.username || "None"}</p>
                  </div>
                </div>

                {submission.notes && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Notes</p>
                    <p className="text-sm bg-gray-800 p-3 rounded">{submission.notes}</p>
                  </div>
                )}

                {submission.proof_urls && submission.proof_urls.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Evidence ({submission.proof_urls.length} files)</p>
                    <div className="flex gap-2">
                      {submission.proof_urls.map((url, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectResult(submission.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveResult(submission)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Declare Winner
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultReviewList;
