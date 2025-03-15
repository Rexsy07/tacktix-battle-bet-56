
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, Loader2, Trophy, Calendar, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface PlanOption {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isPopular?: boolean;
}

interface VIPPlansProps {
  isVIP?: boolean;
  onSubscribe?: () => void;
}

const plans: PlanOption[] = [
  {
    id: "monthly",
    name: "Monthly VIP",
    price: 2500,
    duration: 1,
    features: [
      "Reduced platform fees (1.8%)",
      "VIP badge on your profile",
      "Early access to new features",
      "Priority customer support"
    ]
  },
  {
    id: "quarterly",
    name: "Quarterly VIP",
    price: 6500,
    duration: 3,
    features: [
      "Reduced platform fees (1.5%)",
      "VIP badge on your profile",
      "Early access to new features",
      "Priority customer support",
      "Exclusive VIP tournaments"
    ],
    isPopular: true
  },
  {
    id: "annual",
    name: "Annual VIP",
    price: 20000,
    duration: 12,
    features: [
      "Lowest platform fees (1%)",
      "VIP badge on your profile",
      "Early access to new features",
      "Priority customer support",
      "Exclusive VIP tournaments",
      "Free monthly tokens",
      "Custom profile styling"
    ]
  }
];

const VIPPlans = ({ isVIP = false, onSubscribe }: VIPPlansProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("quarterly");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe to VIP",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }
      
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) {
        throw new Error("Invalid plan selected");
      }
      
      // Call RPC function to create VIP subscription
      const { error } = await supabase.rpc(
        "create_vip_subscription",
        {
          user_uuid: session.user.id,
          level: plan.id,
          duration_months: plan.duration,
          payment_amount: plan.price
        }
      );
      
      if (error) throw error;
      
      toast({
        title: "Subscription Successful!",
        description: `You are now a ${plan.name} member`,
        variant: "default",
      });
      
      if (onSubscribe) {
        onSubscribe();
      }
      
      // Reload to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      let errorMessage = "Failed to process subscription";
      
      if (error.message.includes("Insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet. Please deposit more funds before subscribing.";
      }
      
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddFunds = () => {
    navigate("/wallet");
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2 max-w-md mx-auto">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold">VIP Membership</h2>
        <p className="text-gray-400">
          Upgrade to VIP for exclusive benefits, reduced fees, and premium features.
        </p>
      </div>
      
      <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Label
            key={plan.id}
            htmlFor={plan.id}
            className={`cursor-pointer ${
              selectedPlan === plan.id ? "ring-2 ring-tacktix-blue" : ""
            }`}
          >
            <Card className={`h-full ${plan.isPopular ? "bg-gradient-to-b from-tacktix-dark-light to-tacktix-dark" : ""}`}>
              {plan.isPopular && (
                <div className="bg-yellow-500 text-tacktix-dark absolute right-4 top-0 text-xs font-bold px-2 py-0.5 rounded-b-md">
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-2xl font-bold text-tacktix-blue">₦{plan.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm mb-1">/ {plan.duration} month{plan.duration > 1 ? "s" : ""}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center pt-3">
                <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {plan.duration} Month{plan.duration > 1 ? "s" : ""}
                </div>
              </CardFooter>
            </Card>
          </Label>
        ))}
      </RadioGroup>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
        {isVIP ? (
          <Button className="max-w-xs mx-auto" variant="outline" disabled>
            <Star className="mr-2 h-4 w-4" />
            Already a VIP Member
          </Button>
        ) : (
          <>
            <Button 
              className="md:max-w-xs" 
              onClick={handleSubscribe} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="md:max-w-xs" 
              onClick={handleAddFunds}
            >
              Add Funds to Wallet
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VIPPlans;
