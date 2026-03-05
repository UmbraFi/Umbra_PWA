import { create } from 'zustand'
import bs58 from 'bs58'
import { deriveSharedSecret, encrypt, decrypt, computeHash, signHash } from '../services/chatCrypto'
import { sendMessage as apiSend, getMessages as apiGetMessages, getUnreadOrders as apiGetUnread, ChatWebSocket, type WireMessage } from '../services/chatService'
import { getSecretKey } from './useWalletStore'

export interface DisplayMessage {
  id: string
  from: 'me' | 'them' | 'system'
  text: string
  time: string
  ts: number
}

interface ChatState {
  conversations: Record<string, DisplayMessage[]>
  lastHashes: Record<string, string>
  unreadOrders: Set<string>
  wsConnected: boolean
  loading: boolean

  loadMessages: (orderID: string, peerPubKey: string) => Promise<void>
  sendMessage: (orderID: string, peerPubKey: string, plaintext: string) => Promise<void>
  fetchUnread: () => Promise<void>
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  clearSecrets: () => void
  setActiveOrder: (orderID: string | null) => void
}

// Cached shared secrets — cleared on lock
const sharedSecretCache = new Map<string, Uint8Array>()
let wsInstance: ChatWebSocket | null = null
let activeOrderID: string | null = null

function getOrDeriveSecret(peerPubKey: string): Uint8Array {
  let secret = sharedSecretCache.get(peerPubKey)
  if (!secret) {
    const sk = getSecretKey()
    const peerBytes = bs58.decode(peerPubKey)
    secret = deriveSharedSecret(sk, peerBytes)
    sharedSecretCache.set(peerPubKey, secret)
  }
  return secret
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  lastHashes: {},
  unreadOrders: new Set(),
  wsConnected: false,
  loading: false,

  loadMessages: async (orderID, peerPubKey) => {
    set({ loading: true })
    try {
      const secret = getOrDeriveSecret(peerPubKey)
      const myPubKey = bs58.encode(getSecretKey().slice(32))
      const wireMessages = await apiGetMessages(orderID)

      const display: DisplayMessage[] = []
      let lastHash = ''

      for (const wm of wireMessages) {
        let text: string
        try {
          text = await decrypt(secret, wm.text)
        } catch {
          text = '[Unable to decrypt]'
        }
        display.push({
          id: wm.hash,
          from: wm.from === myPubKey ? 'me' : 'them',
          text,
          time: formatTime(wm.ts),
          ts: wm.ts,
        })
        lastHash = wm.hash
      }

      set((s) => ({
        conversations: { ...s.conversations, [orderID]: display },
        lastHashes: { ...s.lastHashes, [orderID]: lastHash },
        loading: false,
      }))
    } catch (e) {
      console.error('[chat] loadMessages error:', e)
      set({ loading: false })
    }
  },

  sendMessage: async (orderID, peerPubKey, plaintext) => {
    const secret = getOrDeriveSecret(peerPubKey)
    const sk = getSecretKey()
    const myPubKey = bs58.encode(sk.slice(32))
    const prevHash = get().lastHashes[orderID] || ''

    const ciphertext = await encrypt(secret, plaintext)
    const ts = Math.floor(Date.now() / 1000)
    const hash = computeHash(orderID, myPubKey, peerPubKey, ciphertext, ts, prevHash)
    const signature = signHash(hash, sk)

    const wire: WireMessage = {
      order_id: orderID,
      from: myPubKey,
      to: peerPubKey,
      text: ciphertext,
      ts,
      prev_hash: prevHash,
      hash,
      signature,
    }

    await apiSend(wire)

    const display: DisplayMessage = {
      id: hash,
      from: 'me',
      text: plaintext,
      time: formatTime(ts),
      ts,
    }

    set((s) => ({
      conversations: {
        ...s.conversations,
        [orderID]: [...(s.conversations[orderID] || []), display],
      },
      lastHashes: { ...s.lastHashes, [orderID]: hash },
    }))
  },

  fetchUnread: async () => {
    try {
      const sk = getSecretKey()
      const myPubKey = bs58.encode(sk.slice(32))
      const orderIds = await apiGetUnread(myPubKey)
      set({ unreadOrders: new Set(orderIds) })
    } catch (e) {
      console.error('[chat] fetchUnread error:', e)
    }
  },

  connectWebSocket: () => {
    if (wsInstance) return
    const sk = getSecretKey()
    const myPubKey = bs58.encode(sk.slice(32))

    wsInstance = new ChatWebSocket(myPubKey, async (wm) => {
      // Decrypt incoming message if it's for the active order
      // Try to find the shared secret from cache; if not cached, skip (will load on open)
      const peerPub = wm.from === myPubKey ? wm.to : wm.from
      const secret = sharedSecretCache.get(peerPub)
      if (!secret) return

      let text: string
      try {
        text = await decrypt(secret, wm.text)
      } catch {
        text = '[Unable to decrypt]'
      }

      const display: DisplayMessage = {
        id: wm.hash,
        from: wm.from === myPubKey ? 'me' : 'them',
        text,
        time: formatTime(wm.ts),
        ts: wm.ts,
      }

      const oid = wm.order_id
      set((s) => ({
        conversations: {
          ...s.conversations,
          [oid]: [...(s.conversations[oid] || []), display],
        },
        lastHashes: { ...s.lastHashes, [oid]: wm.hash },
        unreadOrders: oid !== activeOrderID
          ? new Set([...s.unreadOrders, oid])
          : s.unreadOrders,
      }))
    })

    wsInstance.connect()
    // Poll connection status
    const interval = setInterval(() => {
      if (!wsInstance) { clearInterval(interval); return }
      set({ wsConnected: wsInstance.connected })
    }, 1000)
  },

  disconnectWebSocket: () => {
    if (wsInstance) {
      wsInstance.destroy()
      wsInstance = null
    }
    set({ wsConnected: false })
  },

  clearSecrets: () => {
    sharedSecretCache.clear()
    if (wsInstance) {
      wsInstance.destroy()
      wsInstance = null
    }
    set({ wsConnected: false })
  },

  setActiveOrder: (orderID) => {
    activeOrderID = orderID
    if (orderID) {
      set((s) => {
        const next = new Set(s.unreadOrders)
        next.delete(orderID)
        return { unreadOrders: next }
      })
    }
  },
}))
