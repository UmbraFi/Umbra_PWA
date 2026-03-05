const MINER_URL = import.meta.env.VITE_MINER_URL || 'http://localhost:8080'

/**
 * Upload product images to IPFS via the miner proxy.
 * Accepts base64 data-URL strings (from FileReader.readAsDataURL).
 * Returns an array of CIDs.
 */
export async function uploadImages(productId: string, photos: string[]): Promise<string[]> {
  const form = new FormData()
  form.append('product_id', productId)

  for (let i = 0; i < photos.length; i++) {
    const blob = dataURLtoBlob(photos[i])
    form.append('files', blob, `photo_${i}.jpg`)
  }

  const res = await fetch(`${MINER_URL}/v1/ipfs/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'upload failed' }))
    throw new Error(err.error || 'upload failed')
  }

  const data: { cids: string[] } = await res.json()
  return data.cids
}

/** Build the miner-proxied IPFS URL for a CID. */
export function ipfsUrl(cid: string): string {
  return `${MINER_URL}/v1/ipfs/${cid}`
}

function dataURLtoBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }
  return new Blob([arr], { type: mime })
}
