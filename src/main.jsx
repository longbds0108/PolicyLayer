import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import './rainbow-bridge.css';
import {
  ConnectButton,
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi';
import { defineChain } from 'viem';

const genlayerStudioDev = defineChain({
  id: 61999,
  name: 'GenLayer Studio',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://studio.genlayer.com/api'] } },
  blockExplorers: {
    default: { name: 'GenLayer Studio', url: 'https://studio-next.genlayer.com' },
  },
});

const config = getDefaultConfig({
  appName: 'PolicyLayer',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [genlayerStudioDev],
  ssr: false,
});

const queryClient = new QueryClient();

// The landing page has no [data-page]; its start buttons connect the wallet,
// switch to the dapp chain, then open the app.
const onLanding = !document.querySelector('[data-page]');
const START_EVENT = 'policylayer:start';
const startOnboarding = () => window.dispatchEvent(new Event(START_EVENT));

function WalletBridge() {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  // Only leave the landing page after the user clicks a start button,
  // not when wagmi silently reconnects a wallet on page load.
  const [started, setStarted] = useState(false);
  const switching = useRef(false);

  useEffect(() => {
    if (!onLanding) return undefined;
    const start = () => {
      setStarted(true);
      if (!isConnected) openConnectModal?.();
    };
    const ids = ['heroStart', 'ctaStart'];
    ids.forEach((id) => document.querySelector(`#${id}`)?.addEventListener('click', start));
    window.addEventListener(START_EVENT, start);
    return () => {
      ids.forEach((id) => document.querySelector(`#${id}`)?.removeEventListener('click', start));
      window.removeEventListener(START_EVENT, start);
    };
  }, [openConnectModal, isConnected]);

  useEffect(() => {
    if (!started || !isConnected || !address) return;
    if (chainId !== genlayerStudioDev.id) {
      if (switching.current) return;
      switching.current = true;
      // wagmi adds the chain to the wallet first if it is missing.
      switchChainAsync({ chainId: genlayerStudioDev.id })
        .catch(() => setStarted(false))
        .finally(() => { switching.current = false; });
      return;
    }
    localStorage.setItem('plWallet', JSON.stringify({ address, mode: 'RainbowKit', chain: genlayerStudioDev.name }));
    window.location.href = 'policies.html';
  }, [started, address, isConnected, chainId, switchChainAsync]);

  return null;
}

function WalletHeader() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) return null;
        if (chain?.unsupported) {
          return <button className="policy-wallet-connect" onClick={onLanding ? startOnboarding : openChainModal} type="button">Wrong network</button>;
        }
        if (account) {
          return (
            <button className="policy-wallet-account" onClick={openAccountModal} type="button">
              <span className="policy-wallet-copy"><small>Connected wallet</small><strong>{account.displayName}</strong></span>
              <span className="policy-wallet-caret">⌄</span>
            </button>
          );
        }
        return <button className="policy-wallet-connect" onClick={onLanding ? startOnboarding : openConnectModal} type="button">{onLanding ? 'Get started' : 'Connect wallet'} <span>↗</span></button>;
      }}
    </ConnectButton.Custom>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
          initialChain={genlayerStudioDev}
          theme={darkTheme({
            accentColor: '#9B5DE5',
            accentColorForeground: '#0E0B14',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
        >
          <WalletHeader />
          <WalletBridge />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// In production Vite can run this chunk BEFORE dashboard-page.js has had a
// chance to render the shell that contains #wallet-header-root. Poll briefly
// and, if still missing, start a MutationObserver so we mount the moment
// dashboard-page.js inserts the element.
function mountWhenReady() {
  const node = document.getElementById('wallet-header-root') || document.getElementById('rainbow-root');
  if (node) {
    createRoot(node).render(<App />);
    return true;
  }
  return false;
}

if (!mountWhenReady()) {
  const observer = new MutationObserver(() => {
    if (mountWhenReady()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Give up after 10 seconds so we don't leak the observer forever.
  setTimeout(() => observer.disconnect(), 10000);
}
