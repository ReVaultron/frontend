import { ethers } from "ethers";

const ERC20_ABI = [
  // balanceOf(address)
  "function balanceOf(address owner) view returns (uint256)",
  // decimals()
  "function decimals() view returns (uint8)",
  // symbol()
  "function symbol() view returns (string)"
];


export async function fetchHBARBalance(address: string) {
  const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}

export async function fetchERC20Balance(token: string, user: string) {
  const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
  const contract = new ethers.Contract(token, ERC20_ABI, provider);

  const bal = await contract.balanceOf(user);
  const decimals = await contract.decimals();

  return ethers.formatUnits(bal, decimals);
}
