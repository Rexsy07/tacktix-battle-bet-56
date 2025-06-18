import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FindMatchTab from "@/components/matchmaking/FindMatchTab";
import CreateMatchTab from "@/components/matchmaking/CreateMatchTab";
import BrowseMatchesTab from "@/components/matchmaking/BrowseMatchesTab";

const Matchmaking = () => {
  const [activeTab, setActiveTab] = useState("find");
  const [gameModes, setGameModes] = useState(["Casual", "Ranked"]);
  const [activeMode, setActiveMode] = useState("Casual");
  const [selectedMap, setSelectedMap] = useState("Summoner's Rift");
  const [entryFee, setEntryFee] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [matchTitle, setMatchTitle] = useState("");
  const [matchDescription, setMatchDescription] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [lobbyCode, setLobbyCode] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [isVIPMatch, setIsVIPMatch] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tacktix-blue mb-2">Find Your Perfect Match</h1>
          <p className="text-gray-400">
            Challenge players, create tournaments, or join exciting matches
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find">Find Match</TabsTrigger>
            <TabsTrigger value="create">Create Match</TabsTrigger>
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-6">
            <FindMatchTab />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateMatchTab
              gameModes={gameModes}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              selectedMap={selectedMap}
              setSelectedMap={setSelectedMap}
              entryFee={entryFee}
              setEntryFee={setEntryFee}
              maxPlayers={maxPlayers}
              setMaxPlayers={setMaxPlayers}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              matchTitle={matchTitle}
              setMatchTitle={setMatchTitle}
              matchDescription={matchDescription}
              setMatchDescription={setMatchDescription}
              teamSize={teamSize}
              setTeamSize={setTeamSize}
              lobbyCode={lobbyCode}
              setLobbyCode={setLobbyCode}
              hostNotes={hostNotes}
              setHostNotes={setHostNotes}
              isVIPMatch={isVIPMatch}
              setIsVIPMatch={setIsVIPMatch}
            />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <BrowseMatchesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Matchmaking;
