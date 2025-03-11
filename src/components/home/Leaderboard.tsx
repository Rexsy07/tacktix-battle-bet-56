
import LeaderboardTable from "@/components/ui/LeaderboardTable";

const Leaderboard = () => {
  const topPlayers = [
    {
      position: 1,
      name: "xSniperKing",
      matches: 145,
      winRate: "78%",
      earnings: "₦125,750"
    },
    {
      position: 2,
      name: "DeadlyAssault",
      matches: 132,
      winRate: "72%",
      earnings: "₦98,500"
    },
    {
      position: 3,
      name: "ShadowNinja",
      matches: 128,
      winRate: "69%",
      earnings: "₦87,250"
    },
    {
      position: 4,
      name: "FragMaster",
      matches: 115,
      winRate: "65%",
      earnings: "₦76,300"
    },
    {
      position: 5,
      name: "TacticalOps",
      matches: 106,
      winRate: "61%",
      earnings: "₦64,800"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Top Earners</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The highest earning players on TacktixEdge this month.
          </p>
        </div>
        
        <LeaderboardTable players={topPlayers} />
      </div>
    </section>
  );
};

export default Leaderboard;
