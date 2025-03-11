
import { ArrowRight } from "lucide-react";
import GameCard from "@/components/ui/GameCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturedMatches = () => {
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
      isLive: true,
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
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Matches</h2>
          <Link to="/matchmaking">
            <Button variant="ghost" size="sm" className="text-sm">
              View All
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {matchData.map((match, index) => (
            <GameCard
              key={index}
              mode={match.mode}
              map={match.map}
              betAmount={match.betAmount}
              teamSize={match.teamSize}
              timeLeft={match.timeLeft}
              isLive={match.isLive}
              players={match.players}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;
