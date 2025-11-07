import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine } from "lucide-react";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultName: string;
}

const AVAILABLE_TOKENS = [
  { id: "HBAR", name: "HBAR", balance: "5,234.50" },
  { id: "USDC", name: "USDC", balance: "1,000.00" },
  { id: "SAUCE", name: "SAUCE", balance: "10,000.00" },
];

export function DepositModal({ open, onOpenChange, vaultName }: DepositModalProps) {
  const [selectedToken, setSelectedToken] = useState("HBAR");
  const [amount, setAmount] = useState("");

  const selectedTokenData = AVAILABLE_TOKENS.find(t => t.id === selectedToken);

  const handleDeposit = () => {
    console.log(`Depositing ${amount} ${selectedToken} to ${vaultName}`);
    // TODO: Implement deposit logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit to Vault</DialogTitle>
          <DialogDescription>
            Deposit tokens to {vaultName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger id="token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TOKENS.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTokenData && (
              <p className="text-sm text-muted-foreground">
                Available: {selectedTokenData.balance} {selectedTokenData.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => selectedTokenData && setAmount(selectedTokenData.balance.replace(/,/g, ''))}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">You will deposit</span>
              <span className="font-medium">{amount || "0.00"} {selectedToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network fee</span>
              <span className="font-medium">~0.05 HBAR</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit {selectedToken}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
