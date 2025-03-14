
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import Wallet from "./pages/Wallet";
import History from "./pages/History";
import Matchmaking from "./pages/Matchmaking";
import Leaderboards from "./pages/Leaderboards";
import MatchDetails from "./pages/MatchDetails";
import DuelChallenge from "./pages/DuelChallenge";
import VipDashboard from "./pages/VipDashboard";
import ModeratorPanel from "./pages/ModeratorPanel";
import ForgotPassword from "./pages/ForgotPassword";
import HowItWorks from "./pages/HowItWorks";
import FeatureMatchDetails from "./pages/FeatureMatchDetails";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/history" element={<History />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
          <Route path="/duel-challenge" element={<DuelChallenge />} />
          <Route path="/vip-dashboard" element={<VipDashboard />} />
          <Route path="/moderator-panel" element={<ModeratorPanel />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/featured-match/:matchId" element={<FeatureMatchDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
