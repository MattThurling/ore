import type { OreTrackManifest } from '../types/manifest.js'
import { uint8ToBase64, base64ToUint8 } from '../utils/bytes.js'

export interface CreateTrackManifestParams {
  mimeType: string
  sizeBytes: number
  iv: Uint8Array
  meta?: OreTrackManifest['meta']
}

/**
 * Build a manifest for an encrypted track.
 */
export function createTrackManifest(
  params: CreateTrackManifestParams
): OreTrackManifest {
  const { mimeType, sizeBytes, iv, meta } = params

  return {
    version: 'ore-track-0.1',
    media: {
      mimeType,
      sizeBytes,
    },
    encryption: {
      algorithm: 'AES-GCM',
      keyLengthBits: 256,
      ivBase64: uint8ToBase64(iv),
    },
    meta,
  }
}

/**
 * Extract the IV from a manifest as raw bytes.
 */
export function getIvFromManifest(manifest: OreTrackManifest): Uint8Array {
  return base64ToUint8(manifest.encryption.ivBase64)
}
