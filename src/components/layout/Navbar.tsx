
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, History, Search, LogIn, LogOut, Shield, Flame, Home, Trophy, Wallet, MessageCircle, Megaphone, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getUserBalance } from "@/utils/wallet-utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user) {
        const balance = await getUserBalance(user.id);
        setUserBalance(balance);
      }
    };

    fetchUserBalance();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
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
    { name: "Matchmaking", path: "/matchmaking", icon: <Search className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "Tournaments", path: "/tournaments", icon: <Crown className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "Forum", path: "/forum", icon: <MessageCircle className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "Announcements", path: "/announcements", icon: <Megaphone className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "Profile", path: "/profile", icon: <User className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "History", path: "/history", icon: <History className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "Leaderboards", path: "/leaderboards", icon: <Trophy className="w-4 h-4 mr-2" />, showAlways: true },
    { name: "VIP", path: "/vip", icon: <Flame className="w-4 h-4 mr-2" />, showAlways: false },
    { name: "Moderator", path: "/moderator", icon: <Shield className="w-4 h-4 mr-2" />, showAlways: false },
  ];

  const filteredNavLinks = navLinks.filter(link => link.showAlways || user);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-navbar py-1" : "py-2 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-tacktix-blue to-tacktix-blue-dark flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-sm">T</span>
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-tacktix-red rounded-full animate-pulse"></span>
            </div>
            <span className="font-extrabold text-lg text-gradient">TacktixEdge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1.5 rounded-md text-sm flex items-center transition-all duration-200 ${
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
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/wallet">
                  <Button variant="ghost" size="sm" className="text-xs px-3 py-1.5 h-8">
                    <Wallet className="w-3 h-3 mr-1" />
                    ₦{userBalance.toLocaleString()}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={handleLogout}>
                  <LogOut className="w-3 h-3 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <Link to="/sign-in" className="flex items-center">
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="gradient" size="sm" animation="pulseglow" className="text-xs h-8">
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
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass animate-fade-in p-3 mt-1">
          <div className="flex flex-col space-y-2 pt-2 pb-3">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md font-medium flex items-center ${
                  location.pathname === link.path
                    ? "bg-tacktix-blue/20 text-tacktix-blue"
                    : "text-gray-300 hover:bg-tacktix-dark-light hover:text-white"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="pt-2 space-y-2">
                <Link to="/wallet" className="w-full">
                  <Button variant="ghost" className="w-full text-sm justify-start h-8">
                    <Wallet className="w-4 h-4 mr-2" />
                    Balance: ₦{userBalance.toLocaleString()}
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full text-sm justify-start h-8" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Button variant="ghost" className="w-full text-sm h-8">
                  <Link to="/sign-in" className="flex items-center w-full justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="gradient" animation="pulseglow" className="w-full text-sm h-8">
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
