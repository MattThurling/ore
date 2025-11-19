// src/vault/inMemoryVault.ts

export interface OreVault {
  getPublicKey(): Promise<Uint8Array>;
  // no direct getPrivateKey in the public API later – all operations go *through* the vault
}

class InMemoryVault implements OreVault {
  private publicKey: Uint8Array;

  constructor(publicKey: Uint8Array) {
    this.publicKey = publicKey;
  }

  async getPublicKey(): Promise<Uint8Array> {
    return this.publicKey;
  }
}

export async function initVault(): Promise<OreVault> {
  // TODO: generate proper X25519 keypair and persist it.
  // For now, just a random 32-byte "pubkey".
  const fakePubKey = new Uint8Array(32);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(fakePubKey);
  } else {
    for (let i = 0; i < fakePubKey.length; i++) {
      fakePubKey[i] = Math.floor(Math.random() * 256);
    }
  }

  return new InMemoryVault(fakePubKey);
}
