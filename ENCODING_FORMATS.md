# URL Encoding Formats

8x8x8x8 supports multiple URL encoding formats, automatically selecting the most efficient one for each animation.

## Format Overview

| Format     | Description                         | Best For                   | Prefix |
| ---------- | ----------------------------------- | -------------------------- | ------ |
| **Legacy** | Uncompressed 560-char hex           | Backward compatibility     | none   |
| **v2**     | Gzip-compressed hex                 | General purpose baseline   | `v2:`  |
| **v3**     | Gzip-compressed delta encoding      | Similar consecutive frames | `v3:`  |
| **v4**     | Gzip-compressed run-length encoding | Solid colors, gradients    | `v4:`  |

## Format Details

### Legacy (Uncompressed)

- **Length**: Always 560 characters
- **Format**: `[palette:48][frames:512]`
- **Use case**: Backward compatibility with pre-compression versions
- **Example**: `ff0000...` (direct hex, no prefix)

### V2: Plain Hex + Gzip

- **Format**: `v2:[base64-gzip-compressed-hex]`
- **Encoding**: Palette + all frames as hex → gzip → base64url
- **Best for**: Random or highly varied animations

### V3: Delta Encoding + Gzip

- **Format**: `v3:[base64-gzip-compressed-delta]`
- **Encoding**:
  - Store first frame completely (64 hex chars)
  - For frames 2-8: store only changed pixels
  - Each delta: `[count:2hex][position:3hex,color:3hex...]`
  - Position and color packed as 9-bit value (position<<3 | color)
- **Best for**: Smooth animations with gradual changes, static images, looping animations

### V4: Run-Length Encoding + Gzip

- **Format**: `v4:[base64-gzip-compressed-rle]`
- **Encoding**:
  - Each frame encoded as runs of consecutive pixels
  - Each run: `[count:2hex][color:3hex,length:3hex...]`
  - Color and run length packed as 9-bit value (color<<6 | (length-1))
  - Maximum run length: 63 pixels
- **Best for**: Solid color fills, gradients, simple geometric shapes

## Automatic Format Selection

The encoder automatically:

1. Encodes the animation in all three formats (v2, v3, v4)
2. Compares uncompressed lengths
3. Compresses the shortest with gzip
4. Updates URL with the winning format

Example console output:

```
Encoding: v3, uncompressed: 234 chars, compressed: 89 chars
```

## Compression Statistics

Typical compression ratios (original 560 chars):

| Animation Type        | Best Format | Typical Size | Reduction |
| --------------------- | ----------- | ------------ | --------- |
| Empty (all black)     | v3 + gzip   | ~60 chars    | 89%       |
| Solid color per frame | v4 + gzip   | ~70 chars    | 87%       |
| Gradual animation     | v3 + gzip   | ~120 chars   | 79%       |
| Checkerboard pattern  | v2 + gzip   | ~180 chars   | 68%       |
| Random noise          | v2 + gzip   | ~200 chars   | 64%       |

## Technical Implementation

### Bit Packing

**V3 Delta Encoding** (9 bits per change):

```
[6 bits: pixel position (0-63)][3 bits: color index (0-7)]
```

**V4 Run-Length Encoding** (9 bits per run):

```
[3 bits: color index (0-7)][6 bits: run length - 1 (0-62)]
```

### URL-Safe Base64

All compressed data uses URL-safe base64:

- Replace `+` with `-`
- Replace `/` with `_`
- Remove padding `=`

### Backward Compatibility

The decoder automatically detects and handles:

- Legacy 560-char uncompressed format
- v2, v3, v4 compressed formats
- Invalid formats → falls back to default state

## Performance Considerations

1. **Encoding is async**: URL updates happen asynchronously to avoid blocking UI
2. **Decoding is event-driven**: Compressed URLs trigger async decompression with custom events
3. **Race condition handling**: Handles cases where decompression completes before React event listeners are set up
4. **Favicon animation**: Special handling ensures animated favicon works with all formats
