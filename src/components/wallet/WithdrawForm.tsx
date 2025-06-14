
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import { deductFromBalance } from "@/utils/wallet-utils";

interface WithdrawFormProps {
  currentBalance: number;
  onSuccess?: () => void;
}

const WithdrawForm = ({ currentBalance, onSuccess }: WithdrawFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
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

      if (withdrawAmount < 1000) {
        throw new Error("Minimum withdrawal amount is ₦1,000");
      }
      
      if (withdrawAmount > currentBalance) {
        throw new Error("Withdrawal amount exceeds available balance");
      }

      if (!bankName || !accountNumber || !accountName) {
        throw new Error("Please fill in all bank details");
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to make a withdrawal");
      }
      
      // Deduct from user's balance
      const { success, error: balanceError } = await deductFromBalance(session.user.id, withdrawAmount);
      
      if (!success) {
        throw new Error(balanceError || "Failed to deduct funds from wallet");
      }

      // Create a withdrawal transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          amount: withdrawAmount,
          type: "withdrawal",
          status: "pending", // Withdrawals need approval
          description: `Withdrawal to ${bankName} - ${accountNumber} (${accountName})`
        });
      
      if (transactionError) throw transactionError;
      
      setIsSuccess(true);
      toast({
        title: "Withdrawal Requested",
        description: `₦${withdrawAmount.toLocaleString()} withdrawal has been initiated`,
        variant: "default",
      });

      // Call success callback
      onSuccess?.();
      
      // Reset form after a delay
      setTimeout(() => {
        setAmount("");
        setBankName("");
        setAccountNumber("");
        setAccountName("");
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
              placeholder="Enter amount (min. ₦1,000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1000"
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
                <SelectItem value="fidelity_bank">Fidelity Bank</SelectItem>
                <SelectItem value="union_bank">Union Bank</SelectItem>
                <SelectItem value="sterling_bank">Sterling Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              type="text"
              placeholder="Enter 10-digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              type="text"
              placeholder="Enter account holder name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
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
              "Request Withdrawal"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-gray-500 space-y-2">
        <p>• Withdrawals are processed within 24-48 hours</p>
        <p>• A 2% processing fee applies to all withdrawals</p>
        <p>• VIP members enjoy reduced fees and faster processing</p>
      </CardFooter>
    </Card>
  );
};

export default WithdrawForm;
