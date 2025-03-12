
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Wallet, Trophy, Home, History, Search, LogIn, LogOut, Shield, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status on mount and when auth state changes
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "Matchmaking", path: "/matchmaking", icon: <Search className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "Wallet", path: "/wallet", icon: <Wallet className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "History", path: "/history", icon: <History className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "Leaderboards", path: "/leaderboards", icon: <Trophy className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "VIP", path: "/vip-dashboard", icon: <Flame className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "Moderator", path: "/moderator-panel", icon: <Shield className="w-4 h-4 mr-2" />, showAlways: false },
  ];

  const filteredNavLinks = navLinks.filter(link => link.showAlways || isAuthenticated);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-navbar py-2" : "py-4 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-tacktix-blue to-tacktix-blue-dark flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-lg">T</span>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-tacktix-red rounded-full animate-pulse"></span>
            </div>
            <span className="font-extrabold text-xl text-gradient">TacktixEdge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm flex items-center transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-tacktix-blue font-medium"
                    : "text-gray-300 hover:text-white hover:bg-tacktix-dark-light"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" className="text-sm" onClick={handleLogout}>
                <div className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </div>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-sm">
                  <Link to="/sign-in" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="gradient" size="sm" animation="pulseglow" className="text-sm">
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-200 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass animate-fade-in p-4 mt-1">
          <div className="flex flex-col space-y-3 pt-2 pb-4">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-3 rounded-md font-medium flex items-center ${
                  location.pathname === link.path
                    ? "bg-tacktix-blue/20 text-tacktix-blue"
                    : "text-gray-300 hover:bg-tacktix-dark-light hover:text-white"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button variant="ghost" className="w-full text-sm justify-start" onClick={handleLogout}>
                <div className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </div>
              </Button>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-3">
                <Button variant="ghost" className="w-full text-sm">
                  <Link to="/sign-in" className="flex items-center w-full justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="gradient" animation="pulseglow" className="w-full text-sm">
                  <Link to="/sign-up" className="w-full">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
