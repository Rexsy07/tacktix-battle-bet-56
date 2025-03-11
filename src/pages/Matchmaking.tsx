
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Search, Plus, Target, Bomb, Flag, Users, Crosshair, Map, Filter, ChevronDown } from "lucide-react";
import GameCard from "@/components/ui/GameCard";
import MatchTypeCard from "@/components/ui/MatchTypeCard";

const Matchmaking = () => {
  const [activeMode, setActiveMode] = useState("all");
  
  const modes = [
    { id: "all", title: "All Modes", icon: <Target size={24} /> },
    { id: "snd", title: "Search & Destroy", icon: <Bomb size={24} /> },
    { id: "hp", title: "Hardpoint", icon: <Target size={24} /> },
    { id: "dom", title: "Domination", icon: <Flag size={24} /> },
    { id: "tdm", title: "Team Deathmatch", icon: <Users size={24} /> },
    { id: "gf", title: "Gunfight", icon: <Crosshair size={24} /> },
  ];
  
  const matchData = [
    {
      mode: "Search & Destroy",
      map: "Standoff",
      betAmount: "₦5,000",
      teamSize: "5v5",
      timeLeft: "12 min",
      players: [
        { name: "xSniperKing", winRate: "78%" },
        { name: "DeadlyAssault", winRate: "65%" }
      ]
    },
    {
      mode: "Hardpoint",
      map: "Nuketown",
      betAmount: "₦10,000",
      teamSize: "3v3",
      timeLeft: "5 min",
      players: [
        { name: "FragMaster", winRate: "82%" },
        { name: "ShadowNinja", winRate: "75%" }
      ]
    },
    {
      mode: "Battle Royale",
      map: "Isolated",
      betAmount: "₦3,000",
      teamSize: "Squads",
      timeLeft: "5 min",
      players: [
        { name: "VictoryHunter", winRate: "70%" },
        { name: "GhostSniper", winRate: "63%" }
      ]
    },
    {
      mode: "Domination",
      map: "Firing Range",
      betAmount: "₦2,000",
      teamSize: "5v5",
      timeLeft: "22 min",
      players: [
        { name: "EliteWarrior", winRate: "69%" },
        { name: "TacticalOps", winRate: "73%" }
      ]
    },
    {
      mode: "Team Deathmatch",
      map: "Shipment",
      betAmount: "₦4,000",
      teamSize: "5v5",
      timeLeft: "8 min",
      players: [
        { name: "SteadyAim", winRate: "71%" },
        { name: "PrecisionFire", winRate: "68%" }
      ]
    },
    {
      mode: "Gunfight",
      map: "Pine",
      betAmount: "₦5,000",
      teamSize: "2v2",
      timeLeft: "15 min",
      players: [
        { name: "QuickScope", winRate: "77%" },
        { name: "SharpShooter", winRate: "76%" }
      ]
    },
    {
      mode: "Search & Destroy",
      map: "Crash",
      betAmount: "₦3,000",
      teamSize: "5v5",
      timeLeft: "10 min",
      players: [
        { name: "TacticalPlanner", winRate: "72%" },
        { name: "DefuseKing", winRate: "68%" }
      ]
    },
    {
      mode: "Hardpoint",
      map: "Raid",
      betAmount: "₦7,000",
      teamSize: "5v5",
      timeLeft: "18 min",
      players: [
        { name: "ObjectiveMaster", winRate: "74%" },
        { name: "PointDefender", winRate: "69%" }
      ]
    }
  ];
  
  const filteredMatches = activeMode === "all" 
    ? matchData 
    : matchData.filter(match => {
        if (activeMode === "snd") return match.mode === "Search & Destroy";
        if (activeMode === "hp") return match.mode === "Hardpoint";
        if (activeMode === "dom") return match.mode === "Domination";
        if (activeMode === "tdm") return match.mode === "Team Deathmatch";
        if (activeMode === "gf") return match.mode === "Gunfight";
        return true;
      });

  return (
    <Layout>
      <div className="py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Find Matches</h1>
            <p className="text-gray-400">Browse and join available matches or create your own</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex items-center">
              <Filter size={18} className="mr-2" />
              Filters
              <ChevronDown size={16} className="ml-2" />
            </Button>
            <Button variant="gradient" size="lg" className="flex items-center">
              <Plus size={18} className="mr-2" />
              Create Match
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-10">
          <div className="glass-card rounded-lg flex items-center p-2 focus-within:ring-2 focus-within:ring-tacktix-blue/50 focus-within:border-tacktix-blue">
            <Search size={20} className="text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search by mode, map, or player..."
              className="bg-transparent border-none outline-none py-2 px-3 w-full text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {/* Game Mode Filter */}
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {modes.map((mode) => (
              <MatchTypeCard
                key={mode.id}
                title={mode.title}
                icon={mode.icon}
                isActive={mode.id === activeMode}
                onClick={() => setActiveMode(mode.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Available Matches */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Available Matches</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMatches.map((match, index) => (
              <GameCard
                key={index}
                mode={match.mode}
                map={match.map}
                betAmount={match.betAmount}
                teamSize={match.teamSize}
                timeLeft={match.timeLeft}
                players={match.players}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Matchmaking;
