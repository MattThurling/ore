export interface OreTrackManifest {
  /**
   * Manifest format version.
   * Lets you change structure later without breaking old clients.
   */
  version: 'ore-track-0.1'

  /**
   * Info about the media this manifest describes.
   */
  media: {
    mimeType: string          // e.g. "audio/mpeg"
    sizeBytes: number         // original plaintext size
  }

  /**
   * Encryption parameters needed for decryption.
   */
  encryption: {
    algorithm: 'AES-GCM'
    keyLengthBits: 256
    ivBase64: string          // IV encoded as base64
  }

  /**
   * Optional human / app-level metadata.
   * This is deliberately minimal and non-opinionated.
   */
  meta?: {
    trackId?: string
    title?: string
    artist?: string
    album?: string
  }
}
