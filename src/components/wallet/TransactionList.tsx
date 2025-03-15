import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Calendar, CheckCircle, Clock, XCircle, Search, ArrowDownRight, ArrowUpRight, 
  RefreshCw, Award, Star as StarIcon, Circle as CircleIcon 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  status: string;
  payment_method: string;
  created_at: string;
  details: any;
}

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    fetchTransactions();
  }, [filter]);
  
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      // Get user's wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      
      if (walletError) throw walletError;
      
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("wallet_id", walletData.id)
        .order("created_at", { ascending: false });
        
      if (filter !== "all") {
        query = query.eq("transaction_type", filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our Transaction interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        amount: item.amount,
        transaction_type: item.transaction_type || item.type,
        status: item.status,
        payment_method: item.payment_method || 'system',
        created_at: item.created_at,
        details: item.details
      }));
      
      setTransactions(transformedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFilteredTransactions = () => {
    if (!searchQuery) return transactions;
    
    return transactions.filter(tx => 
      tx.transaction_type.includes(searchQuery.toLowerCase()) ||
      tx.payment_method.includes(searchQuery.toLowerCase()) ||
      tx.status.includes(searchQuery.toLowerCase())
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };
  
  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight size={16} className="text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight size={16} className="text-red-500" />;
      case 'win':
        return <Award size={16} className="text-yellow-500" />;
      case 'loss':
        return <XCircle size={16} className="text-gray-500" />;
      case 'refund':
        return <RefreshCw size={16} className="text-blue-500" />;
      case 'vip_subscription':
        return <StarIcon size={16} className="text-purple-500" />;
      default:
        return <CircleIcon size={16} className="text-gray-500" />;
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View your recent transactions</CardDescription>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="win">Winnings</SelectItem>
                <SelectItem value="loss">Losses</SelectItem>
                <SelectItem value="vip_subscription">VIP Subscriptions</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={fetchTransactions}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <RefreshCw size={24} className="text-gray-400 animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="rounded-md overflow-hidden border border-white/10">
            <Table>
              <TableHeader className="bg-tacktix-dark-deeper">
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderTransactionIcon(tx.transaction_type)}
                        <span>{formatTransactionType(tx.transaction_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(tx.created_at)}</TableCell>
                    <TableCell className="capitalize">{tx.payment_method.replace('_', ' ')}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'win' || tx.transaction_type === 'refund'
                        ? 'text-green-500' 
                        : 'text-tacktix-red'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'win' || tx.transaction_type === 'refund'
                        ? `+₦${tx.amount.toLocaleString()}`
                        : `-₦${tx.amount.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {tx.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </Badge>
                      )}
                      {tx.status === 'pending' && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Clock size={12} className="mr-1" />
                          Pending
                        </Badge>
                      )}
                      {tx.status === 'failed' && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          <XCircle size={12} className="mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-tacktix-dark-light flex items-center justify-center mb-4">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We couldn't find any transactions matching your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
