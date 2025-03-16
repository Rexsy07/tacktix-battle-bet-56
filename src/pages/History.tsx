
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Medal,
  Trophy,
  Wallet,
  Eye,
  X,
  FileCheck,
  CalendarDays,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMatchStatusVariant, getStatusText, formatMatchDuration } from "@/utils/matchmaking-helpers";
import { getUserMatchHistory, getUserMatchStats } from "@/utils/history-utils";
import { supabase } from "@/integrations/supabase/client";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [matchStats, setMatchStats] = useState({
    matches_played: 0,
    matches_won: 0,
    win_rate: 0,
    total_earnings: 0
  });
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/sign-in";
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      // Fetch match stats
      const statsResult = await getUserMatchStats(userId);
      if (statsResult.success) {
        setMatchStats(statsResult.data);
      }
      
      // Fetch match history
      const historyResult = await getUserMatchHistory(
        userId, 
        1, 
        20, 
        activeTab !== "all" ? activeTab : undefined
      );
      
      if (historyResult.success) {
        setMatchHistory(historyResult.data);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [userId, activeTab]);
  
  const getOpponent = (match: any) => {
    if (!userId) return null;
    return match.host_id === userId ? match.opponent : match.host;
  };
  
  const isWinner = (match: any) => {
    return match.winner_id === userId;
  };
  
  const statsCards = [
    {
      title: "Matches Played",
      value: matchStats.matches_played,
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      desc: "Total matches"
    },
    {
      title: "Matches Won",
      value: matchStats.matches_won,
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      desc: "Total victories"
    },
    {
      title: "Win Rate",
      value: `${matchStats.win_rate}%`,
      icon: <Medal className="h-8 w-8 text-green-500" />,
      desc: "Victory percentage"
    },
    {
      title: "Total Earnings",
      value: `₦${matchStats.total_earnings.toLocaleString()}`,
      icon: <Wallet className="h-8 w-8 text-purple-500" />,
      desc: "From won matches"
    }
  ];

  if (!userId || loading) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Match History</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 rounded-full mb-4" />
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gradient">Match History</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="mb-4">
                  {card.icon}
                </div>
                <CardTitle className="text-xl mb-2">{card.title}</CardTitle>
                <div className="text-3xl font-bold mb-2">{card.value}</div>
                <CardDescription>{card.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Review your most recent games and their outcomes</CardDescription>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full sm:w-auto bg-tacktix-dark-deeper">
                <TabsTrigger value="all">All Matches</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="disputed">Disputed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : matchHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match Details</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Bet Amount</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchHistory.map((match) => {
                    const opponent = getOpponent(match);
                    const winner = isWinner(match);
                    
                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{match.game_mode}</div>
                            <div className="text-sm text-gray-400">{match.map_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={opponent?.avatar_url || ""} />
                              <AvatarFallback>{opponent?.username?.substring(0, 2) || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{opponent?.username || "No Opponent"}</div>
                              {match.start_time && (
                                <div className="text-xs text-gray-400">
                                  {formatMatchDuration(match.start_time, match.status === "completed" ? match.updated_at : null)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₦{match.bet_amount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            <span>{new Date(match.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(match.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMatchStatusVariant(match.status)}>
                            {getStatusText(match.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {match.status === "completed" ? (
                            winner ? (
                              <div className="flex items-center text-green-500">
                                <Trophy className="h-4 w-4 mr-1" />
                                <span>Won</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <X className="h-4 w-4 mr-1" />
                                <span>Lost</span>
                              </div>
                            )
                          ) : match.status === "disputed" ? (
                            <div className="flex items-center text-yellow-500">
                              <FileCheck className="h-4 w-4 mr-1" />
                              <span>Disputed</span>
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link to={`/match/${match.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-3">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 bg-tacktix-dark-lighter rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-xl font-medium mb-2">No Match History</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-4">
                  You haven't played any matches yet. Join a match to start building your history.
                </p>
                <Link to="/matchmaking">
                  <Button variant="gradient">
                    Find Matches
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
