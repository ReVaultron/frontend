import { useState } from "react";
import { Plus, ArrowDownToLine, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VaultCreationWizard } from "@/components/vault/VaultCreationWizard";

export function QuickActions() {
  const [createVaultOpen, setCreateVaultOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => setCreateVaultOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Vault
          </Button>
          <Button variant="outline" className="w-full">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button variant="outline" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Rebalance
          </Button>
          <Button variant="outline" className="w-full">
            <Activity className="h-4 w-4 mr-2" />
            Check Status
          </Button>
        </div>
      </Card>

      <Dialog open={createVaultOpen} onOpenChange={setCreateVaultOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Vault</DialogTitle>
          </DialogHeader>
          <VaultCreationWizard onComplete={() => setCreateVaultOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
