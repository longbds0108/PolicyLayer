import React, { useEffect } from 'react';
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
import { WagmiProvider, useAccount } from 'wagmi';
import { defineChain } from 'viem';

const genlayerBradbury = defineChain({
  id: 4221,
  name: 'GenLayer Bradbury',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc-bradbury.genlayer.com'] } },
  blockExplorers: {
    default: { name: 'GenLayer Explorer', url: 'https://explorer-bradbury.genlayer.com' },
  },
});

const config = getDefaultConfig({
  appName: 'PolicyLayer',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [genlayerBradbury],
  ssr: false,
});

const queryClient = new QueryClient();

function WalletBridge() {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const open = () => openConnectModal?.();
    const ids = ['heroStart', 'ctaStart'];
    ids.forEach((id) => document.querySelector(`#${id}`)?.addEventListener('click', open));
    return () => ids.forEach((id) => document.querySelector(`#${id}`)?.removeEventListener('click', open));
  }, [openConnectModal]);

  useEffect(() => {
    if (window.location.pathname.endsWith('/dashboard.html') || !isConnected || !address) return;
    localStorage.setItem('plWallet', JSON.stringify({ address, mode: 'RainbowKit', chain: 'GenLayer Bradbury' }));
    window.location.href = 'dashboard.html';
  }, [address, isConnected]);

  return null;
}

function WalletHeader() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) return null;
        if (chain?.unsupported) {
          return <button className="policy-wallet-connect" onClick={openChainModal}>Wrong network</button>;
        }
        if (account) {
          return (
            <button className="policy-wallet-account" onClick={openAccountModal} type="button">
              <span className="policy-wallet-orb">◈</span>
              <span className="policy-wallet-copy"><small>Connected wallet</small><strong>{account.displayName}</strong></span>
              <span className="policy-wallet-caret">⌄</span>
            </button>
          );
        }
        return <button className="policy-wallet-connect" onClick={openConnectModal} type="button">Get started <span>↗</span></button>;
      }}
    </ConnectButton.Custom>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
          initialChain={genlayerBradbury}
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

const mountNode = document.getElementById('wallet-header-root') || document.getElementById('rainbow-root');
if (mountNode) createRoot(mountNode).render(<App />);
