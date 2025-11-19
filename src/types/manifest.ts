export interface OreTrackManifest {
  version: string
  mimeType: string
  encryption: {
    algorithm: "AES-GCM"
    keyLength: number
  }
}