import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpFromLine } from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultName: string;
}

const VAULT_TOKENS = [
  { id: "HBAR", name: "HBAR", balance: "2,500.00" },
  { id: "USDC", name: "USDC", balance: "2,750.00" },
];

export function WithdrawModal({ open, onOpenChange, vaultName }: WithdrawModalProps) {
  const [selectedToken, setSelectedToken] = useState("HBAR");
  const [amount, setAmount] = useState("");

  const selectedTokenData = VAULT_TOKENS.find(t => t.id === selectedToken);

  const handleWithdraw = () => {
    console.log(`Withdrawing ${amount} ${selectedToken} from ${vaultName}`);
    // TODO: Implement withdraw logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from Vault</DialogTitle>
          <DialogDescription>
            Withdraw tokens from {vaultName}
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
                {VAULT_TOKENS.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTokenData && (
              <p className="text-sm text-muted-foreground">
                In vault: {selectedTokenData.balance} {selectedTokenData.name}
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
              <span className="text-muted-foreground">You will receive</span>
              <span className="font-medium">{amount || "0.00"} {selectedToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network fee</span>
              <span className="font-medium">~0.05 HBAR</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleWithdraw}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw {selectedToken}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
