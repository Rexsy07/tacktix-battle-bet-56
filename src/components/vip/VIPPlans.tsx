import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, Shield, Crown, Star, Diamond, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VIPPlan {
  id: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  name: string;
  price: number;
  duration: number; // months
  benefits: string[];
  isPopular?: boolean;
}

interface VIPPlansProps {
  currentWalletBalance: number;
  currentSubscription?: {
    level: string;
    endDate: string;
  };
  onSubscriptionChange: () => void;
}

const VIPPlans = ({ currentWalletBalance, currentSubscription, onSubscriptionChange }: VIPPlansProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<VIPPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const plans: VIPPlan[] = [
    {
      id: "bronze",
      level: "bronze",
      name: "Bronze VIP",
      price: 5000,
      duration: 1,
      benefits: [
        "Lower Transaction Fees",
        "Early Access to New Matches",
        "Basic VIP Profile Badge"
      ]
    },
    {
      id: "silver",
      level: "silver",
      name: "Silver VIP",
      price: 10000,
      duration: 1,
      benefits: [
        "5% Extra on Winnings",
        "Participate in Featured Matches",
        "VIP Support",
        "Silver VIP Profile Badge"
      ],
      isPopular: true
    },
    {
      id: "gold",
      level: "gold",
      name: "Gold VIP",
      price: 25000,
      duration: 3,
      benefits: [
        "10% Extra on Winnings",
        "No Transaction Fees",
        "Exclusive Monthly Tournaments",
        "Gold VIP Profile Badge",
        "Priority Support"
      ]
    },
    {
      id: "platinum",
      level: "platinum",
      name: "Platinum VIP",
      price: 50000,
      duration: 6,
      benefits: [
        "15% Extra on Winnings",
        "Exclusive High Stakes Matches",
        "Personal Account Manager",
        "Platinum VIP Profile Badge",
        "Custom Avatar Frames",
        "Unlimited Access to All Features"
      ]
    }
  ];
  
  const handleSelectPlan = (plan: VIPPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to subscribe");
      }
      
      if (currentWalletBalance < selectedPlan.price) {
        throw new Error("Insufficient funds. Please add more funds to your wallet.");
      }
      
      // Create VIP subscription
      const { data, error } = await supabase.rpc(
        "create_vip_subscription",
        {
          user_uuid: session.user.id,
          level: selectedPlan.level,
          duration_months: selectedPlan.duration,
          payment_amount: selectedPlan.price
        }
      );
      
      if (error) throw error;
      
      setIsDialogOpen(false);
      
      toast({
        title: "Subscription Successful",
        description: `You are now a ${selectedPlan.name} member!`,
        variant: "default",
      });
      
      // Refresh subscription status
      onSubscriptionChange();
      
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getPlanIcon = (level: string) => {
    switch (level) {
      case "bronze":
        return <Shield className="h-8 w-8 text-amber-600" />;
      case "silver":
        return <Crown className="h-8 w-8 text-gray-400" />;
      case "gold":
        return <Star className="h-8 w-8 text-yellow-500" />;
      case "platinum":
        return <Diamond className="h-8 w-8 text-blue-300" />;
      default:
        return <Shield className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const isCurrentPlan = (level: string) => {
    return currentSubscription?.level === level;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden ${plan.isPopular ? 'border-tacktix-blue/30 shadow-lg shadow-tacktix-blue/10' : ''}`}>
            {plan.isPopular && (
              <div className="absolute top-0 right-0">
                <Badge variant="default" className="rounded-none rounded-bl-lg py-1 px-3">
                  Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="mb-2">
                {getPlanIcon(plan.level)}
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>₦{plan.price.toLocaleString()} / {plan.duration} month{plan.duration > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <ul className="space-y-2">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-tacktix-blue mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={plan.isPopular ? "default" : "outline"} 
                className="w-full"
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan(plan.level)}
              >
                {isCurrentPlan(plan.level) ? "Current Plan" : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscribe to {selectedPlan?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to subscribe to the {selectedPlan?.name} plan for ₦{selectedPlan?.price.toLocaleString()} for {selectedPlan?.duration} month{selectedPlan?.duration && selectedPlan.duration > 1 ? 's' : ''}.
              <div className="mt-4 p-3 bg-tacktix-dark-light rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span>Wallet Balance:</span>
                  <span>₦{currentWalletBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Plan Cost:</span>
                  <span>₦{selectedPlan?.price.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center font-medium">
                  <span>Remaining Balance:</span>
                  <span className={`${(currentWalletBalance - (selectedPlan?.price || 0)) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ₦{(currentWalletBalance - (selectedPlan?.price || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              {(currentWalletBalance - (selectedPlan?.price || 0)) < 0 && (
                <div className="mt-2 text-red-500 text-sm">
                  Insufficient funds. Please add more funds to your wallet.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
              disabled={isProcessing || (currentWalletBalance - (selectedPlan?.price || 0)) < 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VIPPlans;
