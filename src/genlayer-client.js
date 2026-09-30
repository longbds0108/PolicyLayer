import { createClient } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';

export const POLICY_LAYER_ADDRESS = '0x6AA71FB8Cd16123f88Ab0CAD8Fe825eBC3260013';
export const GENLAYER_NETWORK_LABEL = 'GenLayer Studio Dev';

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
