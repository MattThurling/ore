import { getCryptoOrThrow } from './contentKey.js'
import { AES_GCM_IV_LENGTH_BYTES } from './aesGcm.js'
import { uint8ToBase64, base64ToUint8 } from '../utils/bytes.js'
import { toArrayBuffer } from '../utils/buffer.js'

export interface OreEnvelope {
  version: 'e0'
  epk: JsonWebKey
  iv: string
  sk: string
}

/**
 * Generate an ECDH keypair for ORE encryption.
 * This is what a user's "encryption keypair" will be (likely held in the vault).
 */
export async function generateEncryptionKeyPair(): Promise<CryptoKeyPair> {
  const cryptoObj = getCryptoOrThrow()

  return cryptoObj.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable (public will be shared)
    ['deriveKey']
  )
}

/**
 * Export a public ECDH key to JWK, so it can be stored / shared.
 */
export async function exportEncryptionPublicKeyToJwk(
  publicKey: CryptoKey
): Promise<JsonWebKey> {
  const cryptoObj = getCryptoOrThrow()
  return cryptoObj.subtle.exportKey('jwk', publicKey)
}

/**
 * Import a public ECDH key from JWK.
 * Useful when you only have a stored JSON representation.
 */
export async function importEncryptionPublicKeyFromJwk(
  jwk: JsonWebKey
): Promise<CryptoKey> {
  const cryptoObj = getCryptoOrThrow()

  return cryptoObj.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  )
}

/**
 * Seal a content key (raw bytes) to a recipient's ECDH public key.
 *
 * - contentKeyBytes: 32-byte AES-GCM key you use for the track
 * - recipientPublicKey: user's ECDH public key (CryptoKey)
 */
export async function sealContentKey(
  contentKeyBytes: Uint8Array,
  recipientPublicKey: CryptoKey
): Promise<OreEnvelope> {
  const cryptoObj = getCryptoOrThrow()

  // 1. Generate ephemeral ECDH keypair for this envelope
  const ephemeralKeyPair = await cryptoObj.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  )

  // 2. Export ephemeral public key so the recipient can use it to derive the same AES key
  const ephemeralPublicKeyJwk = await cryptoObj.subtle.exportKey(
    'jwk',
    ephemeralKeyPair.publicKey
  )

  // 3. Derive an AES-GCM key using ECDH(ephemeralPriv, recipientPub)
  const aesKey = await cryptoObj.subtle.deriveKey(
    {
      name: 'ECDH',
      public: recipientPublicKey,
    },
    ephemeralKeyPair.privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )

  // 4. Generate IV for wrapping the content key
  const iv = new Uint8Array(AES_GCM_IV_LENGTH_BYTES)
  cryptoObj.getRandomValues(iv)

  // 5. Encrypt the content key with AES-GCM
  const wrapped = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    aesKey,
    toArrayBuffer(contentKeyBytes)
  )

  const sealedBytes = new Uint8Array(wrapped)

  // 6. Encode IV + sealed key as base64 for JSON storage
  return {
    version: 'e0',
    epk: ephemeralPublicKeyJwk,
    iv: uint8ToBase64(iv),
    sk: uint8ToBase64(sealedBytes),
  }
}

/**
 * Open an envelope using the recipient's ECDH private key.
 *
 * - envelope: the ORE envelope object
 * - recipientPrivateKey: ECDH private key from the user's vault
 *
 * Returns: original contentKeyBytes (Uint8Array)
 */
export async function openEnvelope(
  envelope: OreEnvelope,
  recipientPrivateKey: CryptoKey
): Promise<Uint8Array> {
  const cryptoObj = getCryptoOrThrow()

  // 1. Import ephemeral public key from the envelope
  const ephemeralPublicKey = await cryptoObj.subtle.importKey(
    'jwk',
    envelope.epk,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  )

  // 2. Derive the same AES key using ECDH(recipientPriv, ephemeralPub)
  const aesKey = await cryptoObj.subtle.deriveKey(
    {
      name: 'ECDH',
      public: ephemeralPublicKey,
    },
    recipientPrivateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )

  // 3. Decode IV and sealed key from base64
  const iv = base64ToUint8(envelope.iv)
  const sealedKeyBytes = base64ToUint8(envelope.sk)

  const slicedCipher = sealedKeyBytes.buffer.slice(
    sealedKeyBytes.byteOffset,
    sealedKeyBytes.byteOffset + sealedKeyBytes.byteLength
  )
  if (!(slicedCipher instanceof ArrayBuffer)) {
    throw new Error('SharedArrayBuffer is not supported for sealed content keys')
  }
  const cipherBuffer: ArrayBuffer = slicedCipher

  const slicedIv = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)
  if (!(slicedIv instanceof ArrayBuffer)) {
    throw new Error('SharedArrayBuffer is not supported for AES-GCM IV')
  }
  const ivBuffer: ArrayBuffer = slicedIv

  // 4. Decrypt back to the original content key bytes
  const unwrapped = await cryptoObj.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    aesKey,
    toArrayBuffer(sealedKeyBytes)
  )

  return new Uint8Array(unwrapped)
}
