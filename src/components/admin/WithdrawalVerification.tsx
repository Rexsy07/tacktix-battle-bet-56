import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  user?: {
    username: string;
    email?: string;
  };
}

export function WithdrawalVerification() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user:profiles!withdrawal_requests_user_id_fkey(username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    setProcessingId(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          admin_notes: adminNotes[requestId] || '',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (approve) {
        // Deduct amount from user's wallet
        const { error: walletError } = await supabase.rpc('update_user_balance', {
          user_id: request.user_id,
          amount_change: -Math.abs(request.amount)
        });

        if (walletError) throw walletError;

        // Create withdrawal transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: request.user_id,
            amount: -Math.abs(request.amount),
            type: 'withdrawal',
            status: 'completed',
            description: `Withdrawal approved - ${request.bank_code} ${request.account_number}`
          });

        if (transactionError) throw transactionError;
      }

      await fetchWithdrawalRequests();
      toast.success(`Withdrawal ${approve ? 'approved' : 'rejected'} successfully`);
      setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
    } catch (error) {
      console.error(`Error ${approve ? 'approving' : 'rejecting'} withdrawal:`, error);
      toast.error(`Failed to ${approve ? 'approve' : 'reject'} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Withdrawal Verification</h2>
        <Button onClick={fetchWithdrawalRequests} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No withdrawal requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.user?.username || 'Unknown User'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.user?.email}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Amount</p>
                    <p className="text-2xl font-bold text-green-600">₦{request.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Requested</p>
                    <p className="text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at))} ago
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Bank</p>
                    <p>{request.bank_code}</p>
                  </div>
                  <div>
                    <p className="font-medium">Account Number</p>
                    <p className="font-mono">{request.account_number}</p>
                  </div>
                  <div>
                    <p className="font-medium">Account Name</p>
                    <p>{request.account_name}</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="space-y-3 border-t pt-4">
                    <Textarea
                      placeholder="Admin notes (optional)"
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({
                        ...prev,
                        [request.id]: e.target.value
                      }))}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproval(request.id, true)}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === request.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleApproval(request.id, false)}
                        disabled={processingId === request.id}
                        variant="destructive"
                      >
                        {processingId === request.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}

                {request.admin_notes && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Admin Notes:</p>
                    <p>{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}