
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowDown, ArrowUp, Clock, DollarSign, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample transaction data
const transactions = [
  { 
    id: 1, 
    type: "deposit", 
    amount: 5000, 
    status: "completed", 
    date: "2023-09-24 14:32", 
    description: "Bank Transfer Deposit" 
  },
  { 
    id: 2, 
    type: "betting", 
    amount: -2000, 
    status: "completed", 
    date: "2023-09-25 16:45", 
    description: "Match bet: S&D on Standoff" 
  },
  { 
    id: 3, 
    type: "winning", 
    amount: 3800, 
    status: "completed", 
    date: "2023-09-25 17:20", 
    description: "Match win: S&D on Standoff" 
  },
  { 
    id: 4, 
    type: "withdraw", 
    amount: -5000, 
    status: "processing", 
    date: "2023-09-26 10:10", 
    description: "Withdrawal to Bank Account" 
  },
  { 
    id: 5, 
    type: "betting", 
    amount: -1000, 
    status: "completed", 
    date: "2023-09-26 18:56", 
    description: "Match bet: Hardpoint on Nuketown" 
  }
];

const WalletPage = () => {
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<string | null>(null);
  const walletBalance = 10800; // Sample balance in Naira (₦)

  const presetAmounts = [
    { value: "1000", label: "₦1,000" },
    { value: "2000", label: "₦2,000" },
    { value: "3000", label: "₦3,000" },
    { value: "5000", label: "₦5,000" },
    { value: "10000", label: "₦10,000" }
  ];

  const copyWalletId = () => {
    navigator.clipboard.writeText("TT-7835-2945-8361");
    toast({
      title: "Copied!",
      description: "Wallet ID copied to clipboard",
    });
  };

  const handleDeposit = () => {
    if (!depositAmount || parseInt(depositAmount) < 1000) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is ₦1,000",
        variant: "destructive",
      });
      return;
    }

    // Process deposit (would integrate with payment gateway in real app)
    toast({
      title: "Deposit initiated",
      description: `Depositing ₦${parseInt(depositAmount).toLocaleString()}`,
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseInt(withdrawAmount) < 1000) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is ₦1,000",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(withdrawAmount) > walletBalance) {
      toast({
        title: "Insufficient funds",
        description: "Your withdrawal amount exceeds your available balance",
        variant: "destructive",
      });
      return;
    }

    // Process withdrawal (would integrate with payment gateway in real app)
    toast({
      title: "Withdrawal initiated",
      description: `Withdrawing ₦${parseInt(withdrawAmount).toLocaleString()}`,
    });
  };

  const handlePresetAmountClick = (amount: string) => {
    setSelectedPresetAmount(amount);
    setDepositAmount(amount);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="container max-w-4xl">
          <h1 className="text-2xl font-bold mb-6">Wallet</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="glass-card rounded-xl p-6 h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                    <h2 className="text-4xl font-bold text-white">₦{walletBalance.toLocaleString()}</h2>
                  </div>

                  <div className="mb-4 flex items-center">
                    <p className="text-sm text-gray-400 mr-2">Wallet ID:</p>
                    <code className="bg-tacktix-dark-light text-xs px-2 py-1 rounded">TT-7835-2945-8361</code>
                    <button 
                      onClick={copyWalletId} 
                      className="ml-2 text-tacktix-blue hover:text-tacktix-blue-light"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex items-center justify-center">
                      <ArrowDown size={16} className="mr-2" />
                      Deposit
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center">
                      <ArrowUp size={16} className="mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="glass-card rounded-xl p-6 h-full">
                <h3 className="font-medium mb-4">Quick Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-tacktix-blue/20 flex items-center justify-center mr-3">
                        <ArrowUp size={14} className="text-tacktix-blue" />
                      </div>
                      <span className="text-sm text-gray-300">Total Spent</span>
                    </div>
                    <span className="font-medium">₦8,000</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <ArrowDown size={14} className="text-green-500" />
                      </div>
                      <span className="text-sm text-gray-300">Total Earned</span>
                    </div>
                    <span className="font-medium">₦13,800</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-tacktix-red/20 flex items-center justify-center mr-3">
                        <DollarSign size={14} className="text-tacktix-red" />
                      </div>
                      <span className="text-sm text-gray-300">Win Rate</span>
                    </div>
                    <span className="font-medium">67%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="glass-card rounded-xl p-6">
              <Tabs defaultValue="deposit">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                
                <TabsContent value="deposit" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Deposit Funds</h3>
                    <p className="text-sm text-gray-400 mb-6">Add money to your TacktixEdge wallet to start betting.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Choose Amount</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                          {presetAmounts.map((amount) => (
                            <button
                              key={amount.value}
                              type="button"
                              className={`py-2 rounded-md text-sm transition-colors ${
                                selectedPresetAmount === amount.value
                                  ? "bg-tacktix-blue text-white"
                                  : "bg-tacktix-dark-light text-gray-300 hover:bg-tacktix-dark"
                              }`}
                              onClick={() => handlePresetAmountClick(amount.value)}
                            >
                              {amount.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="mb-6">
                          <label className="text-sm text-gray-300 mb-2 block">Or Enter Custom Amount</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400">₦</span>
                            </div>
                            <Input
                              type="number"
                              min="1000"
                              placeholder="Minimum ₦1,000"
                              className="pl-8 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                              value={depositAmount}
                              onChange={(e) => {
                                setDepositAmount(e.target.value);
                                setSelectedPresetAmount(null);
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Minimum deposit: ₦1,000</p>
                        </div>
                        
                        <Button 
                          variant="gradient" 
                          className="w-full" 
                          onClick={handleDeposit}
                        >
                          <Plus size={16} className="mr-2" />
                          Deposit Funds
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="withdraw" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Withdraw Funds</h3>
                    <p className="text-sm text-gray-400 mb-6">Transfer money from your TacktixEdge wallet to your bank account.</p>
                    
                    <div className="space-y-6">
                      <div className="mb-6">
                        <label className="text-sm text-gray-300 mb-2 block">Enter Withdrawal Amount</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">₦</span>
                          </div>
                          <Input
                            type="number"
                            min="1000"
                            max={walletBalance}
                            placeholder="Minimum ₦1,000"
                            className="pl-8 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Minimum: ₦1,000</span>
                          <span>Available: ₦{walletBalance.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="gradient" 
                        className="w-full" 
                        onClick={handleWithdraw}
                      >
                        <ArrowUp size={16} className="mr-2" />
                        Withdraw Funds
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-medium mb-6">Transaction History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-2 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Date & Time</th>
                    <th className="py-3 px-2 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Description</th>
                    <th className="py-3 px-2 text-left text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
                    <th className="py-3 px-2 text-right text-xs uppercase tracking-wider text-gray-400 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {transaction.type === "deposit" && (
                              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <ArrowDown size={14} className="text-green-500" />
                              </div>
                            )}
                            {transaction.type === "withdraw" && (
                              <div className="h-8 w-8 rounded-full bg-tacktix-blue/10 flex items-center justify-center">
                                <ArrowUp size={14} className="text-tacktix-blue" />
                              </div>
                            )}
                            {transaction.type === "betting" && (
                              <div className="h-8 w-8 rounded-full bg-tacktix-red/10 flex items-center justify-center">
                                <DollarSign size={14} className="text-tacktix-red" />
                              </div>
                            )}
                            {transaction.type === "winning" && (
                              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <DollarSign size={14} className="text-yellow-500" />
                              </div>
                            )}
                          </div>
                          <span className="text-gray-300">{transaction.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-white">{transaction.description}</span>
                      </td>
                      <td className="py-4 px-2">
                        {transaction.status === "completed" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                            <Clock size={12} className="mr-1" />
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right whitespace-nowrap">
                        <span className={transaction.amount > 0 ? "text-green-500" : "text-red-500"}>
                          {transaction.amount > 0 ? "+" : ""}₦{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WalletPage;
