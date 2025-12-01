export type { OreTrackManifest } from "./types/manifest.js"
export type { OreEnvelope } from "./crypto/envelope.js"
export type { OreVault } from "./vault/vault.js"

export {
  createTrackManifest,
  getIvFromManifest,
  type CreateTrackManifestParams,
} from './manifest/trackManifest.js'

export {
  generateEncryptionKeyPair,
  exportEncryptionPublicKeyToJwk,
  importEncryptionPublicKeyFromJwk,
  sealContentKey,
  openEnvelope,
} from './crypto/envelope.js'

export {
  AES_GCM_IV_LENGTH_BYTES,
  encryptBytesAesGcm,
  decryptBytesAesGcm,
} from './crypto/aesGcm.js'

export {
  generateContentKey,
  importAesGcmKeyFromBytes,
  exportAesGcmKeyToBytes,
} from './crypto/contentKey.js'

export { toArrayBuffer } from './utils/buffer.js'

export { initVault } from "./vault/vault.js"

export * from './utils/bytes.js'

