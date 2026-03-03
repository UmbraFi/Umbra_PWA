import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useSafeBack } from '../hooks/useSafeBack'
import { APP_ROUTE_PATHS } from '../navigation/paths'

export default function Cart() {
  const navigate = useNavigate()
  const goBack = useSafeBack(APP_ROUTE_PATHS.home)
  const cart = useStore((s) => s.cart)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const updateCartQuantity = useStore((s) => s.updateCartQuantity)

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <nav
        className="sticky top-0 z-50 bg-[var(--color-bg)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-3 h-14 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="tap-feedback p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <span className="text-sm font-semibold text-center truncate">Cart</span>
          <button
            type="button"
            onClick={() => navigate(APP_ROUTE_PATHS.home, { replace: true })}
            className="tap-feedback p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Exit to home"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <ShoppingCart size={48} strokeWidth={1.2} className="text-[var(--color-text-secondary)] mb-4" />
          <p className="text-lg font-medium mb-1">Your cart is empty</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tap + on any product to add it here
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-3 pb-32">
          <ul className="divide-y divide-[var(--color-border)]">
            {cart.map((item) => (
              <li key={item.product.id} className="flex gap-3 py-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{item.product.brand}</p>
                  <p className="text-sm font-semibold mt-1">{item.product.price} SOL</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="tap-feedback w-7 h-7 flex items-center justify-center rounded-full border border-[var(--color-border)]"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="tap-feedback w-7 h-7 flex items-center justify-center rounded-full border border-[var(--color-border)]"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="tap-feedback ml-auto p-1.5 text-[var(--color-text-secondary)]"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg)] border-t border-[var(--color-border)] px-4 py-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
                <p className="text-lg font-bold">{total.toFixed(2)} SOL</p>
              </div>
              <button
                type="button"
                className="bg-[var(--color-text)] text-[var(--color-bg)] px-6 py-2.5 rounded-lg font-medium text-sm"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
