/**
 * Safely convert a Uint8Array to a clean ArrayBuffer slice that is
 * fully compatible with WebCrypto, Blob, and other APIs that reject
 * SharedArrayBuffer or non-exact views.
 */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const sliced = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  )

  if (!(sliced instanceof ArrayBuffer)) {
    throw new Error('ORE: SharedArrayBuffer is not supported for this operation')
  }

  return sliced
}
