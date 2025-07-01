
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getMatchResults, approveMatchResult } from "@/utils/match-result-utils";

const ResultReviewList = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("match_result_submissions")
        .select(`
          *,
          match:matches(title, host_id, opponent_id),
          submitter:profiles!match_result_submissions_submitted_by_fkey(username)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load match result submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submission: any) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.data.session) return;

      const { success, error } = await approveMatchResult(
        submission.id,
        session.data.session.user.id,
        submission.match_id,
        submission.winner_id
      );

      if (!success) throw new Error(error);

      toast({
        title: "Result Approved",
        description: "Match result has been approved and winner has been credited",
      });

      fetchPendingSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve result",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.data.session) return;

      const { error } = await supabase
        .from("match_result_submissions")
        .update({
          status: "rejected",
          reviewed_by: session.data.session.user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Result Rejected",
        description: "Match result has been rejected",
      });

      fetchPendingSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject result",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tacktix-blue"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Pending Result Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No pending result submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: any) => (
              <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{submission.match?.title}</h4>
                    <p className="text-sm text-gray-500">
                      Submitted by {submission.submitter?.username}
                    </p>
                  </div>
                  <Badge variant={
                    submission.result_type === "win" ? "default" :
                    submission.result_type === "loss" ? "secondary" : "outline"
                  }>
                    {submission.result_type}
                  </Badge>
                </div>
                
                {submission.description && (
                  <p className="text-sm text-gray-600">{submission.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(submission.created_at).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(submission.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(submission)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultReviewList;
