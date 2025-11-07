import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletConnect() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <span className="font-medium">HashPack</span>
            <span className="text-xs text-muted-foreground">Recommended</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="font-medium">Blade Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="font-medium">WalletConnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
