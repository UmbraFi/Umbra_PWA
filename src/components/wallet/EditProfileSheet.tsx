import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import BottomSheet from '../BottomSheet'
import AvatarDisplay from '../AvatarDisplay'
import { PRESET_AVATARS, SVG_ICONS, AVATAR_COLORS } from '../../assets/avatarData'
import { ESTIMATED_GAS_SOL, type AvatarData, type OnChainProfile } from '../../services/profileContract'

type Tab = 'color' | 'preset' | 'icon'

interface EditProfileSheetProps {
  open: boolean
  onClose: () => void

  currentProfile: OnChainProfile | null
  onSave: (profile: OnChainProfile) => Promise<boolean>
  saving: boolean
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function EditProfileSheet({ open, onClose, currentProfile, onSave, saving }: EditProfileSheetProps) {
  const [tab, setTab] = useState<Tab>('color')
  const [color, setColor] = useState(currentProfile?.avatar.type === 1 ? currentProfile.avatar.color : currentProfile?.avatar.type === 3 ? currentProfile.avatar.color : AVATAR_COLORS[0])
  const [letter, setLetter] = useState(currentProfile?.avatar.type === 1 ? currentProfile.avatar.letter : 'A')
  const [presetIndex, setPresetIndex] = useState(currentProfile?.avatar.type === 2 ? currentProfile.avatar.presetIndex : 0)
  const [svgIndex, setSvgIndex] = useState(currentProfile?.avatar.type === 3 ? currentProfile.avatar.svgIndex : 0)
  const [displayName, setDisplayName] = useState(currentProfile?.displayName ?? '')
  const [success, setSuccess] = useState(false)

  const currentAvatar: AvatarData =
    tab === 'color' ? { type: 1, color, letter }
    : tab === 'preset' ? { type: 2, presetIndex }
    : { type: 3, color, svgIndex }

  const handleSave = async () => {
    const ok = await onSave({ avatar: currentAvatar, displayName: displayName.trim() })
    if (ok) {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 1200)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'color', label: 'Color + Letter' },
    { key: 'preset', label: 'Preset' },
    { key: 'icon', label: 'Icon + Color' },
  ]

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 className="text-base font-semibold text-center mb-4">Edit Profile</h3>

      {/* Preview */}
      <div className="flex justify-center mb-4">
        <AvatarDisplay avatar={currentAvatar} size={64} />
      </div>

      {/* Display name */}
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
        placeholder="Display name (optional)"
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-4 outline-none focus:border-[var(--color-accent)]"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === t.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-h-[220px] overflow-y-auto">
        {tab === 'color' && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Letter</p>
            <div className="grid grid-cols-9 gap-1 mb-3">
              {LETTERS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLetter(l)}
                  className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${letter === l ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Color</p>
            <div className="grid grid-cols-10 gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-black scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'preset' && (
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPresetIndex(i)}
                className={`flex flex-col items-center p-2 rounded-xl ${presetIndex === i ? 'ring-2 ring-black bg-gray-50' : ''}`}
              >
                <AvatarDisplay avatar={{ type: 2, presetIndex: i }} size={44} />
              </button>
            ))}
          </div>
        )}

        {tab === 'icon' && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Icon</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {SVG_ICONS.map((icon, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSvgIndex(i)}
                  className={`flex flex-col items-center p-2 rounded-xl ${svgIndex === i ? 'ring-2 ring-black bg-gray-50' : ''}`}
                >
                  <AvatarDisplay avatar={{ type: 3, color, svgIndex: i }} size={40} />
                  <span className="text-[10px] text-gray-500 mt-1">{icon.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Color</p>
            <div className="grid grid-cols-10 gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-black scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="mt-4 flex flex-col gap-2">
        <p className="text-[10px] text-gray-400 text-center">
          Estimated cost: ~{ESTIMATED_GAS_SOL} SOL (rent + tx fee)
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || success}
          className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            success
              ? 'bg-green-500 text-white'
              : 'bg-[var(--color-accent)] text-black disabled:opacity-50'
          }`}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {success && <Check size={16} />}
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save to Blockchain'}
        </button>
      </div>
    </BottomSheet>
  )
}
