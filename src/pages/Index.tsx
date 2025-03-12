
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedMatches from "@/components/home/FeaturedMatches";
import GameModes from "@/components/home/GameModes";
import LiveMatches from "@/components/home/LiveMatches";
import Leaderboard from "@/components/home/Leaderboard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Layout fullWidth>
      <HeroSection />
      <LiveMatches />
      <FeaturedMatches />
      <GameModes />
      <Leaderboard />
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-tacktix-blue rounded-full filter blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tacktix-red rounded-full filter blur-[150px] opacity-10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-xl p-8 lg:p-16 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Test Your Skills?</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of Call of Duty Mobile players competing and earning real money on TacktixEdge.
            </p>
            <Link to={isAuthenticated ? "/matchmaking" : "/sign-up"}>
              <Button variant="gradient" animation="pulseglow" size="lg" className="font-semibold">
                {isAuthenticated ? "Find Matches" : "Get Started Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
