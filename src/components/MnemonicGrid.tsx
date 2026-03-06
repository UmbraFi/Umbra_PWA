import { Copy } from 'lucide-react'
import { useState } from 'react'

interface MnemonicGridProps {
  mnemonic: string
  onDone: () => void
  doneLabel: string
}

export default function MnemonicGrid({ mnemonic, onDone, doneLabel }: MnemonicGridProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(mnemonic)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {mnemonic.split(' ').map((word, i) => (
          <div key={i} className="rounded-lg bg-gray-50 px-2 py-2 text-center">
            <span className="text-[10px] text-[var(--color-text-secondary)]">{i + 1}</span>
            <p className="text-sm font-mono-accent font-medium">{word}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={copyToClipboard}
        className="tap-feedback w-full py-2 rounded-lg border border-gray-200 text-sm flex items-center justify-center gap-2 mb-2"
      >
        <Copy size={14} />
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="tap-feedback w-full py-2.5 rounded-lg bg-black text-white text-sm font-medium"
      >
        {doneLabel}
      </button>
    </>
  )
}
