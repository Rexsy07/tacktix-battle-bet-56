
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Building, Banknote } from "lucide-react";

interface QuickActionsProps {
  balance: number;
  onQuickDeposit: (amount: number) => void;
}

const QuickActions = ({ balance, onQuickDeposit }: QuickActionsProps) => {
  const quickAmounts = [1000, 5000, 10000, 25000];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-3">Quick Deposit</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => onQuickDeposit(amount)}
                className="text-xs"
              >
                ₦{amount.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Payment Methods</h4>
          <div className="space-y-2">
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <CreditCard className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Cards</div>
                <div className="text-xs text-gray-400">Instant • 1.5% fee</div>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <Building className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Bank Transfer</div>
                <div className="text-xs text-gray-400">1-2 hours • 1% fee</div>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-tacktix-dark-light rounded-md">
              <Smartphone className="h-4 w-4 text-tacktix-blue mr-2" />
              <div className="text-sm">
                <div className="font-medium">Mobile Money</div>
                <div className="text-xs text-gray-400">Instant • 1.2% fee</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Minimum deposit: ₦100</p>
            <p>• Maximum daily deposit: ₦1,000,000</p>
            <p>• All transactions are secured</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
