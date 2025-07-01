
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bank {
  name: string;
  code: string;
}

interface BankSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const BankSearchSelect = ({ value, onChange, disabled = false }: BankSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  
  const banks: Bank[] = [
    { name: "Access Bank", code: "044" },
    { name: "GTBank", code: "058" },
    { name: "First Bank", code: "011" },
    { name: "UBA", code: "033" },
    { name: "Zenith Bank", code: "057" },
    { name: "Fidelity Bank", code: "070" },
    { name: "Union Bank", code: "032" },
    { name: "Sterling Bank", code: "232" },
    { name: "Stanbic IBTC", code: "221" },
    { name: "FCMB", code: "214" }
  ];

  const selectedBank = banks.find((bank) => bank.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedBank ? selectedBank.name : "Select bank..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search bank..." />
          <CommandEmpty>No bank found.</CommandEmpty>
          <CommandGroup>
            {banks.map((bank) => (
              <CommandItem
                key={bank.code}
                value={bank.name}
                onSelect={() => {
                  onChange(bank.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === bank.code ? "opacity-100" : "opacity-0"
                  )}
                />
                {bank.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BankSearchSelect;
