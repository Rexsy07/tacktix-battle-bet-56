
import { useState, useEffect } from "react";
import LeaderboardTable from "@/components/ui/LeaderboardTable";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Leaderboard = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard_stats')
          .select(`
            *,
            profiles:id(username, avatar_url)
          `)
          .order('total_earnings', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        // Format data for LeaderboardTable
        const formattedData = data.map((player, index) => ({
          position: index + 1,
          name: player.profiles?.username || "Unknown Player",
          matches: player.matches_played,
          winRate: player.matches_played > 0 
            ? `${Math.round((player.matches_won / player.matches_played) * 100)}%` 
            : "0%",
          earnings: `₦${player.total_earnings.toFixed(2)}`
        }));

        setTopPlayers(formattedData);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Top Earners</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The highest earning players on TacktixEdge this month.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-tacktix-blue" />
          </div>
        ) : (
          <LeaderboardTable players={topPlayers} />
        )}
      </div>
    </section>
  );
};

export default Leaderboard;
