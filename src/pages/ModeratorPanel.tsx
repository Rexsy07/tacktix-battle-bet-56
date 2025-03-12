
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  Shield, AlertCircle, CheckCircle, XCircle, BarChart3, Users, 
  Clock, Eye, ExternalLink, Search, Filter, Flag
} from "lucide-react";

interface Dispute {
  id: string;
  matchId: string;
  type: "result" | "cheating" | "behavior" | "technical";
  status: "pending" | "reviewing" | "resolved";
  reportedBy: {
    name: string;
    avatar: string;
  };
  againstPlayer: {
    name: string;
    avatar: string;
  };
  mode: string;
  map: string;
  betAmount: number;
  createdAt: string;
  priority: "high" | "medium" | "low";
}

interface ReportedUser {
  id: string;
  name: string;
  avatar: string;
  violations: number;
  currentStatus: "active" | "warned" | "suspended" | "banned";
  reportCount: number;
  lastReportDate: string;
}

const ModeratorPanel = () => {
  const [tab, setTab] = useState("disputes");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dummy data
  const disputes: Dispute[] = [
    {
      id: "dispute-1",
      matchId: "match-5763",
      type: "result",
      status: "pending",
      reportedBy: {
        name: "FairPlayer123",
        avatar: "/placeholder.svg"
      },
      againstPlayer: {
        name: "SuspectUser",
        avatar: "/placeholder.svg"
      },
      mode: "Search & Destroy",
      map: "Standoff",
      betAmount: 5000,
      createdAt: "25 minutes ago",
      priority: "high"
    },
    {
      id: "dispute-2",
      matchId: "match-5728",
      type: "cheating",
      status: "reviewing",
      reportedBy: {
        name: "HonestGamer",
        avatar: "/placeholder.svg"
      },
      againstPlayer: {
        name: "AimSuspect",
        avatar: "/placeholder.svg"
      },
      mode: "1v1 Duel",
      map: "Killhouse",
      betAmount: 3000,
      createdAt: "2 hours ago",
      priority: "high"
    },
    {
      id: "dispute-3",
      matchId: "match-5701",
      type: "behavior",
      status: "pending",
      reportedBy: {
        name: "RespectfulPlayer",
        avatar: "/placeholder.svg"
      },
      againstPlayer: {
        name: "ToxicGamer",
        avatar: "/placeholder.svg"
      },
      mode: "Team Deathmatch",
      map: "Nuketown",
      betAmount: 2000,
      createdAt: "5 hours ago",
      priority: "medium"
    },
    {
      id: "dispute-4",
      matchId: "match-5691",
      type: "technical",
      status: "resolved",
      reportedBy: {
        name: "UnluckyPlayer",
        avatar: "/placeholder.svg"
      },
      againstPlayer: {
        name: "Disconnector",
        avatar: "/placeholder.svg"
      },
      mode: "Domination",
      map: "Firing Range",
      betAmount: 4000,
      createdAt: "1 day ago",
      priority: "low"
    }
  ];

  const reportedUsers: ReportedUser[] = [
    {
      id: "user-1",
      name: "SuspectUser",
      avatar: "/placeholder.svg",
      violations: 3,
      currentStatus: "warned",
      reportCount: 5,
      lastReportDate: "25 minutes ago"
    },
    {
      id: "user-2",
      name: "AimSuspect",
      avatar: "/placeholder.svg",
      violations: 2,
      currentStatus: "active",
      reportCount: 2,
      lastReportDate: "2 hours ago"
    },
    {
      id: "user-3",
      name: "ToxicGamer",
      avatar: "/placeholder.svg",
      violations: 7,
      currentStatus: "suspended",
      reportCount: 12,
      lastReportDate: "5 hours ago"
    },
    {
      id: "user-4",
      name: "Disconnector",
      avatar: "/placeholder.svg",
      violations: 4,
      currentStatus: "active",
      reportCount: 4,
      lastReportDate: "1 day ago"
    },
    {
      id: "user-5",
      name: "CheatMaster",
      avatar: "/placeholder.svg",
      violations: 15,
      currentStatus: "banned",
      reportCount: 23,
      lastReportDate: "3 days ago"
    }
  ];

  const filteredDisputes = disputes.filter(dispute => {
    const matchesQuery = 
      dispute.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.againstPlayer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.matchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.map.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesQuery && (statusFilter === "all" || dispute.status === statusFilter);
  });

  const filteredUsers = reportedUsers.filter(user => {
    const matchesQuery = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesQuery && (statusFilter === "all" || user.currentStatus === statusFilter);
  });

  // Analytics data
  const analyticsCards = [
    {
      title: "Active Disputes",
      value: "17",
      change: "+3",
      trend: "up",
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
    },
    {
      title: "Resolved Today",
      value: "24",
      change: "+8",
      trend: "up",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      title: "Avg. Resolution Time",
      value: "1.8h",
      change: "-0.3h",
      trend: "down",
      icon: <Clock className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Flagged Accounts",
      value: "9",
      change: "+2",
      trend: "up",
      icon: <Flag className="h-5 w-5 text-red-500" />
    }
  ];

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Moderator Panel</h1>
            <p className="text-gray-400 mt-2">Manage disputes, monitor users, and maintain fair play</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-tacktix-blue/10 flex items-center gap-1 px-3 py-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>3 High Priority</span>
            </Badge>
            <Button variant="gradient" size="sm" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Moderation Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {analyticsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <p className={`text-xs flex items-center ${card.trend === 'up' ? 'text-green-500' : 'text-tacktix-blue'}`}>
                    {card.change} from yesterday
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-tacktix-dark-deeper flex items-center justify-center">
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search disputes or users..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="active">Active</option>
                <option value="warned">Warned</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
            <TabsList className="bg-tacktix-dark-deeper">
              <TabsTrigger value="disputes" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Active Disputes
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Reported Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {tab === "disputes" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Match Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={dispute.reportedBy.avatar} alt={dispute.reportedBy.name} />
                            <AvatarFallback>{dispute.reportedBy.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">vs</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={dispute.againstPlayer.avatar} alt={dispute.againstPlayer.name} />
                            <AvatarFallback>{dispute.againstPlayer.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{dispute.createdAt}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dispute.type === "result" && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Result Dispute
                        </Badge>
                      )}
                      {dispute.type === "cheating" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          Cheating Report
                        </Badge>
                      )}
                      {dispute.type === "behavior" && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          Behavior Report
                        </Badge>
                      )}
                      {dispute.type === "technical" && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Technical Issue
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{dispute.mode}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>{dispute.map}</span>
                          <span>•</span>
                          <span>₦{dispute.betAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dispute.status === "pending" && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending Review
                        </Badge>
                      )}
                      {dispute.status === "reviewing" && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Under Review
                        </Badge>
                      )}
                      {dispute.status === "resolved" && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Resolved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{dispute.reportedBy.name}</span>
                        <span className="text-xs text-red-400">reported</span>
                        <span className="font-medium">{dispute.againstPlayer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dispute.priority === "high" && (
                        <Badge variant="destructive" size="sm">
                          High
                        </Badge>
                      )}
                      {dispute.priority === "medium" && (
                        <Badge variant="badge" size="sm">
                          Medium
                        </Badge>
                      )}
                      {dispute.priority === "low" && (
                        <Badge variant="outline" size="sm">
                          Low
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="gradient" size="sm" className="h-8">
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredDisputes.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No disputes found</h3>
                <p className="text-gray-400 text-center">All disputes matching your filters have been resolved</p>
              </div>
            )}
          </Card>
        )}

        {tab === "users" && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Report Count</TableHead>
                  <TableHead>Last Report</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          user.violations > 10 ? 'text-red-500' : 
                          user.violations > 5 ? 'text-orange-500' : 
                          user.violations > 0 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {user.violations}
                        </span>
                        <span className="text-xs text-gray-400">offenses</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.currentStatus === "active" && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      )}
                      {user.currentStatus === "warned" && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Warned
                        </Badge>
                      )}
                      {user.currentStatus === "suspended" && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Suspended
                        </Badge>
                      )}
                      {user.currentStatus === "banned" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          Banned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span>{user.reportCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">{user.lastReportDate}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          View History
                        </Button>
                        <Button 
                          variant={user.currentStatus === "banned" ? "secondary" : "destructive"} 
                          size="sm" 
                          className="h-8"
                        >
                          {user.currentStatus === "active" ? "Warn" : 
                           user.currentStatus === "warned" ? "Suspend" :
                           user.currentStatus === "suspended" ? "Ban" : "Unban"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center">
                <Users className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No users found</h3>
                <p className="text-gray-400 text-center">Try adjusting your search criteria</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ModeratorPanel;
