
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SignIn = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      
      if (email && password) {
        toast({
          title: "Success!",
          description: "You've successfully signed in.",
          variant: "default",
        });
        // Would redirect to dashboard in real app
      } else {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome Back to <span className="text-gradient">TacktixEdge</span></h1>
            <p className="text-gray-400">Sign in to continue your competitive journey</p>
          </div>

          <div className="glass-card rounded-xl p-6 mb-6">
            <form onSubmit={handleSignIn}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      className="pl-10 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-xs text-tacktix-blue hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      className="pl-10 bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-tacktix-blue hover:underline font-medium">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
