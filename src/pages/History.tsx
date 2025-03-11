
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Search, Trophy, Calendar, FilterX, Eye, CheckCircle2, XCircle, Shield, Target } from "lucide-react";

const History = () => {
  const [matchFilter, setMatchFilter] = useState("");
  const [matchTimeFrame, setMatchTimeFrame] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [transactionTimeFrame, setTransactionTimeFrame] = useState("all");
  
  // Mock data
  const matches = [
    {
      id: "match-1",
      date: "2023-06-15T14:30:00",
      mode: "Search & Destroy",
      map: "Standoff",
      opponent: "DeadlyAssault",
      betAmount: "₦5,000",
      result: "win",
      score: "6-4",
      earnings: "₦9,500"
    },
    {
      id: "match-2",
      date: "2023-06-14T18:45:00",
      mode: "Hardpoint",
      map: "Nuketown",
      opponent: "ShadowNinja",
      betAmount: "₦3,000",
      result: "loss",
      score: "150-200",
      earnings: "₦0"
    },
    {
      id: "match-3",
      date: "2023-06-12T20:15:00",
      mode: "Battle Royale",
      map: "Isolated",
      opponent: "FragMaster",
      betAmount: "₦2,000",
      result: "win",
      score: "1st place",
      earnings: "₦3,800"
    },
    {
      id: "match-4",
      date: "2023-06-10T16:00:00",
      mode: "Search & Destroy",
      map: "Crash",
      opponent: "TacticalOps",
      betAmount: "₦10,000",
      result: "loss",
      score: "4-6",
      earnings: "₦0"
    },
    {
      id: "match-5",
      date: "2023-06-08T21:30:00",
      mode: "Gunfight",
      map: "Pine",
      opponent: "VictoryHunter",
      betAmount: "₦1,000",
      result: "win",
      score: "6-2",
      earnings: "₦1,900"
    }
  ];
  
  const transactions = [
    {
      id: "tx-1",
      date: "2023-06-15T15:30:00",
      type: "withdrawal",
      amount: "₦5,000",
      method: "Bank Transfer",
      status: "completed"
    },
    {
      id: "tx-2",
      date: "2023-06-15T14:45:00",
      type: "earning",
      amount: "₦9,500",
      method: "Match Win",
      status: "completed"
    },
    {
      id: "tx-3",
      date: "2023-06-12T10:00:00",
      type: "deposit",
      amount: "₦10,000",
      method: "Credit Card",
      status: "completed"
    },
    {
      id: "tx-4",
      date: "2023-06-10T16:30:00",
      type: "loss",
      amount: "₦10,000",
      method: "Match Loss",
      status: "completed"
    },
    {
      id: "tx-5",
      date: "2023-06-05T09:15:00",
      type: "deposit",
      amount: "₦15,000",
      method: "Bank Transfer",
      status: "completed"
    }
  ];
  
  // Filter functions
  const filterMatches = () => {
    return matches.filter(match => {
      const searchMatch = 
        match.mode.toLowerCase().includes(matchFilter.toLowerCase()) ||
        match.map.toLowerCase().includes(matchFilter.toLowerCase()) ||
        match.opponent.toLowerCase().includes(matchFilter.toLowerCase());
      
      if (!searchMatch) return false;
      
      if (matchTimeFrame === "all") return true;
      const now = new Date();
      const matchDate = new Date(match.date);
      
      if (matchTimeFrame === "today") {
        return matchDate.toDateString() === now.toDateString();
      } else if (matchTimeFrame === "week") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return matchDate >= oneWeekAgo;
      } else if (matchTimeFrame === "month") {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return matchDate >= oneMonthAgo;
      }
      
      return true;
    });
  };
  
  const filterTransactions = () => {
    return transactions.filter(tx => {
      const searchMatch = 
        tx.type.toLowerCase().includes(transactionFilter.toLowerCase()) ||
        tx.method.toLowerCase().includes(transactionFilter.toLowerCase());
      
      if (!searchMatch) return false;
      
      if (transactionTimeFrame === "all") return true;
      const now = new Date();
      const txDate = new Date(tx.date);
      
      if (transactionTimeFrame === "today") {
        return txDate.toDateString() === now.toDateString();
      } else if (transactionTimeFrame === "week") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo;
      } else if (transactionTimeFrame === "month") {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return txDate >= oneMonthAgo;
      }
      
      return true;
    });
  };
  
  const filteredMatches = filterMatches();
  const filteredTransactions = filterTransactions();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Stats calculation
  const totalMatches = matches.length;
  const totalWins = matches.filter(m => m.result === "win").length;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
  const totalEarnings = matches.reduce((sum, match) => {
    return sum + (match.result === "win" ? parseInt(match.earnings.replace(/[^\d]/g, "")) : 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-gray-400">View your past matches and transactions</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Matches</p>
                  <h3 className="text-2xl font-bold text-white">{totalMatches}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-blue/10 flex items-center justify-center">
                  <Gamepad2 className="text-tacktix-blue" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <h3 className="text-2xl font-bold text-white">{winRate}%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-blue/10 flex items-center justify-center">
                  <Trophy className="text-tacktix-blue" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <h3 className="text-2xl font-bold text-tacktix-blue">₦{totalEarnings.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-blue/10 flex items-center justify-center">
                  <Trophy className="text-tacktix-blue" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last Played</p>
                  <h3 className="text-lg font-bold text-white">{formatDate(matches[0]?.date || new Date().toISOString())}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-blue/10 flex items-center justify-center">
                  <Calendar className="text-tacktix-blue" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="matches">Match History</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div>
                    <CardTitle>Match History</CardTitle>
                    <CardDescription>View all your previous matches</CardDescription>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Search matches..."
                        className="pl-9 bg-tacktix-dark-light"
                        value={matchFilter}
                        onChange={(e) => setMatchFilter(e.target.value)}
                      />
                      {matchFilter && (
                        <button 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setMatchFilter("")}
                        >
                          <FilterX size={16} />
                        </button>
                      )}
                    </div>
                    
                    <Select value={matchTimeFrame} onValueChange={setMatchTimeFrame}>
                      <SelectTrigger className="bg-tacktix-dark-light text-white w-full md:w-[140px]">
                        <SelectValue placeholder="Filter by time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMatches.length > 0 ? (
                  <div className="rounded-md overflow-hidden border border-white/10">
                    <Table>
                      <TableHeader className="bg-tacktix-dark-deeper">
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead>Game Mode</TableHead>
                          <TableHead>Map</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Bet Amount</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Earnings</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.map((match) => (
                          <TableRow key={match.id} className="hover:bg-white/5">
                            <TableCell className="font-medium">{formatDate(match.date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {match.mode === "Search & Destroy" ? (
                                  <Shield size={16} className="mr-2 text-tacktix-blue" />
                                ) : match.mode === "Hardpoint" ? (
                                  <Target size={16} className="mr-2 text-tacktix-blue" />
                                ) : (
                                  <Gamepad2 size={16} className="mr-2 text-tacktix-blue" />
                                )}
                                {match.mode}
                              </div>
                            </TableCell>
                            <TableCell>{match.map}</TableCell>
                            <TableCell>{match.opponent}</TableCell>
                            <TableCell>{match.betAmount}</TableCell>
                            <TableCell>
                              <Badge variant={match.result === "win" ? "success" : "destructive"}>
                                {match.result === "win" ? (
                                  <CheckCircle2 size={14} className="mr-1" />
                                ) : (
                                  <XCircle size={14} className="mr-1" />
                                )}
                                {match.result.charAt(0).toUpperCase() + match.result.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{match.score}</TableCell>
                            <TableCell className={`text-right font-medium ${match.result === "win" ? "text-green-500" : "text-gray-400"}`}>
                              {match.earnings}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Eye size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 rounded-full bg-tacktix-dark-light flex items-center justify-center mb-4">
                      <Gamepad2 size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Matches Found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      We couldn't find any matches matching your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View all your financial transactions</CardDescription>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-9 bg-tacktix-dark-light"
                        value={transactionFilter}
                        onChange={(e) => setTransactionFilter(e.target.value)}
                      />
                      {transactionFilter && (
                        <button 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setTransactionFilter("")}
                        >
                          <FilterX size={16} />
                        </button>
                      )}
                    </div>
                    
                    <Select value={transactionTimeFrame} onValueChange={setTransactionTimeFrame}>
                      <SelectTrigger className="bg-tacktix-dark-light text-white w-full md:w-[140px]">
                        <SelectValue placeholder="Filter by time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length > 0 ? (
                  <div className="rounded-md overflow-hidden border border-white/10">
                    <Table>
                      <TableHeader className="bg-tacktix-dark-deeper">
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-white/5">
                            <TableCell className="font-medium">{formatDate(tx.date)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                tx.type === "deposit" || tx.type === "earning" 
                                  ? "success" 
                                  : "destructive"
                              }>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{tx.method}</TableCell>
                            <TableCell className={`text-right font-medium ${
                              tx.type === "deposit" || tx.type === "earning" 
                                ? "text-green-500" 
                                : "text-tacktix-red"
                            }`}>
                              {tx.type === "deposit" || tx.type === "earning" ? "+" : "-"}{tx.amount}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Eye size={16} />
                              </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default History;
