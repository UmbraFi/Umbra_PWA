import { ed25519, x25519 } from '@noble/curves/ed25519.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import nacl from 'tweetnacl'

/**
 * Derive a shared secret from my Ed25519 secret key and peer's Ed25519 public key.
 * Matches Go backend SharedSecret() in crypto.go.
 */
export function deriveSharedSecret(mySecretKey: Uint8Array, peerPubKey: Uint8Array): Uint8Array {
  // Ed25519 secret key is 64 bytes; seed is the first 32
  const seed = mySecretKey.slice(0, 32)
  const curvePriv = ed25519.utils.toMontgomerySecret(seed)
  const curvePub = ed25519.utils.toMontgomery(peerPubKey)

  const shared = x25519.scalarMult(curvePriv, curvePub)

  // SHA-256(shared || "umbra-chat-v1") — matches Go backend
  const label = new TextEncoder().encode('umbra-chat-v1')
  const combined = new Uint8Array(shared.length + label.length)
  combined.set(shared)
  combined.set(label, shared.length)
  return sha256(combined)
}

/**
 * Encrypt plaintext with AES-256-GCM. Returns hex(nonce12 + ciphertext).
 * Matches Go backend Encrypt().
 */
export async function encrypt(sharedSecret: Uint8Array, plaintext: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', sharedSecret.slice(0, 32), 'AES-GCM', false, ['encrypt'])
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, encoded)

  const result = new Uint8Array(nonce.length + ciphertext.byteLength)
  result.set(nonce)
  result.set(new Uint8Array(ciphertext), nonce.length)
  return bytesToHex(result)
}

/**
 * Decrypt hex(nonce12 + ciphertext) with AES-256-GCM. Returns plaintext string.
 * Matches Go backend Decrypt().
 */
export async function decrypt(sharedSecret: Uint8Array, ciphertextHex: string): Promise<string> {
  const data = hexToBytes(ciphertextHex)
  const nonce = data.slice(0, 12)
  const ciphertext = data.slice(12)

  const key = await crypto.subtle.importKey('raw', sharedSecret.slice(0, 32), 'AES-GCM', false, ['decrypt'])
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, ciphertext)
  return new TextDecoder().decode(plainBuf)
}

/**
 * Compute message hash: SHA-256("orderID:from:to:text:ts:prevHash").
 * Matches Go backend ComputeHash().
 */
export function computeHash(
  orderID: string, from: string, to: string, text: string, ts: number, prevHash: string,
): string {
  const payload = `${orderID}:${from}:${to}:${text}:${ts}:${prevHash}`
  const hash = sha256(new TextEncoder().encode(payload))
  return bytesToHex(hash)
}

/**
 * Sign hash bytes with Ed25519. Returns hex signature.
 * The Go backend verifies: ed25519.Verify(pubkey, hashBytes, sigBytes).
 */
export function signHash(hashHex: string, secretKey: Uint8Array): string {
  const hashBytes = hexToBytes(hashHex)
  const sig = nacl.sign.detached(hashBytes, secretKey)
  return bytesToHex(sig)
}
