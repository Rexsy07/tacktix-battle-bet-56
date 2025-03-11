
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Menu, X, User, Wallet, Trophy, Home, History, Search, LogIn } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Matchmaking", path: "/matchmaking", icon: <Search className="w-4 h-4 mr-2" /> },
    { name: "Wallet", path: "/wallet", icon: <Wallet className="w-4 h-4 mr-2" /> },
    { name: "History", path: "/history", icon: <History className="w-4 h-4 mr-2" /> },
    { name: "Leaderboards", path: "/leaderboards", icon: <Trophy className="w-4 h-4 mr-2" /> },
  ];

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
            {navLinks.map((link) => (
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
            <Button variant="ghost" size="sm" className="text-sm">
              <Link to="/sign-in" className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button variant="gradient" size="sm" animation="pulseglow" className="text-sm">
              <Link to="/sign-up">Get Started</Link>
            </Button>
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
            {navLinks.map((link) => (
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
