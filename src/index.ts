export type { OreTrackManifest } from "./types/manifest.js"
export type { OreEnvelope } from "./crypto/envelope.js"

export { generateContentKey } from "./crypto/contentKey.js"
export { sealContentKey, openEnvelope } from "./crypto/envelope.js"

export { initVault } from "./vault/inMemoryVault.js"

