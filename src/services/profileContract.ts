import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js'

/** Placeholder program ID — replace once the Anchor program is deployed. */
export const PROFILE_PROGRAM_ID_STR = '11111111111111111111111111111112'

function getProgramId() {
  return new PublicKey(PROFILE_PROGRAM_ID_STR)
}

function getConnection() {
  return new Connection(clusterApiUrl('devnet'), 'confirmed')
}

// --- Types ---

export interface AvatarColorLetter { type: 1; color: string; letter: string }
export interface AvatarPreset { type: 2; presetIndex: number }
export interface AvatarSvgIcon { type: 3; color: string; svgIndex: number }
export type AvatarData = AvatarColorLetter | AvatarPreset | AvatarSvgIcon

export interface OnChainProfile {
  avatar: AvatarData
  displayName: string
}

// --- PDA derivation ---

export function deriveProfilePDA(userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('profile'), userPubkey.toBuffer()],
    getProgramId(),
  )
}

// --- Account layout (borsh-style manual deserialization) ---
// Layout: avatarType(1) | color(6) | letter(1) | svgIndex(1) | presetIndex(1) | displayName(32) = 42 bytes

const ACCOUNT_DATA_SIZE = 42

function decodeProfile(data: Buffer): OnChainProfile {
  const avatarType = data[0] as 1 | 2 | 3
  const color = '#' + data.subarray(1, 7).toString('utf8')
  const letter = String.fromCharCode(data[7])
  const svgIndex = data[8]
  const presetIndex = data[9]
  const displayName = data.subarray(10, 42).toString('utf8').replace(/\0+$/, '')

  let avatar: AvatarData
  if (avatarType === 2) {
    avatar = { type: 2, presetIndex }
  } else if (avatarType === 3) {
    avatar = { type: 3, color, svgIndex }
  } else {
    avatar = { type: 1, color, letter }
  }

  return { avatar, displayName }
}

function encodeProfile(profile: OnChainProfile): Buffer {
  const buf = Buffer.alloc(ACCOUNT_DATA_SIZE)
  buf[0] = profile.avatar.type

  const color = profile.avatar.type === 2 ? '000000' : profile.avatar.color.replace('#', '')
  buf.write(color, 1, 6, 'utf8')

  buf[7] = profile.avatar.type === 1 ? profile.avatar.letter.charCodeAt(0) : 0
  buf[8] = profile.avatar.type === 3 ? profile.avatar.svgIndex : 0
  buf[9] = profile.avatar.type === 2 ? profile.avatar.presetIndex : 0

  const nameBytes = Buffer.from(profile.displayName, 'utf8').subarray(0, 32)
  nameBytes.copy(buf, 10)

  return buf
}

// --- Read ---

export async function fetchOnChainProfile(publicKey: string): Promise<OnChainProfile | null> {
  try {
    const userPk = new PublicKey(publicKey)
    const [pda] = deriveProfilePDA(userPk)
    const info = await getConnection().getAccountInfo(pda)
    if (!info || info.data.length < ACCOUNT_DATA_SIZE) return null
    return decodeProfile(Buffer.from(info.data))
  } catch {
    return null
  }
}

// --- Write ---

export function buildUpdateProfileTx(publicKey: string, profile: OnChainProfile): Transaction {
  const userPk = new PublicKey(publicKey)
  const [pda] = deriveProfilePDA(userPk)

  const data = Buffer.concat([
    Buffer.from([0]), // instruction index 0 = update_profile
    encodeProfile(profile),
  ])

  const ix = new TransactionInstruction({
    programId: getProgramId(),
    keys: [
      { pubkey: userPk, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false },
    ],
    data,
  })

  const tx = new Transaction().add(ix)
  return tx
}

/** Estimated rent + transaction fee in SOL */
export const ESTIMATED_GAS_SOL = 0.003
