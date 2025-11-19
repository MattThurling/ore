export async function generateContentKey(lengthBytes = 32): Promise<Uint8Array> {
  const key = new Uint8Array(lengthBytes)
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(key)
  } else {
    // Node fallback – in real code use node:crypto
    for (let i = 0; i < lengthBytes; i++) {
      key[i] = Math.floor(Math.random() * 256)
    }
  }
  return key
}
