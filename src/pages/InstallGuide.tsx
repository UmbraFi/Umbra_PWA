import { useState, useEffect } from 'react'
import { detectPlatform } from '../utils/detectDevice'
import { usePWAInstall } from '../hooks/usePWAInstall'

/* ── iOS 5-step guide ── */

const iosSteps = [
  {
    step: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
    title: 'Use Safari browser',
    desc: 'This guide only works in Safari. If you opened this link in another app, tap the Safari icon or copy the URL and open it in Safari.',
  },
  {
    step: 2,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
    title: 'Tap the Share button',
    desc: 'Find the share icon (square with an upward arrow) at the bottom center of Safari.',
  },
  {
    step: 3,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    title: 'Tap "Add to Home Screen"',
    desc: 'Scroll down in the share menu and tap "Add to Home Screen".',
  },
  {
    step: 4,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    title: 'Tap "Add"',
    desc: 'Confirm by tapping "Add" in the top-right corner. UmbraFi will appear on your home screen.',
  },
  {
    step: 5,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    title: 'Open UmbraFi from Home Screen',
    desc: 'Find the UmbraFi icon on your home screen and tap it. The app will launch in full-screen mode — just like a native app.',
  },
]

function IOSGuide() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <main
      className="max-w-lg mx-auto px-6 py-10 transition-all duration-700 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(204,255,0,0.15)] border border-[rgba(204,255,0,0.3)] text-xs font-semibold text-[var(--color-text-secondary)] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          iOS
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-3">
          Install UmbraFi
        </h1>
        <p className="text-[var(--color-text-secondary)] leading-relaxed">
          Add UmbraFi to your home screen to use it as a full-screen app — no app store needed.
        </p>
      </div>

      <div className="space-y-4">
        {iosSteps.map((s) => (
          <div
            key={s.step}
            className="flex gap-4 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-text)] text-[var(--color-surface)] text-sm font-bold flex items-center justify-center">
                {String(s.step).padStart(2, '0')}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <h3 className="font-semibold text-[var(--color-text)]">{s.title}</h3>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Fully decentralized. Your data stays yours.
          </span>
        </div>
      </div>
    </main>
  )
}

/* ── Android one-click install ── */

function AndroidGuide() {
  const { canInstall, installed, installPWA } = usePWAInstall()
  const [show, setShow] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleInstall = async () => {
    setInstalling(true)
    const accepted = await installPWA()
    if (!accepted) setInstalling(false)
  }

  return (
    <main
      className="max-w-lg mx-auto px-6 py-10 transition-all duration-700 ease-out flex flex-col items-center justify-center min-h-[60vh]"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(204,255,0,0.15)] border border-[rgba(204,255,0,0.3)] text-xs font-semibold text-[var(--color-text-secondary)] mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        Android
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-3 text-center">
        Install UmbraFi
      </h1>
      <p className="text-[var(--color-text-secondary)] leading-relaxed text-center mb-8">
        Install UmbraFi as a native app on your device.
      </p>

      {installed ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-[var(--color-text)] font-semibold">Installed successfully!</p>
          <p className="text-sm text-[var(--color-text-secondary)] text-center">
            Please open UmbraFi from your home screen.
          </p>
        </div>
      ) : installing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <p className="text-[var(--color-text)] font-semibold">Installing...</p>
          <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed">
            Please wait for the browser to finish installing.<br />
            Do not close this page.
          </p>
        </div>
      ) : canInstall ? (
        <button
          onClick={handleInstall}
          className="btn-accent px-8 py-4 rounded-2xl text-base cursor-pointer"
        >
          INSTALL UMBRAFI
        </button>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tap the browser menu (⋮) and select "Add to Home screen" or "Install app".
          </p>
        </div>
      )}

      <div className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Fully decentralized. Your data stays yours.
        </span>
      </div>
    </main>
  )
}

/* ── PC fallback ── */

function PCGuide() {
  return (
    <main className="max-w-lg mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-3">
        Open on your phone
      </h1>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">
        UmbraFi is designed as a mobile app. Please visit this page on your iPhone or Android device to install.
      </p>
    </main>
  )
}

/* ── Main InstallGuide page ── */

export default function InstallGuide() {
  const platform = detectPlatform()

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/85 border-b border-[var(--color-border)]">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(204,255,0,0.35)]" />
            <span className="font-bold text-[var(--color-text)]">UmbraFi</span>
          </div>
        </div>
      </header>

      {platform === 'ios' && <IOSGuide />}
      {platform === 'android' && <AndroidGuide />}
      {platform === 'pc' && <PCGuide />}
    </div>
  )
}
