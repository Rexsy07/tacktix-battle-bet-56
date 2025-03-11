
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Calendar, Filter, ChevronDown, Trophy, X, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

const History = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  
  const matches = [
    {
      id: "match_12345",
      date: "Dec 12, 2023",
      time: "3:45 PM",
      mode: "Search & Destroy",
      map: "Standoff",
      betAmount: "₦5,000",
      result: "win",
      opponent: "DeadlyAssault",
      score: "6-4",
      earnings: "+₦4,750"
    },
    {
      id: "match_12346",
      date: "Dec 10, 2023",
      time: "2:30 PM",
      mode: "Hardpoint",
      map: "Nuketown",
      betAmount: "₦2,000",
      result: "loss",
      opponent: "FragMaster",
      score: "150-200",
      earnings: "-₦2,000"
    },
    {
      id: "match_12347",
      date: "Dec 9, 2023",
      time: "7:15 PM",
      mode: "Battle Royale",
      map: "Isolated",
      betAmount: "₦3,000",
      result: "win",
      opponent: "ShadowNinja",
      score: "1st place",
      earnings: "+₦2,850"
    },
    {
      id: "match_12348",
      date: "Dec 8, 2023",
      time: "5:20 PM",
      mode: "Domination",
      map: "Terminal",
      betAmount: "₦4,000",
      result: "win",
      opponent: "TacticalOps",
      score: "200-150",
      earnings: "+₦3,800"
    },
    {
      id: "match_12349",
      date: "Dec 6, 2023",
      time: "8:45 AM",
      mode: "Team Deathmatch",
      map: "Shipment",
      betAmount: "₦1,000",
      result: "loss",
      opponent: "EliteWarrior",
      score: "35-50",
      earnings: "-₦1,000"
    },
    {
      id: "match_12350",
      date: "Dec 5, 2023",
      time: "9:30 PM",
      mode: "Gunfight",
      map: "Pine",
      betAmount: "₦5,000",
      result: "win",
      opponent: "StealthKiller",
      score: "6-3",
      earnings: "+₦4,750"
    }
  ];
  
  const filteredMatches = filterStatus === "all" 
    ? matches 
    : matches.filter(match => match.result === filterStatus);

  return (
    <Layout>
      <div className="py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Match History</h1>
            <p className="text-gray-400">View your past matches and results</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex items-center">
              <Calendar size={18} className="mr-2" />
              Date Range
              <ChevronDown size={16} className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="flex items-center">
              <Filter size={18} className="mr-2" />
              Filters
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="glass-card rounded-lg flex items-center p-2 focus-within:ring-2 focus-within:ring-tacktix-blue/50 focus-within:border-tacktix-blue">
            <Search size={20} className="text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search by mode, map, or opponent..."
              className="bg-transparent border-none outline-none py-2 px-3 w-full text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {/* Result Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Matches" },
            { id: "win", label: "Wins" },
            { id: "loss", label: "Losses" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-tacktix-blue text-white font-medium"
                  : "bg-tacktix-dark-light text-gray-300 hover:bg-tacktix-dark hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Match History */}
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="glass-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                  <div className="text-sm text-gray-400 mb-1 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {match.date}, {match.time}
                  </div>
                  <h3 className="font-bold text-white text-lg">{match.mode}</h3>
                  <div className="text-gray-400 text-sm mt-1">
                    {match.map}
                  </div>
                </div>
                
                <div className="md:w-1/2 p-5 flex flex-col md:flex-row justify-between items-center border-b md:border-b-0 md:border-r border-white/5">
                  <div className="text-center mb-4 md:mb-0">
                    <div className="text-sm text-gray-400 mb-1">You</div>
                    <div className="inline-block h-10 w-10 bg-tacktix-blue rounded-full flex items-center justify-center text-sm font-medium">
                      Y
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`text-sm font-medium mb-2 px-3 py-1 rounded-full ${
                      match.result === "win" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-tacktix-red/20 text-tacktix-red"
                    }`}>
                      {match.result === "win" ? "WIN" : "LOSS"}
                    </div>
                    <div className="text-xl font-bold text-white">{match.score}</div>
                    <div className="text-xs text-gray-400 mt-1">Bet: {match.betAmount}</div>
                  </div>
                  
                  <div className="text-center mt-4 md:mt-0">
                    <div className="text-sm text-gray-400 mb-1">Opponent</div>
                    <div className="inline-block h-10 w-10 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium">
                      {match.opponent.charAt(0)}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/4 p-5 flex flex-col justify-center items-center md:items-end">
                  <div className="text-sm text-gray-400 mb-2">Earnings</div>
                  <div className={`text-xl font-bold ${
                    match.earnings.startsWith("+") ? "text-green-500" : "text-tacktix-red"
                  }`}>
                    {match.earnings}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 text-xs">
                    Match Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default History;
