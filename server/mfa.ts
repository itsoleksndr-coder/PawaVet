import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function newTotpSecret(): string {
  const source = randomBytes(20);
  let bits = 0, value = 0, output = "";
  for (const byte of source) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) output += alphabet[(value >>> (bits -= 5)) & 31];
  }
  if (bits) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}
function secretBytes(secret: string): Buffer {
  let bits = 0, value = 0;
  const result: number[] = [];
  for (const char of secret) {
    const digit = alphabet.indexOf(char);
    if (digit === -1) throw new Error("Invalid authenticator secret.");
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) result.push((value >>> (bits -= 8)) & 255);
  }
  return Buffer.from(result);
}
export function totpCode(secret: string, time = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 30000)));
  const mac = createHmac("sha1", secretBytes(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return ((mac.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, "0");
}
export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const supplied = Buffer.from(code);
  let valid = false;
  for (const offset of [-30000, 0, 30000]) {
    valid = timingSafeEqual(supplied, Buffer.from(totpCode(secret, now + offset))) || valid;
  }
  return valid;
}
function encryptionKey(): Buffer {
  const encoded = process.env.MFA_ENCRYPTION_KEY || "";
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded)
    throw new Error("MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte secret.");
  return key;
}
export function encryptTotp(secret: string, userId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(userId));
  return Buffer.concat([iv, cipher.update(secret, "utf8"), cipher.final(), cipher.getAuthTag()]).toString("base64");
}
export function decryptTotp(encoded: string, userId: string): string {
  const data = Buffer.from(encoded, "base64");
  if (data.length < 29) throw new Error("Invalid encrypted MFA secret.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), data.subarray(0, 12));
  decipher.setAAD(Buffer.from(userId));
  decipher.setAuthTag(data.subarray(data.length - 16));
  return Buffer.concat([decipher.update(data.subarray(12, -16)), decipher.final()]).toString("utf8");
}
export function recoveryCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    const hex = randomBytes(8).toString("hex").toUpperCase();
    return hex.match(/.{1,4}/g)!.join("-");
  });
}
