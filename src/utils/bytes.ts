/**
 * Convert Uint8Array → base64 string.
 * Browser-first: uses btoa; throws if not available.
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  if (typeof btoa === "function") {
    return btoa(binary)
  }

  throw new Error("Base64 encoding not supported in this environment")
}

/**
 * Convert base64 string → Uint8Array.
 */
export function base64ToUint8(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(base64)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i)
    }
    return out
  }

  throw new Error("Base64 decoding not supported in this environment")
}
