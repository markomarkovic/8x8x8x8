# PlatformIO Setup (Seeeduino XIAO)

This project includes a microcontroller component for the **Seeeduino XIAO** (SAMD21 Cortex-M0+) board located in the `seeduino_xiao/` directory.

## Hardware

### Microcontroller

- **Board**: Seeeduino XIAO
- **MCU**: SAMD21G18A (ARM Cortex-M0+)
- **Clock**: 48MHz
- **RAM**: 32KB
- **Flash**: 256KB

### LED Matrix

- **Type**: WS2812B (NeoPixel) 8×8 LED matrix
- **Pin**: GPIO 10 (configurable in `main.cpp`)
- **Voltage**: 5V
- **Total LEDs**: 64 pixels
- **Protocol**: Single-wire addressable RGB

### Wiring

```
Seeeduino XIAO  →  WS2812B Matrix
─────────────────────────────────
5V              →  VCC/5V
GND             →  GND
Pin 10          →  DIN (Data In)
```

**Power Considerations:**

- Each LED can draw up to ~60mA at full white brightness
- 64 LEDs × 60mA = 3.84A maximum theoretical draw
- The firmware uses `BRIGHTNESS 32` (out of 255) to keep power draw manageable
- For full brightness, use an external 5V power supply (not USB power)

## Prerequisites

### Install PlatformIO via uv

This project uses [uv](https://github.com/astral-sh/uv) for Python package management:

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install PlatformIO
uv tool install platformio
```

**Note**: All scripts use `uv tool run platformio` to avoid conflicts with system Python packages.

## Available Scripts

All PlatformIO scripts are prefixed with `pio:`:

```bash
# Generate animations.h from animations.txt
pnpm animations:generate

# Build firmware (auto-generates animations.h first)
pnpm pio:build

# Upload to microcontroller (builds first if needed)
pnpm pio:upload

# Build and upload in one command (recommended)
pnpm pio:build-upload

# Build, upload, and open serial monitor
pnpm pio:all

# Open serial monitor for debugging
pnpm pio:monitor

# Clean build artifacts
pnpm pio:clean
```

**Note:** `pio:build`, `pio:build-upload`, and `pio:all` automatically run `animations:generate` first to ensure animations are up-to-date.

## Animation System

### Workflow Overview

The animation system works in three stages:

1. **Create** - Design animations in the web app at [eightxeightxeightxeight.web.app](https://eightxeightxeightxeight.web.app)
2. **Export** - Copy the hex string from the info modal's "Hardware Export" section
3. **Deploy** - Add hex strings to `seeduino_xiao/animations.txt` and upload to hardware

### Animation Format

Each animation is encoded as a **560-character hexadecimal string**:

```
Format: [palette:48 chars][frames:512 chars]

Palette (48 chars):
  - 8 colors × 6 hex chars per color (RRGGBB)
  - Example: FF0000 = red, 00FF00 = green, 0000FF = blue

Frames (512 chars):
  - 8 frames × 64 pixels × 1 hex digit per pixel
  - Each hex digit (0-7) is a palette color index
  - Example: 0 = first palette color, 7 = eighth palette color
```

**Example hex string:**

```
FF000000FF0000FF00...  (560 total characters)
└─────────────────┘
  48-char palette
```

### Adding Animations

1. **Create animation** in the web app
2. **Copy hex string** from Info Modal → Hardware Export section
3. **Edit** `seeduino_xiao/animations.txt`:

```
# animations.txt - One animation per line, # for comments

# Rainbow gradient
FF000000FF0000FF00FFFF00FF00FF00000FFFF000001234567...

# Red blink
FF00000000000000000000000000000000000000000000000000...

# Your custom animation
<paste hex string here>
```

4. **Build and upload:**

```bash
pnpm pio:build-upload
```

The build system automatically:

- Parses `animations.txt`
- Generates `seeduino_xiao/src/animations.h` with PROGMEM arrays
- Compiles firmware with your animations

### Playback Behavior

- **Speed**: 8 FPS (125ms per frame)
- **Duration**: 8 seconds per animation (64 frames = 8 frames × 8 cycles)
- **Order**: Random shuffle using Fisher-Yates algorithm
- **Loop**: Reshuffles and continues indefinitely

### Memory Usage

Each animation consumes **536 bytes**:

- Palette: 24 bytes (8 colors × 3 bytes RGB)
- Frames: 512 bytes (8 frames × 64 pixels)

**Storage location**: PROGMEM (Flash) - animations are stored in the microcontroller's Flash memory, not RAM.

**Capacity calculation:**

```
Available Flash: 256 KB
Firmware size: ~50 KB
Available for animations: ~200 KB
Maximum animations: 200,000 ÷ 536 ≈ 373 animations
```

Practical limit is much lower due to other code and libraries. With current firmware, you can store **100-150 animations** comfortably.

### Configuration

Edit `seeduino_xiao/src/main.cpp` to customize:

```cpp
#define LED_PIN 10               // GPIO pin for LED matrix
#define BRIGHTNESS 32            // 0-255 (32 = dim, 255 = max)
#define FPS 8                    // Frames per second
#define ANIMATION_DURATION_SEC 8 // Seconds per animation
```

## VS Code IntelliSense Setup

Since the PlatformIO project is in a subdirectory (`seeduino_xiao/`) rather than the root, VS Code needs special configuration to detect C++ includes properly.

### Generating Configuration

If you modify `platformio.ini` or add libraries, regenerate the configuration:

```bash
cd seeduino_xiao
uv tool run platformio init --ide vscode

# Copy updated config to root
cp .vscode/c_cpp_properties.json ../.vscode/
```

### Manual Steps (If Needed)

If you still see IntelliSense errors on `#include <Arduino.h>`:

1. **Reload VS Code Window**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Run: `Developer: Reload Window`

2. **Select IntelliSense Configuration** (if errors persist)
   - Open `seeduino_xiao/src/main.cpp`
   - Press `Ctrl+Shift+P`
   - Search for: `C/C++: Select IntelliSense Configuration`
   - Select **"PlatformIO"** from the list

3. **Verify C/C++ Extension**
   - Make sure you have the C/C++ extension installed
   - Extension ID: `ms-vscode.cpptools`

## Project Structure

```
seeduino_xiao/
├── .vscode/              # PlatformIO-generated VS Code config
│   ├── c_cpp_properties.json
│   ├── extensions.json
│   └── launch.json
├── include/              # Header files
├── lib/                  # Custom libraries
├── src/
│   ├── main.cpp          # Main Arduino sketch (animation player)
│   └── animations.h      # Generated: PROGMEM animation arrays
├── test/                 # Unit tests
├── animations.txt        # Animation config (hex strings, one per line)
└── platformio.ini        # PlatformIO configuration

tools/
├── hex-to-cpp.ts         # Build tool: converts animations.txt → animations.h
└── generate-test-animations.ts  # Helper: generates valid test hex strings
```

## Configuration

The `platformio.ini` file defines the build environment:

```ini
[env:seeed_xiao]
platform = atmelsam
board = seeed_xiao
framework = arduino
lib_deps =
    adafruit/Adafruit NeoPixel @ ^1.12.0
```

### Adding Additional Libraries

Add more libraries to `platformio.ini`:

```ini
[env:seeed_xiao]
platform = atmelsam
board = seeed_xiao
framework = arduino
lib_deps =
    adafruit/Adafruit NeoPixel @ ^1.12.0
    arduino-libraries/Servo @ ^1.1.8
    # Add more libraries here
```

Then rebuild:

```bash
pnpm pio:build
```

## Troubleshooting

### `ModuleNotFoundError: No module named 'platformio'`

This means PlatformIO isn't installed or isn't in your PATH. Install via uv:

```bash
uv tool install platformio
```

### `error: externally-managed-environment`

Don't use `pip install platformio` on Debian/Ubuntu systems. Use `uv` instead (see Prerequisites above).

### Serial Port Permission Denied

On Linux, add your user to the `dialout` group:

```bash
sudo usermod -a -G dialout $USER
# Log out and log back in for changes to take effect
```

### IntelliSense Errors in VS Code

1. Reload the VS Code window (`Ctrl+Shift+P` → `Developer: Reload Window`)
2. Select the PlatformIO configuration (see VS Code IntelliSense Setup above)
3. If still broken, regenerate the configuration (see Generating Configuration above)

### Build Fails After Clean Install

Install the platform and frameworks:

```bash
cd seeduino_xiao
uv tool run platformio run
# First build will download required packages
```

## Serial Monitor Usage

Open the serial monitor to view debug output:

```bash
pnpm pio:monitor
```

Default baud rate is 115200. To change it, add to `platformio.ini`:

```ini
[env:seeed_xiao]
platform = atmelsam
board = seeed_xiao
framework = arduino
monitor_speed = 9600
```

Press `Ctrl+C` to exit the serial monitor.

### Animation-Related Errors

#### `Invalid hex string length` during `animations:generate`

Your hex string in `animations.txt` isn't exactly 560 characters. Each animation must be:

- 48 chars for palette (8 colors × 6 hex chars)
- 512 chars for frames (8 frames × 64 pixels)

Use the web app's "Hardware Export" feature to get correctly formatted hex strings.

#### `No animations found` or empty `animations.h`

Check that `seeduino_xiao/animations.txt` exists and contains at least one valid hex string. Lines starting with `#` are comments and blank lines are ignored.

#### LEDs not lighting up

1. Check wiring (Pin 10, 5V, GND)
2. Verify LED matrix type (WS2812B/NeoPixel)
3. Try increasing `BRIGHTNESS` in `main.cpp` (default is 32)
4. Check serial monitor output: `pnpm pio:monitor`

#### Animations playing at wrong speed

The speed is controlled by `FPS` in `main.cpp`:

```cpp
#define FPS 8  // Change to 4, 16, etc.
```

Rebuild and upload after changing.

## Resources

### Microcontroller

- [PlatformIO Documentation](https://docs.platformio.org/)
- [Seeeduino XIAO Board Info](https://docs.platformio.org/page/boards/atmelsam/seeed_xiao.html)
- [Seeeduino XIAO Wiki](https://wiki.seeedstudio.com/Seeeduino-XIAO/)
- [SAMD21 Datasheet](https://www.microchip.com/wwwproducts/en/ATSAMD21G18)

### LED Matrix

- [WS2812B Datasheet](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf)
- [Adafruit NeoPixel Library](https://github.com/adafruit/Adafruit_NeoPixel)
- [Adafruit NeoPixel Überguide](https://learn.adafruit.com/adafruit-neopixel-uberguide)

### Web App

- [8×8×8×8 Web App](https://eightxeightxeightxeight.web.app)
- [Project Repository](https://github.com/markomarkovic/8x8x8x8)
