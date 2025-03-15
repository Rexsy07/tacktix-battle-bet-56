
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight, Wallet as WalletIcon, RefreshCw, CreditCard, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import DepositForm from "@/components/wallet/DepositForm";
import WithdrawForm from "@/components/wallet/WithdrawForm";
import TransactionList from "@/components/wallet/TransactionList";

// Add RPC function to get wallet balance
const updateWalletBalance = `
CREATE OR REPLACE FUNCTION update_wallet_balance(user_uuid UUID, amount_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets
  SET balance = balance + amount_to_add,
      updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const Wallet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<{id: string, balance: number, user_id: string} | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    checkAuth();
    fetchWalletData();
  }, []);
  
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your wallet",
        variant: "destructive",
      });
      navigate("/sign-in");
    }
  };
  
  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) throw error;
      
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-gray-400">Manage your funds, deposits, and withdrawals</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle>Wallet Balance</CardTitle>
                  <CardDescription>Your current available funds</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-6 flex justify-center">
                      <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-end gap-2 mb-6">
                        <div className="text-4xl font-bold text-tacktix-blue">
                          ₦{wallet?.balance.toLocaleString()}
                        </div>
                        <Badge variant="outline" className="bg-tacktix-blue/10 mb-1">
                          Available
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1 flex items-center justify-center" onClick={() => setActiveTab("deposit")}>
                          <ArrowDownRight size={16} className="mr-2" />
                          Deposit
                        </Button>
                        <Button variant="outline" className="flex-1 flex items-center justify-center" onClick={() => setActiveTab("withdraw")}>
                          <ArrowUpRight size={16} className="mr-2" />
                          Withdraw
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <TransactionList />
            </div>
          </TabsContent>
          
          <TabsContent value="deposit" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DepositForm />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Methods</CardTitle>
                    <CardDescription>Available payment options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center p-3 bg-tacktix-dark-light rounded-md">
                      <CreditCard className="h-8 w-8 text-tacktix-blue mr-3" />
                      <div>
                        <h4 className="font-medium">Credit/Debit Card</h4>
                        <p className="text-xs text-gray-400">Instant | Fee: 1.5%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-tacktix-dark-light rounded-md">
                      <WalletIcon className="h-8 w-8 text-tacktix-blue mr-3" />
                      <div>
                        <h4 className="font-medium">Bank Transfer</h4>
                        <p className="text-xs text-gray-400">1-2 hours | Fee: 1%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>Having trouble with deposits?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      If you're having issues with deposits or need assistance, our support team is here to help.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <WithdrawForm currentBalance={wallet?.balance || 0} />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Info</CardTitle>
                    <CardDescription>Processing times and fees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Processing Times</h4>
                      <div className="flex justify-between text-sm py-1 border-b border-white/10">
                        <span>Bank Transfer</span>
                        <span>1-3 business days</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-white/10">
                        <span>Mobile Money</span>
                        <span>Instant to 24 hours</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Withdrawal Fees</h4>
                      <div className="flex justify-between text-sm py-1 border-b border-white/10">
                        <span>Standard</span>
                        <span>2%</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-white/10">
                        <span>VIP Members</span>
                        <span>0.5% - 1%</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-gray-400">
                        Minimum withdrawal amount: ₦1,000
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History size={16} className="mr-2" />
                      Withdrawal History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("overview")}>
                      View Transaction History
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Wallet;
