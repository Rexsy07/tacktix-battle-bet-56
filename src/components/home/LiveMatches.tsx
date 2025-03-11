
import { useState, useEffect } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LiveMatches = () => {
  const [matches, setMatches] = useState([
    {
      id: 1,
      mode: "Search & Destroy",
      map: "Standoff",
      betAmount: "₦5,000",
      teamSize: "5v5",
      player1: "xSniperKing",
      player2: "DeadlyAssault",
      score: "4 - 3",
      viewers: 26,
      timeElapsed: "08:45"
    },
    {
      id: 2,
      mode: "Hardpoint",
      map: "Nuketown",
      betAmount: "₦10,000",
      teamSize: "3v3",
      player1: "FragMaster",
      player2: "ShadowNinja",
      score: "145 - 132",
      viewers: 42,
      timeElapsed: "04:20"
    },
    {
      id: 3,
      mode: "Gunfight",
      map: "Pine",
      betAmount: "₦15,000",
      teamSize: "2v2",
      player1: "StealthKiller",
      player2: "NinjaWarrior",
      score: "5 - 4",
      viewers: 37,
      timeElapsed: "12:15"
    }
  ]);

  useEffect(() => {
    // This simulates live score updates
    const interval = setInterval(() => {
      setMatches(prev => 
        prev.map(match => {
          // Randomly update scores for demonstration purposes
          const [score1, score2] = match.score.split(' - ').map(Number);
          let newScore1 = score1;
          let newScore2 = score2;
          
          if (Math.random() > 0.7) {
            if (match.mode === "Search & Destroy" || match.mode === "Gunfight") {
              if (score1 < 6) newScore1 += 1;
            } else {
              newScore1 += Math.floor(Math.random() * 15);
            }
          }
          
          if (Math.random() > 0.7) {
            if (match.mode === "Search & Destroy" || match.mode === "Gunfight") {
              if (score2 < 6) newScore2 += 1;
            } else {
              newScore2 += Math.floor(Math.random() * 15);
            }
          }
          
          // Update viewers randomly
          const newViewers = match.viewers + (Math.random() > 0.5 ? 1 : -1);
          
          // Update time elapsed
          const [mins, secs] = match.timeElapsed.split(':').map(Number);
          let newSecs = secs + 1;
          let newMins = mins;
          if (newSecs >= 60) {
            newSecs = 0;
            newMins++;
          }
          
          return {
            ...match,
            score: `${newScore1} - ${newScore2}`,
            viewers: Math.max(newViewers, 5),
            timeElapsed: `${String(newMins).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`
          };
        })
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-tacktix-dark to-tacktix-dark-deeper">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Live Matches</h2>
          <Link to="/matchmaking">
            <Button variant="ghost" size="sm" className="text-sm">
              View All
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="glass-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-2 w-2 bg-tacktix-red rounded-full animate-pulse"></div>
                    <span className="text-tacktix-red text-xs font-medium">LIVE</span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{match.mode}</h3>
                  <div className="text-gray-400 text-sm mt-1">
                    {match.map} - {match.teamSize}
                  </div>
                  <div className="text-tacktix-blue font-bold mt-3">{match.betAmount}</div>
                </div>
                
                <div className="md:w-2/4 p-5 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5">
                  <div className="flex items-center justify-center w-full">
                    <div className="text-center flex-1">
                      <div className="inline-block h-10 w-10 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mb-2">
                        {match.player1.charAt(0)}
                      </div>
                      <div className="text-white font-medium">{match.player1}</div>
                    </div>
                    
                    <div className="mx-4 py-2 px-4 bg-tacktix-dark-light rounded-lg">
                      <div className="text-xl font-bold text-white">{match.score}</div>
                      <div className="text-xs text-gray-400 mt-1">{match.timeElapsed}</div>
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="inline-block h-10 w-10 bg-tacktix-dark-light rounded-full flex items-center justify-center text-sm font-medium mb-2">
                        {match.player2.charAt(0)}
                      </div>
                      <div className="text-white font-medium">{match.player2}</div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/4 p-5 flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center mb-3 md:mb-0">
                    <Eye size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">{match.viewers} watching</span>
                  </div>
                  
                  <Button variant="gradient" size="sm">
                    Spectate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;
