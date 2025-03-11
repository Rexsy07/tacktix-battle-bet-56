
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet as WalletIcon, History, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw } from "lucide-react";

const Wallet = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState("₦25,000");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDeposit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBalance(`₦${(parseInt(balance.replace(/[^\d]/g, "")) + parseInt(depositAmount)).toLocaleString()}`);
      setDepositAmount("");
      toast({
        title: "Deposit Successful",
        description: `₦${parseInt(depositAmount).toLocaleString()} has been added to your wallet.`,
      });
    }, 1500);
  };
  
  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    
    const currentBalance = parseInt(balance.replace(/[^\d]/g, ""));
    if (parseInt(withdrawAmount) > currentBalance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBalance(`₦${(currentBalance - parseInt(withdrawAmount)).toLocaleString()}`);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal Initiated",
        description: `₦${parseInt(withdrawAmount).toLocaleString()} will be sent to your preferred payment method.`,
      });
    }, 1500);
  };
  
  const recentTransactions = [
    {
      id: "tx-1",
      type: "deposit",
      amount: "₦10,000",
      date: "June 12, 2023",
      status: "completed"
    },
    {
      id: "tx-2",
      type: "withdraw",
      amount: "₦5,000",
      date: "June 10, 2023",
      status: "completed"
    },
    {
      id: "tx-3",
      type: "win",
      amount: "₦12,000",
      date: "June 9, 2023",
      status: "completed"
    },
    {
      id: "tx-4",
      type: "lose",
      amount: "₦8,000",
      date: "June 8, 2023",
      status: "completed"
    },
    {
      id: "tx-5",
      type: "deposit",
      amount: "₦15,000",
      date: "June 5, 2023",
      status: "completed"
    }
  ];
  
  const quickAmounts = [1000, 2000, 5000, 10000];
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => {
              toast({
                title: "Refreshed",
                description: "Your wallet balance has been updated.",
              });
            }}
          >
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <WalletIcon size={20} className="mr-2 text-tacktix-blue" />
                Wallet Balance
              </CardTitle>
              <CardDescription>
                Your current available balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-4 text-center">
                <div className="text-4xl font-bold text-tacktix-blue mb-2">{balance}</div>
                <p className="text-gray-400 text-sm">Available for betting and withdrawal</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="gradient" onClick={() => document.getElementById('deposit-tab')?.click()}>
                  <Plus size={16} className="mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('withdraw-tab')?.click()}>
                  <ArrowUpRight size={16} className="mr-2" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <History size={20} className="mr-2 text-tacktix-blue" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-2 rounded-md hover:bg-white/5">
                    <div className="flex items-center">
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft size={16} className="text-green-500 mr-2" />
                      ) : transaction.type === "withdraw" ? (
                        <ArrowUpRight size={16} className="text-tacktix-red mr-2" />
                      ) : transaction.type === "win" ? (
                        <Plus size={16} className="text-green-500 mr-2" />
                      ) : (
                        <WalletIcon size={16} className="text-tacktix-red mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {transaction.type === "deposit" ? "Deposit" : 
                            transaction.type === "withdraw" ? "Withdrawal" : 
                            transaction.type === "win" ? "Match Win" : "Match Loss"}
                        </div>
                        <div className="text-xs text-gray-400">{transaction.date}</div>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === "deposit" || transaction.type === "win" 
                        ? "text-green-500" 
                        : "text-tacktix-red"}`}
                    >
                      {transaction.type === "deposit" || transaction.type === "win" ? "+" : "-"}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-2 text-xs" onClick={() => document.getElementById('history-tab')?.click()}>
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="deposit" id="deposit-tab">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" id="withdraw-tab">Withdraw</TabsTrigger>
            <TabsTrigger value="history" id="history-tab">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Add money to your TacktixEdge wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-tacktix-dark-light text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Amounts</label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map(amount => (
                      <Button 
                        key={amount}
                        type="button" 
                        variant="outline"
                        className="bg-tacktix-dark-light"
                        onClick={() => setDepositAmount(amount.toString())}
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start bg-tacktix-dark-light">
                      <CreditCard size={16} className="mr-2" />
                      Debit/Credit Card
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  onClick={handleDeposit}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Deposit Funds'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>Transfer money from your wallet to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Balance</label>
                  <div className="text-xl font-bold text-tacktix-blue">{balance}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-tacktix-dark-light text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Amounts</label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map(amount => (
                      <Button 
                        key={amount}
                        type="button" 
                        variant="outline"
                        className="bg-tacktix-dark-light"
                        onClick={() => setWithdrawAmount(amount.toString())}
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Withdrawal Method</label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start bg-tacktix-dark-light">
                      <CreditCard size={16} className="mr-2" />
                      Bank Transfer
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Withdraw Funds'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View all your previous transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map(transaction => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-3 rounded-md hover:bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === "deposit" || transaction.type === "win" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-tacktix-red/10 text-tacktix-red"
                        }`}>
                          {transaction.type === "deposit" ? (
                            <ArrowDownLeft size={18} />
                          ) : transaction.type === "withdraw" ? (
                            <ArrowUpRight size={18} />
                          ) : transaction.type === "win" ? (
                            <Plus size={18} />
                          ) : (
                            <WalletIcon size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.type === "deposit" ? "Deposit" : 
                              transaction.type === "withdraw" ? "Withdrawal" : 
                              transaction.type === "win" ? "Match Win" : "Match Loss"}
                          </div>
                          <div className="text-sm text-gray-400">{transaction.date}</div>
                        </div>
                      </div>
                      <div>
                        <div className={`text-right font-medium ${
                          transaction.type === "deposit" || transaction.type === "win" 
                            ? "text-green-500" 
                            : "text-tacktix-red"}`}
                        >
                          {transaction.type === "deposit" || transaction.type === "win" ? "+" : "-"}{transaction.amount}
                        </div>
                        <div className="text-right text-sm">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Wallet;
