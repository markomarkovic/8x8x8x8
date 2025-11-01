/**
 * Compresses a string using the Compression Streams API with gzip
 * @param data The string to compress
 * @returns Base64-encoded compressed data
 */
export const compress = async (data: string): Promise<string> => {
  const inputBytes = new TextEncoder().encode(data)
  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()

  writer.write(inputBytes)
  writer.close()

  const compressedChunks = await readAllChunks(compressionStream.readable)
  const compressed = combineChunks(compressedChunks)

  return bytesToBase64(compressed)
}

/**
 * Decompresses a base64-encoded gzip string
 * @param compressedBase64 The base64-encoded compressed data
 * @returns The decompressed string
 */
export const decompress = async (compressedBase64: string): Promise<string> => {
  const compressed = base64ToBytes(compressedBase64)
  const readableStream = createStreamFromBytes(compressed)
  const decompressionStream = new DecompressionStream('gzip')
  const decompressedStream = readableStream.pipeThrough(
    decompressionStream as any
  ) as ReadableStream<Uint8Array>

  const decompressedChunks = await readAllChunks(decompressedStream)
  const decompressed = combineChunks(decompressedChunks)

  return new TextDecoder().decode(decompressed)
}

/**
 * Converts a Uint8Array to a base64 string
 * Uses URL-safe base64 encoding (replacing + with - and / with _)
 */
const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') // Remove padding for shorter URLs
}

/**
 * Converts a base64 string to a Uint8Array
 * Handles URL-safe base64 encoding
 */
const base64ToBytes = (base64: string): Uint8Array => {
  const standardBase64 = restoreStandardBase64(base64)
  const binary = atob(standardBase64)

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

const restoreStandardBase64 = (urlSafeBase64: string): string => {
  let restored = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/')

  while (restored.length % 4 !== 0) {
    restored += '='
  }

  return restored
}

/**
 * Stream utility functions
 */

const readAllChunks = async (
  stream: ReadableStream<Uint8Array>
): Promise<Uint8Array[]> => {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return chunks
}

const combineChunks = (chunks: Uint8Array[]): Uint8Array => {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const combined = new Uint8Array(totalLength)

  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return combined
}

const createStreamFromBytes = (
  bytes: Uint8Array
): ReadableStream<Uint8Array> => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
}
