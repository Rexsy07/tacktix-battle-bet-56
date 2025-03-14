
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import GameCard from "@/components/ui/GameCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const FeaturedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedMatches = async () => {
      try {
        // Fetch 4 pending matches with explicitly named foreign key relationships
        const { data, error } = await supabase
          .from("matches")
          .select(`
            id,
            game_mode,
            map_name,
            bet_amount,
            created_at,
            status,
            host:profiles!matches_host_id_fkey(username),
            opponent:profiles!matches_opponent_id_fkey(username)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(4);
        
        if (error) throw error;
        
        // Transform the data to match the format expected by GameCard
        const formattedMatches = data.map(match => ({
          id: match.id,
          mode: match.game_mode,
          map: match.map_name,
          betAmount: `₦${match.bet_amount.toFixed(0)}`,
          teamSize: match.game_mode.includes("Battle Royale") ? "Squads" : "5v5",
          timeLeft: "12 min", // This would need to be calculated based on creation time
          players: [
            { name: match.host?.username || "Unknown", winRate: "N/A" },
            match.opponent ? { name: match.opponent.username, winRate: "N/A" } : null
          ].filter(Boolean)
        }));
        
        setMatches(formattedMatches);
      } catch (error) {
        console.error("Error fetching featured matches:", error);
        toast({
          title: "Error",
          description: "Failed to load featured matches",
          variant: "destructive",
        });
        
        // Fallback to static data
        setMatches([
          {
            id: "fallback-1",
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
            id: "fallback-2",
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
            id: "fallback-3",
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
            id: "fallback-4",
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
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedMatches();
  }, [toast]);

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
          {loading ? (
            // Show skeleton loaders while loading
            Array(4).fill(0).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="bg-tacktix-dark-light rounded-lg h-64 animate-pulse"
              />
            ))
          ) : (
            matches.map((match, index) => (
              <Link key={match.id || index} to={`/match/${match.id}`}>
                <GameCard
                  mode={match.mode}
                  map={match.map}
                  betAmount={match.betAmount}
                  teamSize={match.teamSize}
                  timeLeft={match.timeLeft}
                  isLive={match.isLive}
                  players={match.players}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;
