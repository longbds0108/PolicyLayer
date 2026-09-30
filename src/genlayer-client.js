import { createClient } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';

export const POLICY_LAYER_ADDRESS = '0x9072A8483eE328c535693218F458B6c5293182F3';
export const GENLAYER_NETWORK_LABEL = 'GenLayer Studio Dev';
// The Studio Dev chain id (61997) in hex, per EIP-155.
const STUDIO_CHAIN_HEX = '0xf22d';

function browserProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No browser wallet found. Connect MetaMask or another injected wallet first.');
  }
  return window.ethereum;
}

export async function getWalletAddress() {
  const provider = browserProvider();
  const accounts = await provider.request({ method: 'eth_accounts' });
  const address = accounts?.[0];
  if (!address) {
    throw new Error('Connect your wallet before submitting a transaction.');
  }
  return address;
}

// Ask the wallet to switch to GenLayer Studio Dev, adding the chain first
// when the wallet has never heard of it (EIP-3085 / error 4902).
async function ensureStudioChain(provider) {
  let current;
  try {
    current = await provider.request({ method: 'eth_chainId' });
  } catch {
    current = null;
  }
  if (String(current).toLowerCase() === STUDIO_CHAIN_HEX) return;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIO_CHAIN_HEX }],
    });
  } catch (error) {
    // 4902 (or its wrapped form) means the wallet has no record of this chain.
    const code = error?.code ?? error?.data?.originalError?.code;
    if (code !== 4902 && !/Unrecognized chain|Try adding the chain/i.test(error?.message || '')) {
      throw error;
    }
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: STUDIO_CHAIN_HEX,
          chainName: GENLAYER_NETWORK_LABEL,
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          rpcUrls: ['https://studio-dev.genlayer.com/api'],
          blockExplorerUrls: ['https://studio-next.genlayer.com'],
        },
      ],
    });
  }
}

export function createReadClient() {
  return createClient({ chain: studioDevnet });
}

export async function readPolicyLayer(functionName, args = []) {
  const client = createReadClient();
  return client.readContract({
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
  });
}

export async function writePolicyLayer(functionName, args = []) {
  const provider = browserProvider();
  const account = await getWalletAddress();
  // Sending a tx from the wrong chain either fails with a cryptic error or,
  // worse, lands on the wallet's active chain. Force the right chain first.
  await ensureStudioChain(provider);

  const client = createClient({
    chain: studioDevnet,
    account,
    provider,
  });

  const feeEstimate = await client.estimateTransactionFeesForWrite({
    account,
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
  });

  const hash = await client.writeContract({
    account,
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
    fees: {
      distribution: feeEstimate.distribution,
      messageAllocations: feeEstimate.messageAllocations,
      feeValue: feeEstimate.feeValue,
    },
  });

  const receipt = await client.waitForDecision({
    hash,
    interval: 3000,
    retries: 200,
  });

  return { hash, receipt };
}
