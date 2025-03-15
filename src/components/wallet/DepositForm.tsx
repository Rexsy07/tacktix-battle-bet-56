
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

const DepositForm = () => {
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
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to make a deposit");
      }
      
      // Get user's wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      
      if (walletError) throw walletError;
      
      // Create a deposit transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: walletData.id,
          amount: depositAmount,
          transaction_type: "deposit",
          status: "completed", // In a real app, this would be "pending" until payment is confirmed
          payment_method: paymentMethod,
          details: { method: paymentMethod }
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance
      const { error: walletError2 } = await supabase.rpc(
        "update_wallet_balance", 
        { 
          user_uuid: session.user.id, 
          amount_to_add: depositAmount 
        }
      );
      
      if (walletError2) throw walletError2;
      
      setIsSuccess(true);
      toast({
        title: "Deposit Successful",
        description: `₦${depositAmount.toLocaleString()} has been added to your wallet`,
        variant: "default",
      });
      
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
        <CardDescription>Add money to your wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              disabled={isLoading || isSuccess}
            />
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
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="ussd">USSD</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
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
      <CardFooter className="flex flex-col text-sm text-gray-500">
        <p>Funds will be available immediately after payment confirmation.</p>
      </CardFooter>
    </Card>
  );
};

export default DepositForm;
