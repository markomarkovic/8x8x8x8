/**
 * Compresses a string using the Compression Streams API with gzip
 * @param data The string to compress
 * @returns Base64-encoded compressed data
 */
export const compress = async (data: string): Promise<string> => {
  const encoder = new TextEncoder()
  const inputBytes = encoder.encode(data)

  // Create a compression stream with gzip (maximum compression available)
  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()
  writer.write(inputBytes)
  writer.close()

  // Read the compressed data
  const reader = compressionStream.readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // Combine chunks into single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const compressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    compressed.set(chunk, offset)
    offset += chunk.length
  }

  // Convert to base64 for URL-safe encoding
  return bytesToBase64(compressed)
}

/**
 * Decompresses a base64-encoded gzip string
 * @param compressedBase64 The base64-encoded compressed data
 * @returns The decompressed string
 */
export const decompress = async (compressedBase64: string): Promise<string> => {
  // Decode base64 to bytes
  const compressed = base64ToBytes(compressedBase64)

  // Use a ReadableStream from the bytes
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressed)
      controller.close()
    },
  })

  // Pipe through decompression
  const decompressedStream = readableStream.pipeThrough(
    new DecompressionStream('gzip')
  )

  // Read the decompressed data
  const reader = decompressedStream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // Combine chunks into single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const decompressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    decompressed.set(chunk, offset)
    offset += chunk.length
  }

  // Convert bytes back to string
  const decoder = new TextDecoder()
  return decoder.decode(decompressed)
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
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '') // Remove padding for shorter URLs
}

/**
 * Converts a base64 string to a Uint8Array
 * Handles URL-safe base64 encoding
 */
const base64ToBytes = (base64: string): Uint8Array => {
  // Restore standard base64
  let restored = base64.replace(/-/g, '+').replace(/_/g, '/')

  // Add back padding if needed
  while (restored.length % 4 !== 0) {
    restored += '='
  }

  const binary = atob(restored)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
