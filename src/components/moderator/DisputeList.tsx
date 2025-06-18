
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DisputeList = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      // Mock data for now - replace with actual API call
      setDisputes([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Active Disputes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disputes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No active disputes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dispute items would go here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeList;
