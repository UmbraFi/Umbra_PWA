import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Address {
  id: string
  label: string
  line1: string
  line2: string
  city: string
  country: string
}

const STORAGE_KEY = 'umbra_addresses'

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAddresses(addresses: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>(loadAddresses)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', line1: '', line2: '', city: '', country: '' })

  useEffect(() => {
    saveAddresses(addresses)
  }, [addresses])

  const handleAdd = () => {
    if (!form.line1.trim() || !form.city.trim()) return
    setAddresses((prev) => [
      ...prev,
      { id: Date.now().toString(), ...form },
    ])
    setForm({ label: '', line1: '', line2: '', city: '', country: '' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="px-4 py-4">
      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MapPin size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-lg font-medium mb-1">No addresses yet</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Add a shipping address to get started</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <MapPin size={18} className="text-[var(--color-text-secondary)] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {addr.label && <p className="text-sm font-medium">{addr.label}</p>}
                <p className="text-sm text-[var(--color-text-secondary)]">{addr.line1}</p>
                {addr.line2 && <p className="text-sm text-[var(--color-text-secondary)]">{addr.line2}</p>}
                <p className="text-sm text-[var(--color-text-secondary)]">{addr.city}{addr.country ? `, ${addr.country}` : ''}</p>
              </div>
              <button type="button" onClick={() => handleDelete(addr.id)} className="tap-feedback p-1.5 text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="space-y-3 p-4 rounded-xl bg-white border border-gray-100 mb-4">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (e.g. Home)" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address line 1 *" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Address line 2" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City *" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="tap-feedback flex-1 py-2.5 rounded-lg border border-gray-200 text-sm">Cancel</button>
            <button type="button" onClick={handleAdd} className="tap-feedback flex-1 py-2.5 rounded-lg bg-black text-white text-sm font-medium">Save</button>
          </div>
        </div>
      )}

      <button type="button" onClick={() => setShowForm(true)} className="tap-feedback w-full py-3 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:border-gray-400">
        <Plus size={18} />
        Add Address
      </button>
    </div>
  )
}
