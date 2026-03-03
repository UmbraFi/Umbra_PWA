import { useWalletStore } from '../store/useWalletStore'
import { verifyBiometric } from '../services/walletCrypto'

export function useWallet() {
  const store = useWalletStore()

  const shortAddress = store.publicKey
    ? `${store.publicKey.slice(0, 4)}...${store.publicKey.slice(-4)}`
    : null

  return {
    publicKey: store.publicKey,
    shortAddress,
    connected: !!store.publicKey,
    unlocked: store.isUnlocked,
    isLoading: store.isLoading,
    error: store.error,
    pendingMnemonic: store.pendingMnemonic,
    createWallet: store.createWallet,
    importWalletFromMnemonic: store.importWalletFromMnemonic,
    importWalletFromKey: store.importWalletFromKey,
    unlock: store.unlock,
    lock: store.lock,
    disconnect: store.disconnect,
    acknowledgeMnemonic: store.acknowledgeMnemonic,
    hasExistingWallet: store.hasWallet(),
    getDecryptedMnemonic: store.getDecryptedMnemonic,
    verifyBiometric,
  }
}
