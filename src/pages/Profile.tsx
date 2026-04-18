import {
  Bot,
  ChevronRight,
  Clock,
  Coins,
  Heart,
  Key,
  Lock,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Unlock,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTE_PATHS } from '../navigation/paths'
import { useWallet } from '../hooks/useWallet'

import { useOnChainProfile } from '../hooks/useOnChainProfile'
import { isBiometricSupported } from '../services/walletCrypto'
import { useStore } from '../store/useStore'
import BottomSheet from '../components/BottomSheet'
import AvatarDisplay from '../components/AvatarDisplay'
import CreateWalletSheet, { type CreateStep } from '../components/wallet/CreateWalletSheet'
import UnlockSheet from '../components/wallet/UnlockSheet'
import ImportWalletSheet, { type ImportStep } from '../components/wallet/ImportWalletSheet'
import { PendingMnemonicSheet } from '../components/wallet/MnemonicSheet'
import WalletSheet from '../components/wallet/WalletSheet'
import BuyTokenSheet from '../components/wallet/BuyTokenSheet'
import EditProfileSheet from '../components/wallet/EditProfileSheet'

export default function Profile() {
  const {
    publicKey, shortAddress, connected, unlocked, isLoading, error,
    pendingMnemonic, createWallet, importWalletFromMnemonic, importWalletFromKey,
    unlock, lock, disconnect, acknowledgeMnemonic, hasExistingWallet,
    getDecryptedMnemonic, verifyBiometric,
  } = useWallet()

  const [createStep, setCreateStep] = useState<CreateStep | null>(null)
  const [showUnlock, setShowUnlock] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importStep, setImportStep] = useState<ImportStep>('input')
  const [showMnemonic, setShowMnemonic] = useState(false)

  const [showWallet, setShowWallet] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showBuyToken, setShowBuyToken] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [biometricError, setBiometricError] = useState<string | null>(null)

  const { profile, updating, updateProfile } = useOnChainProfile(publicKey ?? null)

  const navigate = useNavigate()
  const setBottomNavHidden = useStore((s) => s.setBottomNavHidden)

  const dialogOpen = !!createStep || showUnlock || showImport || showMnemonic || showWallet || showDisconnectConfirm || showBuyToken || showEditProfile
  useEffect(() => {
    setBottomNavHidden(dialogOpen)
    return () => setBottomNavHidden(false)
  }, [dialogOpen, setBottomNavHidden])

  useEffect(() => {
    if (pendingMnemonic) setShowMnemonic(true)
  }, [pendingMnemonic])

  const startCreate = async () => {
    setBiometricError(null)
    if (isBiometricSupported()) {
      setCreateStep('biometric')
      try {
        await verifyBiometric()
        setCreateStep('pin-set')
      } catch (e) {
        setBiometricError((e as Error).message || 'Biometric verification failed.')
        setCreateStep(null)
      }
    } else {
      setCreateStep('pin-set')
    }
  }

  const startImportBiometric = async (value: string) => {
    if (!value.trim()) return
    setBiometricError(null)
    if (isBiometricSupported()) {
      setImportStep('biometric')
      try {
        await verifyBiometric()
        setImportStep('pin')
      } catch (e) {
        setBiometricError((e as Error).message || 'Biometric verification failed.')
        setImportStep('input')
      }
    } else {
      setImportStep('pin')
    }
  }

  const handleMnemonicAck = () => {
    acknowledgeMnemonic()
    setShowMnemonic(false)
  }

  const menuItems = [
    { icon: MapPin, label: 'My Address', desc: 'Manage your shipping addresses', action: () => navigate(APP_ROUTE_PATHS.addresses) },
    { icon: Package, label: 'My Listings', desc: 'Manage your published items', action: () => navigate(APP_ROUTE_PATHS.myListings) },
    { icon: Store, label: 'My Space', desc: 'Your public storefront for buyers', action: () => navigate(APP_ROUTE_PATHS.mySpace) },
    { icon: Tag, label: 'My Sales', desc: 'Items you have sold', action: () => navigate(APP_ROUTE_PATHS.mySales) },
    { icon: ShoppingBag, label: 'My Purchases', desc: 'Items you have bought', action: () => navigate(APP_ROUTE_PATHS.myPurchases) },
    { icon: Clock, label: 'Browsing History', desc: 'Recently viewed items', action: () => navigate(APP_ROUTE_PATHS.browsingHistory) },
    { icon: Heart, label: 'My Favorites', desc: 'Items you have saved', action: () => navigate(APP_ROUTE_PATHS.favorites) },
    { icon: Users, label: 'Followed Stores', desc: 'Stores you are following', action: () => navigate(APP_ROUTE_PATHS.followedStores) },
  ]

  return (
    <div className="-mx-1.5 -mt-[calc(env(safe-area-inset-top,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] bg-[var(--color-bg)]">
      <div className="relative pt-6 pb-5 flex flex-col items-center text-center bg-[var(--color-bg)]">
        {/* Top-left Settings & Top-right AI Support */}
        <button type="button" data-edge-gesture-exempt="true" onClick={() => navigate(APP_ROUTE_PATHS.settings)} className="absolute -top-3 left-0 tap-feedback p-3 rounded-full hover:bg-black/5 transition-colors">
          <Settings size={20} strokeWidth={1.8} className="text-black" />
        </button>
        <button type="button" onClick={() => navigate(APP_ROUTE_PATHS.aiSupport)} className="absolute -top-3 right-0 tap-feedback p-3 rounded-full hover:bg-black/5 transition-colors">
          <Bot size={20} strokeWidth={1.8} className="text-black" />
        </button>

        {/* Avatar */}
        <div className="relative mb-3">
          <AvatarDisplay
            avatar={profile?.avatar ?? null}
            fallbackInitials={connected ? publicKey?.slice(0, 2) ?? '--' : '--'}
            size={72}
          />
        </div>

        {/* No wallet */}
        {!unlocked && !hasExistingWallet && (
          <>
            <p className="text-sm text-[var(--color-text-secondary)]">No wallet</p>
            <div className="flex gap-2 mt-3 w-full max-w-[260px]">
              <button type="button" onClick={startCreate} disabled={isLoading || !!createStep} className="tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 bg-[var(--color-accent)] text-black font-medium text-sm">
                <Plus size={16} /> Create
              </button>
              <button type="button" onClick={() => setShowImport(true)} disabled={isLoading} className="tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 bg-black text-white font-medium text-sm">
                <Key size={16} /> Import
              </button>
            </div>
          </>
        )}

        {/* Wallet locked */}
        {!unlocked && hasExistingWallet && (
          <>
            <p className="text-sm text-[var(--color-text-secondary)]">Wallet locked</p>
            <div className="flex gap-2 mt-3 w-full max-w-[260px]">
              <button type="button" onClick={() => setShowUnlock(true)} disabled={isLoading} className="btn-outline tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                <Unlock size={16} /> Unlock {shortAddress}
              </button>
              <button type="button" onClick={() => setShowDisconnectConfirm(true)} className="btn-outline tap-feedback w-10 h-10 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}

        {/* Wallet unlocked */}
        {connected && unlocked && (
          <>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium font-mono-accent">{profile?.displayName || shortAddress}</p>
              <button type="button" onClick={() => setShowEditProfile(true)} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                <Pencil size={13} className="text-gray-400" />
              </button>
            </div>
            {profile?.displayName && <p className="text-[11px] text-[var(--color-text-secondary)] font-mono-accent">{shortAddress}</p>}
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Wallet unlocked</p>
            <div className="flex gap-2 mt-3 w-full max-w-[260px]">
              <button type="button" onClick={() => setShowWallet(true)} className="btn-accent tap-feedback flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2">
                <Wallet size={16} /> My Wallet
              </button>
              <button type="button" onClick={lock} className="btn-outline tap-feedback w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <Lock size={16} />
              </button>
            </div>
          </>
        )}

        {(error || biometricError) && (
          <p className="text-xs text-red-500 mt-2">{biometricError || error}</p>
        )}
      </div>

      {/* Wallet sheets */}
      <CreateWalletSheet step={createStep} setStep={setCreateStep} isLoading={isLoading} createWallet={createWallet} />
      <UnlockSheet open={showUnlock} onClose={() => setShowUnlock(false)} isLoading={isLoading} unlock={unlock} />
      <ImportWalletSheet
        open={showImport} onClose={() => setShowImport(false)} isLoading={isLoading}
        biometricError={biometricError}
        onStartBiometric={startImportBiometric}
        importWalletFromMnemonic={importWalletFromMnemonic} importWalletFromKey={importWalletFromKey}
        importStep={importStep} setImportStep={setImportStep}
      />
      <PendingMnemonicSheet mnemonic={pendingMnemonic} open={showMnemonic} onAcknowledge={handleMnemonicAck} />

      <BottomSheet open={showDisconnectConfirm} onClose={() => setShowDisconnectConfirm(false)}>
        <h3 className="text-base font-semibold mb-2 text-center">Disconnect Wallet?</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
          This will remove your local wallet data and cannot be undone. Make sure you have backed up your recovery phrase.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowDisconnectConfirm(false)} className="btn-outline tap-feedback flex-1 py-3 rounded-xl text-sm font-medium">
            Cancel
          </button>
          <button type="button" onClick={() => { setShowDisconnectConfirm(false); disconnect() }} className="tap-feedback flex-1 py-3 rounded-xl text-sm font-medium bg-red-500 text-white">
            Disconnect
          </button>
        </div>
      </BottomSheet>
      <WalletSheet open={showWallet} onClose={() => setShowWallet(false)} publicKey={publicKey ?? null} shortAddress={shortAddress ?? null} getDecryptedMnemonic={getDecryptedMnemonic} />
      <BuyTokenSheet open={showBuyToken} onClose={() => setShowBuyToken(false)} />
      <EditProfileSheet open={showEditProfile} onClose={() => setShowEditProfile(false)} currentProfile={profile} onSave={updateProfile} saving={updating} />

      {/* Stats + Menu container */}
      <div className="relative mt-4 bg-white rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)] after:absolute after:left-0 after:right-0 after:top-full after:h-screen after:bg-white">
        {/* Buy UMBRA banner */}
        {connected && unlocked && (
          <>
            <button
              type="button"
              onClick={() => setShowBuyToken(true)}
              className="tap-feedback w-full rounded-t-2xl flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-[var(--color-accent)]/15 to-[var(--color-accent)]/5 hover:from-[var(--color-accent)]/25 hover:to-[var(--color-accent)]/10 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                <Coins size={18} strokeWidth={2} className="text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Buy UMBRA</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Purchase tokens with SOL or stablecoins</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </>
        )}

        {menuItems.map(({ icon: Icon, label, desc, action }, idx) => (
          <div key={label}>
            {(idx > 0 || (connected && unlocked)) && <div className="h-px bg-gray-100 mx-4" />}
            <button type="button" onClick={action} className="tap-feedback w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left">
              <Icon size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
