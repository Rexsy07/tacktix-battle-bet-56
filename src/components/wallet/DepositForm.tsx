
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { addToBalance } from "@/utils/wallet-utils";

interface DepositFormProps {
  onSuccess?: () => void;
}

const DepositForm = ({ onSuccess }: DepositFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
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
      
      // Add to user's balance
      const { success, error: balanceError } = await addToBalance(session.user.id, depositAmount);
      
      if (!success) {
        throw new Error(balanceError || "Failed to add funds to wallet");
      }

      // Create a deposit transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          amount: depositAmount,
          type: "deposit",
          status: "completed",
          description: `Deposit via ${paymentMethod.replace('_', ' ')}`
        });
      
      if (transactionError) throw transactionError;
      
      setIsSuccess(true);
      toast({
        title: "Deposit Successful",
        description: `₦${depositAmount.toLocaleString()} has been added to your account`,
        variant: "default",
      });

      // Call success callback
      onSuccess?.();
      
      // Reset form after a delay
      setTimeout(() => {
        setAmount("");
        setPaymentMethod("bank_transfer");
        setIsSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Funds</CardTitle>
        <CardDescription>Add money to your wallet securely</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDeposit} className="space-y-4">
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
              disabled={isLoading || isSuccess}
            />
            <p className="text-xs text-gray-500">
              Minimum: ₦100 • Maximum: ₦1,000,000
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              disabled={isLoading || isSuccess}
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer (1% fee)</SelectItem>
                <SelectItem value="card">Credit/Debit Card (1.5% fee)</SelectItem>
                <SelectItem value="ussd">USSD (1% fee)</SelectItem>
                <SelectItem value="mobile_money">Mobile Money (1.2% fee)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Deposit Successful
              </>
            ) : (
              "Deposit Funds"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-gray-500 space-y-2">
        <p>• Funds are available immediately after confirmation</p>
        <p>• All transactions are secured with bank-level encryption</p>
        <p>• VIP members enjoy reduced fees</p>
      </CardFooter>
    </Card>
  );
};

export default DepositForm;
