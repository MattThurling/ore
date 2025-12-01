import { getCryptoOrThrow } from '../crypto/contentKey.js'
import {
  generateEncryptionKeyPair,
  exportEncryptionPublicKeyToJwk,
  importEncryptionPublicKeyFromJwk,
  openEnvelope as openEnvelopeWithKey,
  type OreEnvelope,
} from '../crypto/envelope.js'

const STORAGE_KEY = 'ore:v1:encryption-keypair'

interface StoredKeyPairJwk {
  publicKey: JsonWebKey
  privateKey: JsonWebKey
}

export interface OreVault {
  /**
   * Return the user's public ECDH encryption key (CryptoKey).
   */
  getPublicEncryptionKey(): Promise<CryptoKey>

  /**
   * Return the user's public ECDH encryption key as JWK for storage / sharing.
   */
  getPublicEncryptionKeyJwk(): Promise<JsonWebKey>

  /**
   * Open an ORE envelope using the user's private key that lives in the vault.
   * Returns the raw content key bytes (Uint8Array).
   */
  openEnvelope(envelope: OreEnvelope): Promise<Uint8Array>
}

class BrowserLocalStorageVault implements OreVault {
  private keyPairPromise: Promise<CryptoKeyPair>

  constructor(keyPairPromise: Promise<CryptoKeyPair>) {
    this.keyPairPromise = keyPairPromise
  }

  async getPublicEncryptionKey(): Promise<CryptoKey> {
    const kp = await this.keyPairPromise
    return kp.publicKey
  }

  async getPublicEncryptionKeyJwk(): Promise<JsonWebKey> {
    const kp = await this.keyPairPromise
    return exportEncryptionPublicKeyToJwk(kp.publicKey)
  }

  async openEnvelope(envelope: OreEnvelope): Promise<Uint8Array> {
    const kp = await this.keyPairPromise
    // private key never leaves the vault – we just call the shared helper
    return openEnvelopeWithKey(envelope, kp.privateKey)
  }
}

/**
 * Initialize a browser vault backed by localStorage.
 *
 * - If a keypair exists, it is imported and reused.
 * - Otherwise, a new ECDH keypair is generated and stored.
 */
export async function initVault(): Promise<OreVault> {
  ensureBrowserWithStorage()

  const keyPairPromise = loadOrCreateKeyPair()
  return new BrowserLocalStorageVault(keyPairPromise)
}

function ensureBrowserWithStorage(): void {
  if (typeof window === 'undefined') {
    throw new Error('ORE vault: window is not available – browser environment required')
  }
  if (!window.localStorage) {
    throw new Error('ORE vault: localStorage is not available')
  }
}

async function loadOrCreateKeyPair(): Promise<CryptoKeyPair> {
  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as StoredKeyPairJwk
      return importKeyPairFromJwk(parsed)
    } catch {
      // fall through and generate a fresh keypair
    }
  }

  const newKeyPair = await generateEncryptionKeyPair()
  await persistKeyPair(newKeyPair)
  return newKeyPair
}

async function importKeyPairFromJwk(jwkPair: StoredKeyPairJwk): Promise<CryptoKeyPair> {
  const cryptoObj = getCryptoOrThrow()

  const publicKey = await importEncryptionPublicKeyFromJwk(jwkPair.publicKey)

  const privateKey = await cryptoObj.subtle.importKey(
    'jwk',
    jwkPair.privateKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    ['deriveKey']
  )

  return { publicKey, privateKey }
}

async function persistKeyPair(keyPair: CryptoKeyPair): Promise<void> {
  const cryptoObj = getCryptoOrThrow()

  const publicJwk = await cryptoObj.subtle.exportKey('jwk', keyPair.publicKey)
  const privateJwk = await cryptoObj.subtle.exportKey('jwk', keyPair.privateKey)

  const toStore: StoredKeyPairJwk = {
    publicKey: publicJwk,
    privateKey: privateJwk,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}
