import { useState, useCallback, useRef, useEffect } from 'react'
import { Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import BottomSheet from '../BottomSheet'
import MnemonicGrid from '../MnemonicGrid'
import PinGrid, { PIN_LENGTH } from '../PinGrid'

const RPC_URL = 'https://api.mainnet-beta.solana.com'

const SUPPORTED_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', decimals: 6 },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6 },
  'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr': { symbol: 'EURC', decimals: 6 },
}

interface TokenBalance {
  symbol: string
  mint: string
  amount: number
}

async function fetchBalances(address: string): Promise<{ sol: number; tokens: TokenBalance[] }> {
  const conn = new Connection(RPC_URL)
  const pubkey = new PublicKey(address)

  const mints = Object.keys(SUPPORTED_TOKENS)
  const [lamports, ...tokenResults] = await Promise.all([
    conn.getBalance(pubkey),
    ...mints.map((mint) =>
      conn.getParsedTokenAccountsByOwner(pubkey, { mint: new PublicKey(mint) })
    ),
  ])

  const tokens: TokenBalance[] = mints.map((mint, i) => {
    const accounts = tokenResults[i].value
    const amount = accounts.reduce((sum, a) => {
      return sum + Number(a.account.data.parsed?.info?.tokenAmount?.uiAmount ?? 0)
    }, 0)
    return { symbol: SUPPORTED_TOKENS[mint].symbol, mint, amount }
  })

  return { sol: lamports / LAMPORTS_PER_SOL, tokens }
}

interface WalletSheetProps {
  open: boolean
  onClose: () => void

  publicKey: string | null
  shortAddress: string | null
  getDecryptedMnemonic: (pin: string) => Promise<string | null>
}

type View = 'main' | 'pin' | 'mnemonic'

export default function WalletSheet({
  open, onClose, publicKey, shortAddress, getDecryptedMnemonic,
}: WalletSheetProps) {
  const [view, setView] = useState<View>('main')
  const [pin, setPin] = useState('')
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const submitting = useRef(false)

  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [tokens, setTokens] = useState<TokenBalance[]>([])
  const [balanceLoading, setBalanceLoading] = useState(false)

  useEffect(() => {
    if (!open || !publicKey) return
    let cancelled = false
    setBalanceLoading(true)
    fetchBalances(publicKey)
      .then((res) => {
        if (cancelled) return
        setSolBalance(res.sol)
        setTokens(res.tokens)
      })
      .catch(() => {
        if (cancelled) return
        setSolBalance(0)
        setTokens([])
      })
      .finally(() => { if (!cancelled) setBalanceLoading(false) })
    return () => { cancelled = true }
  }, [open, publicKey])

  const close = () => {
    onClose()
    setView('main')
    setPin('')
    setMnemonic(null)
    setCopied(false)
    setShowFull(false)
  }

  const copyAddress = async () => {
    if (!publicKey) return
    await navigator.clipboard.writeText(publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePin = useCallback(async (v: string) => {
    setPin(v)
    if (v.length === PIN_LENGTH && !submitting.current) {
      submitting.current = true
      try {
        const m = await getDecryptedMnemonic(v)
        if (m) {
          setMnemonic(m)
          setView('mnemonic')
        }
      } catch {
        // wrong pin
      }
      setPin('')
      submitting.current = false
    }
  }, [getDecryptedMnemonic])

  return (
    <BottomSheet open={open} onClose={close}>
      {view === 'main' && (
        <>
          <h3 className="text-base font-semibold mb-4 text-center">My Wallet</h3>

          {/* Balances */}
          <div className="bg-[var(--color-bg)] rounded-xl p-4 mb-4">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Balances</p>

            {balanceLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-[var(--color-text-secondary)]" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* SOL */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SOL</span>
                  <span className="text-sm font-mono-accent">{solBalance?.toFixed(4) ?? '0.0000'}</span>
                </div>

                {/* SPL tokens */}
                {tokens.map((t) => (
                  <div key={t.mint} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.symbol}</span>
                    <span className="text-sm font-mono-accent">{t.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-[var(--color-bg)] rounded-xl p-4 mb-4">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono-accent flex-1 break-all">
                {showFull ? publicKey : shortAddress}
              </p>
              <button type="button" onClick={() => setShowFull(!showFull)} className="tap-feedback p-1.5 rounded-lg hover:bg-black/5">
                {showFull ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button type="button" onClick={copyAddress} className="tap-feedback p-1.5 rounded-lg hover:bg-black/5">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Chain Info */}
          <div className="bg-[var(--color-bg)] rounded-xl p-4 mb-4">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Network</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Solana</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Mainnet</span>
            </div>
          </div>

          {/* Recovery Phrase */}
          <button
            type="button"
            onClick={() => setView('pin')}
            className="w-full btn-outline tap-feedback py-3 rounded-xl text-sm font-medium"
          >
            View Recovery Phrase
          </button>
        </>
      )}

      {view === 'pin' && (
        <>
          <h3 className="text-base font-semibold mb-2 text-center">Enter PIN</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-5 text-center">
            Enter your PIN to reveal your recovery phrase.
          </p>
          <PinGrid value={pin} onChange={handlePin} autoFocus />
        </>
      )}

      {view === 'mnemonic' && mnemonic && (
        <>
          <h3 className="text-base font-semibold mb-2">Your Recovery Phrase</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            Keep these words secret and safe. Anyone with this phrase can access your wallet.
          </p>
          <MnemonicGrid mnemonic={mnemonic} onDone={close} doneLabel="Done" />
        </>
      )}
    </BottomSheet>
  )
}
