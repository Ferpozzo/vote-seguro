import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import ElectionContext from './providers/ElectionContext';
import WalletContext from './providers/WalletProvider';
import { AsyncStorage, Platform } from 'react-native';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [wallet, setWallet] = useState({ address: '', chainId: 0 })
  const [election, setElection] = useState({})
  const walletState = { wallet, setWallet }
  const electionState = { election, setElection }
  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <ElectionContext.Provider value={electionState}>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </ElectionContext.Provider>
      </SafeAreaProvider>
    );
  }
}
