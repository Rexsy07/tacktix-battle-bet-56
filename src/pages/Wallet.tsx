
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History as HistoryIcon, Copy, CheckCircle, DollarSign } from "lucide-react";

const Wallet = () => {
  const [copied, setCopied] = useState(false);
  const walletId = "wallet_5e7f8d9a3b2c1e7f8d9a3b2c";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAmounts = [1000, 2000, 3000, 4000, 5000, 10000];

  const transactions = [
    {
      id: "tx_123456",
      type: "deposit",
      amount: "₦5,000",
      date: "Today, 12:45 PM",
      status: "completed"
    },
    {
      id: "tx_123457",
      type: "win",
      amount: "₦2,000",
      date: "Yesterday, 3:22 PM",
      status: "completed",
      match: "Search & Destroy on Standoff"
    },
    {
      id: "tx_123458",
      type: "withdraw",
      amount: "₦3,000",
      date: "Dec 10, 10:15 AM",
      status: "completed"
    },
    {
      id: "tx_123459",
      type: "loss",
      amount: "₦1,000",
      date: "Dec 8, 5:30 PM",
      status: "completed",
      match: "Hardpoint on Nuketown"
    },
    {
      id: "tx_123460",
      type: "win",
      amount: "₦4,000",
      date: "Dec 5, 8:22 AM",
      status: "completed",
      match: "Battle Royale on Isolated"
    }
  ];

  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Wallet</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-lg p-6 h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-tacktix-blue/20 p-3 rounded-lg">
                  <WalletIcon size={24} className="text-tacktix-blue" />
                </div>
                <div className="text-xs text-gray-400">
                  Wallet ID
                  <div className="flex items-center mt-1">
                    <span className="text-gray-300 text-sm truncate max-w-[120px]">
                      {walletId.substring(0, 8)}...
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className="ml-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Available Balance</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-white">₦12,500</span>
                  <span className="text-tacktix-blue ml-2 text-sm">+₦1,500 this week</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button variant="gradient" className="w-full">
                  <ArrowDownLeft size={18} className="mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" className="w-full">
                  <ArrowUpRight size={18} className="mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Deposit Card */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Deposit</h2>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    className="bg-tacktix-dark-light hover:bg-tacktix-blue/20 border border-white/5 rounded-lg py-3 text-center transition-colors"
                  >
                    <span className="text-white font-medium">₦{amount.toLocaleString()}</span>
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Custom Amount (Min ₦1,000)</label>
                <div className="flex">
                  <div className="bg-tacktix-dark-light border border-white/10 rounded-l-lg flex items-center px-3">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    min="1000"
                    className="flex-1 bg-tacktix-dark-light border border-white/10 border-l-0 rounded-r-lg py-2 px-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-tacktix-blue"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  Deposit with Bank Transfer
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Deposit with Card
                </Button>
              </div>
            </div>
          </div>
          
          {/* Transaction History */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <HistoryIcon size={18} className="text-tacktix-blue mr-2" />
                  Transaction History
                </h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-medium hidden md:table-cell">Details</th>
                      <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Date</th>
                      <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={`
                              h-8 w-8 rounded-full flex items-center justify-center mr-3
                              ${tx.type === 'deposit' || tx.type === 'win' ? 'bg-green-500/20 text-green-500' : 'bg-tacktix-red/20 text-tacktix-red'}
                            `}>
                              {tx.type === 'deposit' && <ArrowDownLeft size={16} />}
                              {tx.type === 'withdraw' && <ArrowUpRight size={16} />}
                              {tx.type === 'win' && <CheckCircle size={16} />}
                              {tx.type === 'loss' && <DollarSign size={16} />}
                            </div>
                            <div>
                              <div className="font-medium text-white capitalize">{tx.type}</div>
                              <div className="text-xs text-gray-400">{tx.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`font-medium ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : 'text-tacktix-red'}`}>
                            {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}{tx.amount}
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell text-gray-400">
                          {tx.match ? tx.match : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {tx.date}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                            {tx.status}
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
      </div>
    </Layout>
  );
};

export default Wallet;
