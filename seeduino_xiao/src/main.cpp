#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

// LED Matrix Configuration
#define LED_PIN 10
#define MATRIX_WIDTH 8
#define MATRIX_HEIGHT 8
#define NUM_LEDS (MATRIX_WIDTH * MATRIX_HEIGHT)
#define BRIGHTNESS 32  // 0-255, start dim for testing
#define FPS 8
#define FRAME_DELAY (1000 / FPS)  // 125ms per frame

Adafruit_NeoPixel matrix(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// Function declarations
void solidColor(uint32_t color, int wait);
void rainbowWave(int offset);
void pixelChase(uint32_t color, int wait);
void rowScan(uint32_t color, int wait);
void columnScan(uint32_t color, int wait);

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("8x8 LED Matrix Test");

  matrix.begin();
  matrix.setBrightness(BRIGHTNESS);
  matrix.show(); // Initialize all pixels to 'off'

  Serial.println("Matrix initialized on pin 10");
}

void loop() {
  // Test Pattern 1: Solid Colors (8 frames each = 1 second)
  Serial.println("Test 1: Red");
  solidColor(matrix.Color(255, 0, 0), FRAME_DELAY * 8);

  Serial.println("Test 2: Green");
  solidColor(matrix.Color(0, 255, 0), FRAME_DELAY * 8);

  Serial.println("Test 3: Blue");
  solidColor(matrix.Color(0, 0, 255), FRAME_DELAY * 8);

  Serial.println("Test 4: White");
  solidColor(matrix.Color(255, 255, 255), FRAME_DELAY * 8);

  // Test Pattern 2: Rainbow Wave (64 frames = 8 seconds)
  Serial.println("Test 5: Rainbow Wave @ 8 FPS");
  for(int frame = 0; frame < 64; frame++) {
    rainbowWave(frame);
  }

  // Test Pattern 3: Pixel Chase (run at 8 FPS)
  Serial.println("Test 6: Pixel Chase @ 8 FPS");
  for(int i = 0; i < 2; i++) {
    pixelChase(matrix.Color(255, 0, 0), FRAME_DELAY);
    pixelChase(matrix.Color(0, 255, 0), FRAME_DELAY);
    pixelChase(matrix.Color(0, 0, 255), FRAME_DELAY);
  }

  // Test Pattern 4: Row by Row (8 frames = 1 second)
  Serial.println("Test 7: Row Scan @ 8 FPS");
  rowScan(matrix.Color(255, 128, 0), FRAME_DELAY);

  // Test Pattern 5: Column by Column (8 frames = 1 second)
  Serial.println("Test 8: Column Scan @ 8 FPS");
  columnScan(matrix.Color(0, 255, 255), FRAME_DELAY);

  delay(2000);
}

// Fill all LEDs with one color
void solidColor(uint32_t color, int wait) {
  for(int i = 0; i < NUM_LEDS; i++) {
    matrix.setPixelColor(i, color);
  }
  matrix.show();
  delay(wait);
}

// Rainbow wave effect
void rainbowWave(int offset) {
  for(int i = 0; i < NUM_LEDS; i++) {
    // ColorHSV uses 16-bit hue (0-65535)
    // Spread rainbow across all pixels and animate with offset
    // Using 2048 per frame = ~2 full rainbow cycles in 64 frames (8 seconds)
    int pixelHue = ((i * 65536 / NUM_LEDS) + (offset * 2048)) & 0xFFFF;
    matrix.setPixelColor(i, matrix.gamma32(matrix.ColorHSV(pixelHue)));
  }
  matrix.show();
  delay(FRAME_DELAY);
}

// Chase a single pixel around the matrix
void pixelChase(uint32_t color, int wait) {
  for(int i = 0; i < NUM_LEDS; i++) {
    matrix.clear();
    matrix.setPixelColor(i, color);
    matrix.show();
    delay(wait);
  }
}

// Scan row by row
void rowScan(uint32_t color, int wait) {
  for(int row = 0; row < MATRIX_HEIGHT; row++) {
    matrix.clear();
    for(int col = 0; col < MATRIX_WIDTH; col++) {
      int ledIndex = row * MATRIX_WIDTH + col;
      matrix.setPixelColor(ledIndex, color);
    }
    matrix.show();
    delay(wait);
  }
}

// Scan column by column
void columnScan(uint32_t color, int wait) {
  for(int col = 0; col < MATRIX_WIDTH; col++) {
    matrix.clear();
    for(int row = 0; row < MATRIX_HEIGHT; row++) {
      int ledIndex = row * MATRIX_WIDTH + col;
      matrix.setPixelColor(ledIndex, color);
    }
    matrix.show();
    delay(wait);
  }
}