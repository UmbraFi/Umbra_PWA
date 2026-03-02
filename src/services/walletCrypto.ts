import { Keypair } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import * as bip39 from 'bip39'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletData {
  version: 2
  publicKey: string
  encrypted: { nonce: string; ciphertext: string }
  encryptedMnemonic?: { nonce: string; ciphertext: string }
  pinSalt: string
  createdAt: string
}

const STORAGE_KEY = 'umbra_wallet'
// Solana BIP44 path: m/44'/501'/0'/0'
const SOLANA_PATH = [44, 501, 0, 0]

// ---------------------------------------------------------------------------
// SLIP-0010 Ed25519 HD key derivation (browser-compatible)
// ---------------------------------------------------------------------------

async function hmacSha512(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key as any, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data as any)
  return new Uint8Array(sig)
}

async function slip0010Derive(seed: Uint8Array, path: number[]): Promise<Uint8Array> {
  const enc = new TextEncoder()
  let I = await hmacSha512(enc.encode('ed25519 seed'), seed)
  let key = I.slice(0, 32)
  let chainCode = I.slice(32)

  for (const index of path) {
    const hardenedIndex = (index + 0x80000000) >>> 0
    const data = new Uint8Array(37)
    data[0] = 0x00
    data.set(key, 1)
    data[33] = (hardenedIndex >>> 24) & 0xff
    data[34] = (hardenedIndex >>> 16) & 0xff
    data[35] = (hardenedIndex >>> 8) & 0xff
    data[36] = hardenedIndex & 0xff
    I = await hmacSha512(chainCode, data)
    key = I.slice(0, 32)
    chainCode = I.slice(32)
  }

  return key
}

// ---------------------------------------------------------------------------
// BIP39 Mnemonic helpers
// ---------------------------------------------------------------------------

export function generateMnemonic(): string {
  return bip39.generateMnemonic()
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic)
}

export async function keypairFromMnemonic(mnemonic: string): Promise<{ publicKey: string; secretKey: Uint8Array }> {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const key = await slip0010Derive(new Uint8Array(seed), SOLANA_PATH)
  const kp = Keypair.fromSeed(key)
  return { publicKey: kp.publicKey.toBase58(), secretKey: kp.secretKey }
}

// ---------------------------------------------------------------------------
// Keypair helpers
// ---------------------------------------------------------------------------

export function importFromPrivateKey(base58Key: string) {
  const decoded = bs58.decode(base58Key)
  const kp = Keypair.fromSecretKey(decoded)
  return { publicKey: kp.publicKey.toBase58(), secretKey: kp.secretKey }
}

// ---------------------------------------------------------------------------
// Biometric verification (FaceID / fingerprint)
// ---------------------------------------------------------------------------

export function isWebAuthnAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials?.create
  )
}

export async function verifyBiometric(): Promise<void> {
  if (!isWebAuthnAvailable()) return

  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { name: 'Umbra', id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: 'biometric-check',
        displayName: 'Biometric Check',
      },
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'discouraged',
        userVerification: 'required',
      },
    },
  })

  if (!credential) throw new Error('Biometric verification cancelled')
}

// ---------------------------------------------------------------------------
// Encryption (nacl.secretbox — XSalsa20-Poly1305)
// ---------------------------------------------------------------------------

export function encryptData(
  data: Uint8Array,
  encKey: Uint8Array,
): { nonce: string; ciphertext: string } {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const ciphertext = nacl.secretbox(data, nonce, encKey)
  return {
    nonce: uint8ToBase64(nonce),
    ciphertext: uint8ToBase64(ciphertext),
  }
}

export function decryptData(
  nonce: string,
  ciphertext: string,
  encKey: Uint8Array,
): Uint8Array {
  const decrypted = nacl.secretbox.open(
    base64ToUint8(ciphertext),
    base64ToUint8(nonce),
    encKey,
  )
  if (!decrypted) throw new Error('Decryption failed — wrong PIN or corrupted data')
  return decrypted
}

export function encryptMnemonic(
  mnemonic: string,
  encKey: Uint8Array,
): { nonce: string; ciphertext: string } {
  return encryptData(new TextEncoder().encode(mnemonic), encKey)
}

export function decryptMnemonic(
  nonce: string,
  ciphertext: string,
  encKey: Uint8Array,
): string {
  const bytes = decryptData(nonce, ciphertext, encKey)
  return new TextDecoder().decode(bytes)
}

// ---------------------------------------------------------------------------
// PIN-based key derivation (PBKDF2)
// ---------------------------------------------------------------------------

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

export async function deriveKeyFromPin(
  pin: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const enc = new TextEncoder()

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(pin),
      'PBKDF2',
      false,
      ['deriveBits'],
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: salt as any, iterations: 600_000, hash: 'SHA-256' },
      baseKey,
      256,
    )
    return new Uint8Array(bits)
  }

  // Fallback for environments without crypto.subtle
  const pinBytes = enc.encode(pin)
  let key = nacl.hash(new Uint8Array([...pinBytes, ...salt]))
  for (let i = 0; i < 10_000; i++) {
    key = nacl.hash(new Uint8Array([...key, ...pinBytes, ...salt]))
  }
  return key.slice(0, 32)
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export function loadWalletData(): WalletData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    // Clear v1 (WebAuthn) wallets — early project, safe to discard
    if (data.version !== 2) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data as WalletData
  } catch {
    return null
  }
}

export function saveWalletData(data: WalletData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearWalletData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ---------------------------------------------------------------------------
// Base64 helpers
// ---------------------------------------------------------------------------

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
