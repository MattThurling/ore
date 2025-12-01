import { toArrayBuffer } from "../utils/buffer.js"

export const CONTENT_KEY_LENGTH_BYTES = 32

export function getCryptoOrThrow(): Crypto {
  const cryptoObj = (globalThis as any).crypto

  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new Error(
      'WebCrypto getRandomValues is not available in this environment. ' +
        'ORE requires a WebCrypto-compatible runtime for secure key generation.'
    )
  }

  return cryptoObj as Crypto
}

export async function generateContentKey(): Promise<Uint8Array> {
  const cryptoObj = getCryptoOrThrow()

  const keyBytes = new Uint8Array(CONTENT_KEY_LENGTH_BYTES)
  cryptoObj.getRandomValues(keyBytes)

  return keyBytes
}

export async function importAesGcmKeyFromBytes(
  keyBytes: Uint8Array
): Promise<CryptoKey> {
  const cryptoObj = getCryptoOrThrow()

  return cryptoObj.subtle.importKey(
    'raw',
    toArrayBuffer(keyBytes),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function exportAesGcmKeyToBytes(key: CryptoKey): Promise<Uint8Array> {
  const cryptoObj = getCryptoOrThrow()

  const buffer = await cryptoObj.subtle.exportKey('raw', key)
  return new Uint8Array(buffer)
}
