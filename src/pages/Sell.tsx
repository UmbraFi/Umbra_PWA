import { useState } from 'react'
import { Camera } from 'lucide-react'

export default function Sell() {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'Tops',
    size: '',
    condition: 'New' as const,
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Listing submitted (mock). Connect Solana wallet to publish on-chain.')
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-lg mx-auto py-5">
      <h1 className="text-xl font-semibold mb-5">New Listing</h1>

      {/* Photo Upload Area */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2">
          <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-gray-400 transition-colors">
            <Camera size={22} className="text-[var(--color-text-secondary)]" />
            <span className="text-xs text-[var(--color-text-secondary)]">Add Photo</span>
          </button>
          <div className="aspect-square rounded-lg bg-gray-100" />
          <div className="aspect-square rounded-lg bg-gray-100" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Item Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
            placeholder="e.g. Phantom Hoodie"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Brand</label>
            <input
              type="text"
              required
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
              placeholder="e.g. UMBRA"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Price (SOL)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none"
            >
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Shoes</option>
              <option>Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Size</label>
            <input
              type="text"
              value={form.size}
              onChange={(e) => update('size', e.target.value)}
              className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)]"
              placeholder="M / 42"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
              className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none"
            >
              <option>New</option>
              <option>Like New</option>
              <option>Used</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-3 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-border-strong)] resize-none"
            placeholder="Describe your item..."
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3.5 rounded-lg"
        >
          List Item
        </button>
      </form>
    </div>
  )
}
