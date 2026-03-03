import { useEffect, useState, useRef } from 'react'
import { Camera, X, Package, Truck, MapPin, Sparkles, Plus, Bot, Check, Globe, Home, Zap, DollarSign } from 'lucide-react'

type ShippingMethod = 'standard' | 'express' | 'pickup'
type ShippingRange = 'local' | 'domestic' | 'international'

interface SellForm {
  description: string
  price: string
  shippingMethod: ShippingMethod
  shippingRange: ShippingRange
}

const SELL_DRAFT_STORAGE_KEY = 'umbrafi.sell.draft'

const DEFAULT_FORM: SellForm = {
  description: '',
  price: '',
  shippingMethod: 'standard',
  shippingRange: 'domestic',
}

const readSellDraft = (): SellForm => {
  try {
    const raw = window.localStorage.getItem(SELL_DRAFT_STORAGE_KEY)
    if (!raw) return DEFAULT_FORM
    const parsed = JSON.parse(raw) as Partial<SellForm>
    return {
      description: typeof parsed.description === 'string' ? parsed.description : '',
      price: typeof parsed.price === 'string' ? parsed.price : '',
      shippingMethod: (['standard', 'express', 'pickup'] as const).includes(parsed.shippingMethod as ShippingMethod)
        ? (parsed.shippingMethod as ShippingMethod)
        : 'standard',
      shippingRange: (['local', 'domestic', 'international'] as const).includes(parsed.shippingRange as ShippingRange)
        ? (parsed.shippingRange as ShippingRange)
        : 'domestic',
    }
  } catch {
    return DEFAULT_FORM
  }
}

const SHIPPING_METHODS: { value: ShippingMethod; label: string; icon: typeof Truck; desc: string }[] = [
  { value: 'standard', label: 'Standard', icon: Package, desc: 'Economy' },
  { value: 'express', label: 'Express', icon: Zap, desc: 'Fast' },
  { value: 'pickup', label: 'Pickup', icon: Home, desc: 'Local' },
]

const SHIPPING_RANGES: { value: ShippingRange; label: string; icon: typeof Globe }[] = [
  { value: 'local', label: 'Local area', icon: MapPin },
  { value: 'domestic', label: 'Domestic', icon: Truck },
  { value: 'international', label: 'International', icon: Globe },
]

export default function Sell() {
  const [form, setForm] = useState<SellForm>(() => readSellDraft())
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.localStorage.setItem(SELL_DRAFT_STORAGE_KEY, JSON.stringify(form))
  }, [form])

  const handlePhotoAdd = () => {
    if (photos.length >= 3) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = 3 - photos.length
    const toAdd = Array.from(files).slice(0, remaining)
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => (prev.length < 3 ? [...prev, ev.target!.result as string] : prev))
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const canSubmit = photos.length >= 1 && form.description.trim().length > 0 && form.price.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      window.localStorage.removeItem(SELL_DRAFT_STORAGE_KEY)
    }, 1800)
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setPhotos([])
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 px-5 flex flex-col items-center text-center gap-5 pb-nav">
        {/* Pulsing agent icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center">
            <Bot size={36} className="text-[var(--color-accent-active)]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-text)] flex items-center justify-center">
            <Check size={13} className="text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Submitted to Agent</h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-[280px] leading-relaxed">
            Our AI agent is analyzing your photos and description. It will generate the title, category and tags automatically.
          </p>
        </div>

        {/* Status steps */}
        <div className="w-full max-w-[260px] mt-2 space-y-3">
          {['Analyzing photos', 'Generating listing', 'Publishing'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  animation: `fadeIn 0.3s ease ${i * 0.4}s both`,
                }}
              >
                <Check size={11} className="text-[var(--color-accent-active)]" />
              </div>
              <span
                className="text-xs text-[var(--color-text-secondary)]"
                style={{ animation: `fadeIn 0.3s ease ${i * 0.4}s both` }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleReset} className="btn-primary px-8 py-3 rounded-xl mt-4">
          List Another Item
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-5 px-4 pb-nav">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-5">
        {['Photos', 'Description', 'Price', 'Shipping'].map((label, i) => {
          const done = i === 0 ? photos.length >= 1 : i === 1 ? form.description.trim().length > 0 : i === 2 ? form.price.trim().length > 0 : true
          return (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                  done
                    ? 'bg-[var(--color-text)] text-white'
                    : 'bg-gray-200 text-[var(--color-text-secondary)]'
                }`}
              >
                {done ? <Check size={9} /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${done ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
                {label}
              </span>
              {i < 3 && <div className="flex-1 h-px bg-gray-200 ml-1" />}
            </div>
          )
        })}
      </div>

      {/* Photo Section */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-text)]">
            Photos
          </label>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{photos.length}/3</span>
        </div>

        {photos.length === 0 ? (
          /* Empty state - large capture area */
          <button
            type="button"
            onClick={handlePhotoAdd}
            className="w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Camera size={22} className="text-[var(--color-text-secondary)]" />
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">
              Tap to take or choose photos
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              1-3 photos required
            </span>
          </button>
        ) : (
          /* Photos grid */
          <div className="flex gap-2">
            {photos.map((src, i) => (
              <div key={i} className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button
                type="button"
                onClick={handlePhotoAdd}
                className="flex-1 aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-0.5 hover:border-gray-400 active:scale-95 transition-all"
              >
                <Plus size={18} className="text-[var(--color-text-secondary)]" />
                <span className="text-[9px] text-[var(--color-text-secondary)]">Add</span>
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">
            Description
          </label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3.5 py-3 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-text)] resize-none leading-relaxed transition-colors"
            placeholder="e.g. iPhone 15 Pro, 256GB, Natural Titanium, mint condition, includes original box..."
          />
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 flex items-center gap-1">
            <Sparkles size={9} />
            Agent will extract title, category & tags from your description
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">
            Price
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
              <DollarSign size={14} />
            </div>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              className="w-full pl-9 pr-3.5 py-3 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--color-text)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Shipping Method */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text)] mb-2">
            Shipping method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIPPING_METHODS.map((m) => {
              const Icon = m.icon
              const active = form.shippingMethod === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, shippingMethod: m.value }))}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border ${
                    active
                      ? 'bg-[var(--color-text)] text-white border-[var(--color-text)]'
                      : 'bg-gray-50 text-[var(--color-text-secondary)] border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Shipping Range */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text)] mb-2">
            Shipping range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIPPING_RANGES.map((r) => {
              const Icon = r.icon
              const active = form.shippingRange === r.value
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, shippingRange: r.value as ShippingRange }))}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border ${
                    active
                      ? 'bg-[var(--color-text)] text-white border-[var(--color-text)]'
                      : 'bg-gray-50 text-[var(--color-text-secondary)] border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[10px]">{r.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            canSubmit
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-active)] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Bot size={16} />
              Submit to Agent
            </>
          )}
        </button>

        {!canSubmit && (
          <p className="text-[10px] text-center text-[var(--color-text-secondary)]">
            {photos.length === 0 && form.description.trim().length === 0
              ? 'Add at least 1 photo and a description to continue'
              : photos.length === 0
              ? 'Add at least 1 photo to continue'
              : form.description.trim().length === 0
              ? 'Add a description to continue'
              : 'Set a price to continue'}
          </p>
        )}
      </form>
    </div>
  )
}
