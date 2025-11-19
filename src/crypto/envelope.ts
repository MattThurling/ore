import { uint8ToBase64 } from '../utils/bytes.js'

/**
 * ORE envelope: sealed content key for a recipient public key.
 * In v0.0.1 this is just a type + stub, not real crypto.
 */
export interface OreEnvelope {
  version: string;       // e.g. "ore-envelope-0.1"
  recipientPubKey: string;
  sealedKey: Uint8Array; // ciphertext bytes
}

/**
 * TODO: implement using X25519 + crypto_box_seal style scheme.
 */
export async function sealContentKey(
  contentKey: Uint8Array,
  recipientPubKey: Uint8Array
): Promise<OreEnvelope> {
  // placeholder stub – DO NOT USE IN PRODUCTION YET
  return {
    version: "ore-envelope-0.1",
    recipientPubKey: uint8ToBase64(recipientPubKey),
    sealedKey: contentKey // obviously wrong – just placeholder
  };
}

/**
 * TODO: implement real envelope opening with recipient private key.
 */
export async function openEnvelope(
  envelope: OreEnvelope,
  recipientPrivKey: Uint8Array
): Promise<Uint8Array> {
  // placeholder: just return sealedKey
  return envelope.sealedKey;
}
