
import { useState } from "react";
import MatchTypeCard from "@/components/ui/MatchTypeCard";
import { Target, Bomb, Flag, Users, Crosshair, Map as MapIcon } from "lucide-react";

const GameModes = () => {
  const [activeMode, setActiveMode] = useState(0);
  
  const modes = [
    {
      title: "Search & Destroy",
      icon: <Bomb size={24} />,
      maps: ["Standoff", "Crash", "Crossfire", "Firing Range", "Summit"]
    },
    {
      title: "Hardpoint",
      icon: <Target size={24} />,
      maps: ["Nuketown", "Raid", "Hijacked", "Takeoff", "Scrapyard"]
    },
    {
      title: "Domination",
      icon: <Flag size={24} />,
      maps: ["Terminal", "Hackney Yard", "Meltdown", "Tunisia", "Highrise"]
    },
    {
      title: "Team Deathmatch",
      icon: <Users size={24} />,
      maps: ["Killhouse", "Shipment", "Rust", "Dome", "Coastal"]
    },
    {
      title: "Gunfight",
      icon: <Crosshair size={24} />,
      maps: ["King", "Pine", "Gulag Showers", "Docks", "Saloon"]
    },
    {
      title: "Battle Royale",
      icon: <MapIcon size={24} />,
      maps: ["Isolated", "Alcatraz"]
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Competitive Game Modes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose from various game modes and maps to test your skills and earn rewards.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-10">
          {modes.map((mode, index) => (
            <MatchTypeCard
              key={index}
              title={mode.title}
              icon={mode.icon}
              isActive={index === activeMode}
              onClick={() => setActiveMode(index)}
            />
          ))}
        </div>
        
        <div className="glass-card rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-tacktix-blue mb-4">{modes[activeMode].title} Maps</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {modes[activeMode].maps.map((map, index) => (
              <div 
                key={index}
                className="bg-tacktix-dark-light rounded-lg p-4 text-center hover:bg-tacktix-dark-light/80 transition-colors"
              >
                <div className="h-12 w-12 bg-tacktix-dark rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapIcon size={20} className="text-tacktix-blue" />
                </div>
                <p className="text-sm font-medium text-white">{map}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameModes;
