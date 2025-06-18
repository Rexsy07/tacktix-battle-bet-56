
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import DepositInstructions from "./DepositInstructions";
import PendingDeposits from "./PendingDeposits";

interface DepositFormProps {
  onSuccess?: () => void;
}

const DepositForm = ({ onSuccess }: DepositFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const depositAmount = parseFloat(amount);
      
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (depositAmount < 100) {
        throw new Error("Minimum deposit amount is ₦100");
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to make a deposit");
      }
      
      // Create a pending deposit transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          amount: depositAmount,
          type: "deposit",
          status: "pending",
          description: `Bank transfer deposit request for ₦${depositAmount.toLocaleString()}`
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      setTransactionId(transaction.id);
      setShowInstructions(true);
      
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to process deposit request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowInstructions(false);
    setAmount("");
    setTransactionId("");
  };

  const handleConfirmSent = () => {
    setShowInstructions(false);
    setAmount("");
    setTransactionId("");
    onSuccess?.();
    
    toast({
      title: "Transfer Confirmed",
      description: "We will verify your transfer and credit your account within 24 hours",
    });
  };

  if (showInstructions) {
    return (
      <DepositInstructions
        amount={parseFloat(amount)}
        transactionId={transactionId}
        onBack={handleBack}
        onConfirmSent={handleConfirmSent}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PendingDeposits />
      
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>Add money to your wallet via bank transfer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDepositRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min. ₦100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="100"
                max="1000000"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Minimum: ₦100 • Maximum: ₦1,000,000
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Next: Get Bank Details
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-gray-500 space-y-2">
          <p>• Make a bank transfer to our account with your User ID</p>
          <p>• Deposits are verified within 1-24 hours during business days</p>
          <p>• All transactions are secured and monitored</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DepositForm;
