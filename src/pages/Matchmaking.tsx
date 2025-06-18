
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreateMatchTab from "@/components/matchmaking/CreateMatchTab";
import BrowseMatchesTab from "@/components/matchmaking/BrowseMatchesTab";

const Matchmaking = () => {
  const [activeTab, setActiveTab] = useState("create");

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Match</TabsTrigger>
            <TabsTrigger value="browse">Browse Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <CreateMatchTab />
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
