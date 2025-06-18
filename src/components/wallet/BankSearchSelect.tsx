import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bank {
  code: string;
  name: string;
  type: 'commercial' | 'microfinance' | 'mortgage' | 'merchant' | 'fintech' | 'psb';
}

const banksList: Bank[] = [
  // Commercial Banks
  { code: "access_bank", name: "Access Bank", type: "commercial" },
  { code: "citi_bank", name: "Citi Bank", type: "commercial" },
  { code: "ecobank", name: "Ecobank Nigeria", type: "commercial" },
  { code: "fcmb", name: "FCMB", type: "commercial" },
  { code: "fidelity_bank", name: "Fidelity Bank", type: "commercial" },
  { code: "first_bank", name: "First Bank of Nigeria", type: "commercial" },
  { code: "gtbank", name: "GTBank Plc", type: "commercial" },
  { code: "heritage_bank", name: "Heritage Bank", type: "commercial" },
  { code: "jaiz_bank", name: "JAIZ Bank", type: "commercial" },
  { code: "keystone_bank", name: "Keystone Bank", type: "commercial" },
  { code: "polaris_bank", name: "Polaris Bank", type: "commercial" },
  { code: "providus_bank", name: "Providus Bank", type: "commercial" },
  { code: "stanbic_ibtc", name: "StanbicIBTC Bank", type: "commercial" },
  { code: "standard_chartered", name: "StandardChartered", type: "commercial" },
  { code: "sterling_bank", name: "Sterling Bank", type: "commercial" },
  { code: "suntrust_bank", name: "Suntrust Bank", type: "commercial" },
  { code: "uba", name: "United Bank for Africa", type: "commercial" },
  { code: "union_bank", name: "Union Bank", type: "commercial" },
  { code: "unity_bank", name: "Unity Bank", type: "commercial" },
  { code: "wema_bank", name: "Wema Bank", type: "commercial" },
  { code: "zenith_bank", name: "Zenith Bank Plc", type: "commercial" },
  
  // Merchant Banks
  { code: "coronation_merchant", name: "Coronation Merchant Bank", type: "merchant" },
  { code: "fbnquest_merchant", name: "FBNQUEST Merchant Bank", type: "merchant" },
  { code: "fsdh_merchant", name: "FSDH Merchant Bank", type: "merchant" },
  { code: "greenwich_merchant", name: "Greenwich Merchant Bank", type: "merchant" },
  { code: "nova_merchant", name: "Nova Merchant Bank", type: "merchant" },
  { code: "rand_merchant", name: "Rand Merchant Bank", type: "merchant" },
  
  // Mortgage Banks
  { code: "abbey_mortgage", name: "Abbey Mortgage Bank", type: "mortgage" },
  { code: "ag_mortgage", name: "AG Mortgage Bank", type: "mortgage" },
  { code: "brent_mortgage", name: "Brent Mortgage Bank", type: "mortgage" },
  { code: "coop_mortgage", name: "Coop Mortgage Bank", type: "mortgage" },
  { code: "fbn_mortgages", name: "FBN Mortgages Limited", type: "mortgage" },
  { code: "fha_mortgage", name: "FHA Mortgage Bank", type: "mortgage" },
  { code: "first_generation_mortgage", name: "First Generation Mortgage Bank", type: "mortgage" },
  { code: "gateway_mortgage", name: "Gateway Mortgage Bank", type: "mortgage" },
  { code: "haggai_mortgage", name: "Haggai Mortgage Bank Limited", type: "mortgage" },
  { code: "homebase_mortgage", name: "Homebase Mortgage Bank", type: "mortgage" },
  { code: "imperial_homes_mortgage", name: "Imperial Homes Mortgage Bank", type: "mortgage" },
  { code: "infinity_trust_mortgage", name: "Infinity Trust Mortgage Bank", type: "mortgage" },
  { code: "jubilee_life_mortgage", name: "Jubilee-Life Mortgage Bank", type: "mortgage" },
  { code: "lagos_building_investment", name: "Lagos Building Investment Company", type: "mortgage" },
  { code: "mayfresh_mortgage", name: "MayFresh Mortgage Bank", type: "mortgage" },
  { code: "platinum_mortgage", name: "Platinum Mortgage Bank", type: "mortgage" },
  { code: "refuge_mortgage", name: "Refuge Mortgage Bank", type: "mortgage" },
  { code: "stb_mortgage", name: "STB Mortgage Bank", type: "mortgage" },
  { code: "trustbond_mortgage", name: "Trustbond Mortgage Bank", type: "mortgage" },
  
  // Microfinance Banks (Selection - too many to list all)
  { code: "accion_mfb", name: "Accion Microfinance Bank", type: "microfinance" },
  { code: "bowen_mfb", name: "Bowen Microfinance Bank", type: "microfinance" },
  { code: "covenant_mfb", name: "Covenant MFB", type: "microfinance" },
  { code: "fairmoney_mfb", name: "FairMoney Microfinance Bank", type: "microfinance" },
  { code: "kuda_mfb", name: "Kuda Microfinance Bank", type: "microfinance" },
  { code: "lapo_mfb", name: "Lapo Microfinance Bank", type: "microfinance" },
  { code: "moniepoint_mfb", name: "Moniepoint Microfinance Bank", type: "microfinance" },
  { code: "renmoney_mfb", name: "RenMoney Microfinance Bank", type: "microfinance" },
  { code: "sparkle_mfb", name: "Sparkle", type: "microfinance" },
  { code: "vfd_mfb", name: "VFD MFB", type: "microfinance" },
  
  // Fintech/Digital Banks
  { code: "eyowo", name: "Eyowo", type: "fintech" },
  { code: "opay", name: "Paycom (Opay)", type: "fintech" },
  { code: "paga", name: "Paga", type: "fintech" },
  { code: "palmpay", name: "PalmPay Limited", type: "fintech" },
  { code: "flutterwave", name: "Flutterwave Technology Solutions Limited", type: "fintech" },
  { code: "paystack", name: "Paystack Payment Limited", type: "fintech" },
  
  // Payment Service Banks
  { code: "9psb", name: "9Payment Service Bank", type: "psb" },
  { code: "hope_psb", name: "HopePSB", type: "psb" },
  { code: "momo_psb", name: "MoMo PSB", type: "psb" },
  { code: "smartcash_psb", name: "SmartCash PSB", type: "psb" },
  
  // Others
  { code: "cbn", name: "Central Bank of Nigeria", type: "commercial" },
  { code: "enaira", name: "eNaira", type: "fintech" },
  { code: "enterprise_bank", name: "Enterprise Bank", type: "commercial" },
  { code: "globus_bank", name: "Globus Bank", type: "commercial" },
  { code: "lotus_bank", name: "Lotus Bank", type: "commercial" },
  { code: "optimus_bank", name: "Optimus Bank", type: "commercial" },
  { code: "premium_trust_bank", name: "Premium Trust Bank", type: "commercial" },
  { code: "signature_bank", name: "Signature Bank", type: "commercial" },
  { code: "taj_bank", name: "Taj Bank", type: "commercial" },
  { code: "titan_trust_bank", name: "Titan Trust Bank", type: "commercial" }
].sort((a, b) => a.name.localeCompare(b.name));

interface BankSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const BankSearchSelect = ({ value, onValueChange, disabled }: BankSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBanks = useMemo(() => {
    if (!searchTerm) return banksList;
    return banksList.filter(bank =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedBank = banksList.find(bank => bank.code === value);

  const handleBankSelect = (bankCode: string) => {
    onValueChange(bankCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <Label htmlFor="bank-select">Bank Name</Label>
      <Button
        id="bank-select"
        variant="outline"
        className={cn(
          "w-full justify-between h-10 px-3 py-2",
          !selectedBank && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        {selectedBank ? selectedBank.name : "Select your bank"}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-2">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search banks..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {filteredBanks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No banks found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.code}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm hover:bg-accent transition-colors flex items-center justify-between",
                        value === bank.code && "bg-accent"
                      )}
                      onClick={() => handleBankSelect(bank.code)}
                      type="button"
                    >
                      <div>
                        <div className="font-medium">{bank.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {bank.type} Bank
                        </div>
                      </div>
                      {value === bank.code && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default BankSearchSelect;
