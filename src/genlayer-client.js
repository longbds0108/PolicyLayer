import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

export const POLICY_LAYER_ADDRESS = '0xA287f1713Af46faae40E51056e1AE48E42b89062';
export const GENLAYER_NETWORK_LABEL = 'GenLayer Studio';
// GenLayer Studio Network chain id (61999) in hex, per EIP-155.
const STUDIO_CHAIN_HEX = '0xf22f';
const STUDIO_RPC_URL = 'https://studio.genlayer.com/api';
const STUDIO_EXPLORER_URL = 'https://studio-next.genlayer.com';
export { STUDIO_RPC_URL, STUDIO_EXPLORER_URL };

function browserProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No browser wallet found. Connect MetaMask or another injected wallet first.');
  }
  return window.ethereum;
}

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export async function getWalletAddress() {
  const provider = browserProvider();
  // Some wallets return no accounts until the user grants permission for this
  // origin (WalletConnect via QR, freshly installed MetaMask, etc.), so ask
  // for permission before falling back to eth_accounts.
  let accounts;
  try {
    accounts = await provider.request({ method: 'eth_accounts' });
  } catch {
    accounts = [];
  }
  let address = Array.isArray(accounts) ? accounts[0] : undefined;
  if (!address || !ETH_ADDRESS_RE.test(String(address))) {
    try {
      accounts = await provider.request({ method: 'eth_requestAccounts' });
      address = Array.isArray(accounts) ? accounts[0] : undefined;
    } catch (error) {
      // Preserve the wallet's own message when possible (e.g. user rejected).
      throw error?.code === 4001
        ? new Error('Wallet request was rejected. Approve the popup to continue.')
        : new Error('Connect your wallet before submitting a transaction.');
    }
  }
  if (!address || !ETH_ADDRESS_RE.test(String(address))) {
    throw new Error('Connect your wallet before submitting a transaction.');
  }
  return address;
}

// Ask the wallet to switch to GenLayer Studio Network, adding the chain first
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
          rpcUrls: [STUDIO_RPC_URL],
          blockExplorerUrls: [STUDIO_EXPLORER_URL],
        },
      ],
    });
  }
}

export function createReadClient() {
  return createClient({ chain: studionet });
}

export async function readPolicyLayer(functionName, args = []) {
  const client = createReadClient();
  return client.readContract({
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
  });
}

// Turn opaque wallet / RPC errors into a sentence a DAO member can act on.
export function humanizeWalletError(error) {
  const code = error?.code ?? error?.cause?.code ?? error?.data?.originalError?.code;
  const raw = String(error?.shortMessage || error?.message || error || '').trim();
  if (code === 4001 || /user rejected|user denied|rejected by user/i.test(raw)) {
    return 'Wallet request was rejected. Approve the popup to continue.';
  }
  if (code === -32002 || /already pending|request of type/i.test(raw)) {
    return 'A wallet request is already open. Finish it, then try again.';
  }
  if (/insufficient funds|insufficient balance/i.test(raw)) {
    return 'The wallet does not have enough GEN to pay this transaction fee.';
  }
  if (/at least \d+ characters/i.test(raw)) {
    return raw.replace(/.*UserError:\s*/, '');
  }
  if (/Address\s+"?undefined"?\s+is invalid/i.test(raw)) {
    return 'Your wallet did not return an account address. Reconnect the wallet and try again.';
  }
  if (/execution failed|execution reverted/i.test(raw)) {
    return 'The transaction would fail on chain. Check that the wallet is the DAO admin (for Save policy) or that the proposal text is at least 24 characters (for Check policy).';
  }
  if (/Missing or invalid parameters/i.test(raw)) {
    return 'The GenLayer RPC rejected the request. Reload the page, reconnect the wallet, and try again.';
  }
  if (/UserError:/.test(raw)) {
    return raw.split('UserError:').pop().trim();
  }
  return raw || 'The transaction could not be completed.';
}

// GenLayer validator lifecycle grouped into the four steps a user cares about.
// Any raw status maps to one of: signing → broadcast → consensus → accepted.
function mapStatus(raw) {
  const s = String(raw || '').toUpperCase();
  if (s === 'PENDING') return 'broadcast';
  if (['PROPOSING', 'COMMITTING', 'REVEALING', 'LEADER_REVEALING',
       'APPEAL_COMMITTING', 'APPEAL_REVEALING'].includes(s)) return 'consensus';
  if (s === 'ACCEPTED' || s === 'FINALIZED') return 'accepted';
  return 'broadcast';
}

const DECIDED = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export async function writePolicyLayer(functionName, args = [], hooks = {}) {
  const provider = browserProvider();
  const account = await getWalletAddress();
  // Sending a tx from the wrong chain either fails with a cryptic error or,
  // worse, lands on the wallet's active chain. Force the right chain first.
  await ensureStudioChain(provider);

  // Must pass the account as a STRING (hex address), not an Account object.
  // genlayer-js's internal transport routes eth_sendTransaction to the
  // wallet provider only when `typeof config.account !== "object"`; passing
  // an object silently sends it to the Studio RPC, which does not support
  // signing and returns "The method eth_sendTransaction does not exist".
  const client = createClient({
    chain: studionet,
    account,
    provider,
  });

  hooks.onStatus?.('signing');
  // Do NOT pass `account` here. genlayer-js reads `senderAccount.address`
  // internally; if we hand it the bare hex string, `.address` is undefined
  // and getCurrentNonce/gen_call send malformed RPC params, which the
  // Studio RPC rejects with "Missing or invalid parameters". Letting these
  // fall back to `client.account` uses viem's parsed { address, type }.
  const feeEstimate = await client.estimateTransactionFeesForWrite({
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
  });

  const hash = await client.writeContract({
    address: POLICY_LAYER_ADDRESS,
    functionName,
    args,
    fees: {
      distribution: feeEstimate.distribution,
      messageAllocations: feeEstimate.messageAllocations,
      feeValue: feeEstimate.feeValue,
    },
  });

  // Show the hash the moment we have it, then poll the transaction so we
  // can surface each real GenLayer state (PENDING → PROPOSING → COMMITTING →
  // REVEALING → ACCEPTED) instead of blocking on waitForDecision. The user
  // can Stop waiting at any point; the on-chain tx keeps running.
  hooks.onHash?.(hash);
  hooks.onStatus?.('broadcast');

  const interval = 3000;
  const maxWait = 10 * 60 * 1000;
  const started = Date.now();
  let lastStep = 'broadcast';
  let receipt = null;

  const isAborted = () => hooks.signal?.aborted;
  while (true) {
    if (isAborted()) throw new Error('Wait cancelled');
    if (Date.now() - started > maxWait) {
      throw new Error('The transaction is still running on GenLayer. Check the explorer for its final state.');
    }
    let tx = null;
    try {
      tx = await client.getTransaction({ hash });
    } catch {
      // Transient RPC hiccups — wait and retry, don't blow up the wait.
    }
    const raw = tx?.statusName || tx?.status;
    if (raw) {
      const step = mapStatus(raw);
      if (step !== lastStep) {
        lastStep = step;
        hooks.onStatus?.(step);
      }
      if (DECIDED.has(String(raw).toUpperCase())) {
        receipt = tx;
        break;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  hooks.onStatus?.('accepted');
  return { hash, receipt };
}
