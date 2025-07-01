
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import BankSearchSelect from "./BankSearchSelect";
import { useToast } from "@/hooks/use-toast";

interface WithdrawFormProps {
  balance: number;
  onWithdraw: (amount: number, bankCode: string, accountNumber: string) => Promise<void>;
}

const WithdrawForm = ({ balance, onWithdraw }: WithdrawFormProps) => {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient Funds",
        description: "Withdrawal amount exceeds your current balance",
        variant: "destructive",
      });
      return;
    }

    if (!bankCode) {
      toast({
        title: "Bank Required",
        description: "Please select your bank",
        variant: "destructive",
      });
      return;
    }

    if (!accountNumber || accountNumber.length < 10) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter a valid account number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onWithdraw(withdrawAmount, bankCode, accountNumber);
      setAmount("");
      setBankCode("");
      setAccountNumber("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Funds</CardTitle>
        <CardDescription>
          Withdraw your earnings to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={balance}
              step="0.01"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Available balance: ₦{balance.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Select Bank</Label>
            <BankSearchSelect
              value={bankCode}
              onChange={setBankCode}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              type="text"
              placeholder="Enter your account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={10}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Processing Time</p>
              <p>Withdrawals are processed within 1-3 business days</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !amount || !bankCode || !accountNumber}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw ₦${amount || '0'}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawForm;
