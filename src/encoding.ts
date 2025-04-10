import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

// deflateSync and inflateSync correspond to deflateRaw and inflateRaw without a checksum or header
// https://github.com/101arrowz/fflate/issues/174#issuecomment-1646629549

export function compressAndEncode(text: string): string {
    try {
      const bytes = strToU8(text);
      const compressed = deflateSync(bytes);
      // pass true as we want a binary string for btoa
      return encode(strFromU8(compressed, true));
    } catch (e) {
      console.error("Failed to compress and encode string:", e);
      return "";
    }
}
  
export function decodeAndDecompress(encoded: string): string {
    try {
      const base64decoded = decode(encoded);
      const bytes = strToU8(base64decoded)
      const decompressed = inflateSync(bytes);
      return strFromU8(decompressed)
    } catch (e) {
      console.error("Failed to decode and decompress string:", e);
      return "";
    }
}
  
export function encode(text: string): string {
    try {
      return btoa(text);
    } catch (e) {
      console.error("Failed to encode string to base64:", e);
      return "";
    }
}
  
export function decode(encoded: string): string {
    try {
      return atob(encoded);
    } catch (e) {
      console.error("Failed to decode base64 string:", e);
      return "";
    }
}