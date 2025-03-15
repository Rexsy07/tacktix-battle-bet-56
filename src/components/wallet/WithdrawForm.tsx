import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

const WithdrawForm = ({ currentBalance }: { currentBalance: number }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const withdrawAmount = parseFloat(amount);
      
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      if (withdrawAmount > currentBalance) {
        throw new Error("Withdrawal amount exceeds available balance");
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to make a withdrawal");
      }
      
      // Get user's wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      
      if (walletError) throw walletError;
      
      // Create a withdrawal transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          wallet_id: walletData.id,
          amount: withdrawAmount,
          transaction_type: "withdrawal",
          type: "withdrawal", // Adding the required type field
          status: "pending", // Withdrawals usually need approval
          payment_method: "bank_transfer",
          details: JSON.stringify({ 
            bank_name: bankName,
            account_number: accountNumber
          })
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance (deduct funds)
      const { error: walletError2 } = await supabase.rpc(
        "update_wallet_balance", 
        { 
          user_uuid: session.user.id, 
          amount_to_add: -withdrawAmount 
        }
      );
      
      if (walletError2) throw walletError2;
      
      setIsSuccess(true);
      toast({
        title: "Withdrawal Requested",
        description: `₦${withdrawAmount.toLocaleString()} withdrawal has been initiated`,
        variant: "default",
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setAmount("");
        setBankName("");
        setAccountNumber("");
        setIsSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>Withdraw money to your bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              max={currentBalance.toString()}
              disabled={isLoading || isSuccess}
            />
            <p className="text-xs text-gray-500">
              Available Balance: ₦{currentBalance.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Select 
              value={bankName} 
              onValueChange={setBankName}
              disabled={isLoading || isSuccess}
            >
              <SelectTrigger id="bank-name">
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access_bank">Access Bank</SelectItem>
                <SelectItem value="first_bank">First Bank</SelectItem>
                <SelectItem value="gt_bank">GT Bank</SelectItem>
                <SelectItem value="zenith_bank">Zenith Bank</SelectItem>
                <SelectItem value="uba">UBA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              disabled={isLoading || isSuccess}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="outline" 
            className="w-full" 
            disabled={isLoading || isSuccess || currentBalance <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Withdrawal Requested
              </>
            ) : (
              "Withdraw Funds"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-gray-500">
        <p>Withdrawals are usually processed within 24 hours.</p>
      </CardFooter>
    </Card>
  );
};

export default WithdrawForm;
