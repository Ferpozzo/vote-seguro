import { createContext } from 'react';

export interface Wallet {
    address: string,
    chainId: number
}
const WalletContext = createContext({
    wallet: { address: '', chainId: 0 },
    setWallet: (conn: Wallet) => { }
});

export default WalletContext;