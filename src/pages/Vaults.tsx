import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, Wallet, TrendingUp, AlertTriangle, Plus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { 
  useUserVaultAddress, 
  useUserVaultData,
  useVolatilityIndexData 
} from "@/hooks/useContracts";
import { DEFAULT_PRICE_FEED_ID, FACTORY_VAULT_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts/abis";
import { parseEther } from "viem";

// Create Vault Modal Component
const CreateVaultModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: (vaultAddress: string) => void;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateVault = async () => {
    try {
      setIsCreating(true);
      
      // Call VaultFactory.createVault() with 0 HBAR (free creation)
      writeContract({
        address: CONTRACT_ADDRESSES.FACTORY_VAULT as `0x${string}`,
        abi: FACTORY_VAULT_ABI,
        functionName: 'createVault',
        value: parseEther('0'), // Free vault creation
      });
    } catch (error) {
      console.error("Error creating vault:", error);
      setIsCreating(false);
    }
  };

  // Handle success
  if (isSuccess && hash) {
    // In a real implementation, you'd parse the VaultCreated event to get the vault address
    // For now, we'll simulate it
    setTimeout(() => {
      onSuccess("0x...newVaultAddress");
      setIsCreating(false);
      onClose();
    }, 1000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Create Your Vault</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isCreating || isConfirming}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-muted-foreground">
            Create a new vault to start managing your HTS tokens with automated rebalancing
          </p>
        </div>

        {/* Status Display */}
        {(isCreating || isConfirming || isSuccess) && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              {isConfirming && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Creating Vault...</p>
                    <p className="text-sm text-muted-foreground">Please wait while your transaction is confirmed</p>
                  </div>
                </>
              )}
              {isSuccess && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Vault Created!</p>
                    <p className="text-sm text-muted-foreground">Your vault is ready to use</p>
                  </div>
                </>
              )}
            </div>
            
            {hash && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono text-foreground break-all">{hash}</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {writeError && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              {writeError.message || "Failed to create vault. Please try again."}
            </p>
          </div>
        )}

        {/* Vault Info */}
        {!isCreating && !isConfirming && !isSuccess && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Your Personal Vault</h3>
                  <p className="text-sm text-muted-foreground">
                    Each wallet can create one vault to manage HTS tokens
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">What you get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure storage for HTS tokens and HBAR</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Automatic balance synchronization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Full control over deposits and withdrawals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI-powered rebalancing recommendations</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Free to create!</strong> No creation fees required.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isCreating || isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateVault}
            className="flex-1 bg-gradient-to-r from-primary to-purple-600"
            disabled={isCreating || isConfirming || isSuccess}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Created!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Vault
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const Vaults = () => {
  const navigate = useNavigate();
  const { address: userAddress, isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Get user's vault address
  const { vaultAddress, hasVault, refetch: refetchVault } = useUserVaultAddress(userAddress);
  
  // Get vault data if exists
  const vaultData = useUserVaultData(hasVault ? vaultAddress : undefined);
  
  // Get volatility data
  const { currentVolatility, lastUpdate } = useVolatilityIndexData(DEFAULT_PRICE_FEED_ID);

  // Build vaults array from actual data
  const vaults = hasVault && vaultAddress ? [{
    id: vaultAddress,
    name: "My Vault",
    status: "Active" as const,
    riskLevel: getRiskLevel(currentVolatility, 30),
    hbarBalance: vaultData.hbarBalance,
    totalValue: vaultData.totalValue || "0.00",
    tokens: vaultData.tokenCount,
    lastRebalance: getTimeAgo(lastUpdate),
    volatility: currentVolatility,
    threshold: 30.0,
    address: vaultAddress
  }] : [];

  // Helper functions
  function getRiskLevel(volatility: number, threshold: number) {
    const ratio = volatility / threshold;
    if (ratio < 0.5) return "Low";
    if (ratio < 0.8) return "Moderate";
    return "High";
  }

  function getTimeAgo(timestamp: number): string {
    if (timestamp === 0) return "Never";
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "Moderate":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "High":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "Warning":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Handle vault creation success
  const handleVaultCreated = (newVaultAddress: string) => {
    console.log("Vault created:", newVaultAddress);
    // Refetch vault data
    refetchVault();
  };

  // Calculate stats
  const totalValue = vaults.reduce((sum, v) => sum + parseFloat(v.totalValue.replace(/,/g, '') || '0'), 0);
  const activeVaults = vaults.filter(v => v.status === "Active").length;
  const needAttention = vaults.filter(v => v.volatility > v.threshold).length;

  if (!isConnected) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Please connect your wallet to view and manage your vaults
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">My Vaults</h1>
          <p className="text-muted-foreground">
            Manage your vaults and monitor their performance
          </p>
        </div>
        {!hasVault && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Vault
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vaults</p>
              <p className="text-2xl font-bold text-foreground">{vaults.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Vaults</p>
              <p className="text-2xl font-bold text-foreground">{activeVaults}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Need Attention</p>
              <p className="text-2xl font-bold text-foreground">{needAttention}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Vaults Grid */}
      {vaults.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vaults.map((vault) => (
            <Card key={vault.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{vault.name}</h3>
                      <p className="text-sm text-muted-foreground">{vault.tokens} token{vault.tokens !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getStatusColor(vault.status)}>{vault.status}</Badge>
                    <Badge className={getRiskColor(vault.riskLevel)}>{vault.riskLevel} Risk</Badge>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">HBAR Balance</p>
                    <p className="text-lg font-semibold text-foreground">{vault.hbarBalance} ℏ</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-lg font-semibold text-foreground">${vault.totalValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Volatility</p>
                    <p className="text-lg font-semibold text-foreground">{vault.volatility.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Rebalance</p>
                    <p className="text-lg font-semibold text-foreground">{vault.lastRebalance}</p>
                  </div>
                </div>

                {/* Volatility Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Volatility vs Threshold</span>
                    <span className="text-sm font-medium text-foreground">
                      {vault.volatility.toFixed(1)}% / {vault.threshold}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        vault.volatility > vault.threshold
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : vault.volatility > vault.threshold * 0.8
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${Math.min((vault.volatility / vault.threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => navigate(`/vault/${vault.address}`)}
                    className="flex-1"
                    variant="default"
                  >
                    View Details
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No Vaults Yet</h3>
            <p className="text-muted-foreground">
              Create your first vault to start managing your portfolio with AI-powered rebalancing
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Vault
            </Button>
          </div>
        </Card>
      )}

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleVaultCreated}
      />
    </div>
  );
};

export default Vaults;