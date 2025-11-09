# PlatformIO Setup (Seeeduino XIAO)

This project includes a microcontroller component for the **Seeeduino XIAO** (SAMD21 Cortex-M0+) board located in the `seeduino_xiao/` directory.

## Hardware

- **Board**: Seeeduino XIAO
- **MCU**: SAMD21G18A (ARM Cortex-M0+)
- **Clock**: 48MHz
- **RAM**: 32KB
- **Flash**: 256KB

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
# Build firmware
pnpm pio:build

# Upload to microcontroller (builds first if needed)
pnpm pio:upload

# Build and upload in one command (recommended)
pnpm pio:build-upload

# Open serial monitor for debugging
pnpm pio:monitor

# Clean build artifacts
pnpm pio:clean
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
│   └── main.cpp          # Main Arduino sketch
├── test/                 # Unit tests
└── platformio.ini        # PlatformIO configuration
```

## Configuration

The `platformio.ini` file defines the build environment:

```ini
[env:seeed_xiao]
platform = atmelsam
board = seeed_xiao
framework = arduino
```

### Adding Libraries

Add libraries to `platformio.ini`:

```ini
[env:seeed_xiao]
platform = atmelsam
board = seeed_xiao
framework = arduino
lib_deps =
    adafruit/Adafruit NeoPixel @ ^1.10.0
    arduino-libraries/Servo @ ^1.1.8
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

## Resources

- [PlatformIO Documentation](https://docs.platformio.org/)
- [Seeeduino XIAO Board Info](https://docs.platformio.org/page/boards/atmelsam/seeed_xiao.html)
- [Seeeduino XIAO Wiki](https://wiki.seeedstudio.com/Seeeduino-XIAO/)
- [SAMD21 Datasheet](https://www.microchip.com/wwwproducts/en/ATSAMD21G18)
