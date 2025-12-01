import { getCryptoOrThrow } from './contentKey.js'
import { toArrayBuffer } from '../utils/buffer.js'

export const AES_GCM_IV_LENGTH_BYTES = 12

export interface AesGcmEncrypted {
  ciphertext: Uint8Array
  iv: Uint8Array
}

export async function encryptBytesAesGcm(
  plaintext: Uint8Array,
  key: CryptoKey
): Promise<AesGcmEncrypted> {
  const cryptoObj = getCryptoOrThrow()

  // Generate a fresh random IV
  const iv = new Uint8Array(AES_GCM_IV_LENGTH_BYTES)
  cryptoObj.getRandomValues(iv)

  const result = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(plaintext)
  )

  return {
    ciphertext: new Uint8Array(result),
    iv,
  }
}

export async function decryptBytesAesGcm(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  const cryptoObj = getCryptoOrThrow()

  const result = await cryptoObj.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(ciphertext)
  )

  return new Uint8Array(result)
}
