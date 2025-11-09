#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include "animations.h"

// LED Matrix Configuration
#define LED_PIN 10
#define MATRIX_WIDTH 8
#define MATRIX_HEIGHT 8
#define NUM_LEDS (MATRIX_WIDTH * MATRIX_HEIGHT)
#define BRIGHTNESS 32 // 0-255, start dim for testing
#define FPS 8
#define FRAME_DELAY (1000 / FPS)    // 125ms per frame
#define ANIMATION_DURATION_SEC 8    // Play each animation for 8 seconds (64 frames)
#define NUM_FRAMES_PER_ANIMATION 64 // 8 seconds at 8 FPS

Adafruit_NeoPixel matrix(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

// Animation playback state
uint8_t animationOrder[NUM_ANIMATIONS];
uint8_t currentAnimationIndex = 0;

// Function declarations
void shuffleAnimations();
uint32_t getPaletteColor(uint8_t animIndex, uint8_t colorIdx);
void playAnimation(uint8_t animIndex);
void displayFrame(uint8_t animIndex, uint8_t frameIndex);

void setup()
{
  Serial.begin(115200);
  delay(100);
  Serial.println("8x8x8x8 LED Matrix Player");
  Serial.print("Loaded ");
  Serial.print(NUM_ANIMATIONS);
  Serial.println(" animations");

  matrix.begin();
  matrix.setBrightness(BRIGHTNESS);
  matrix.show(); // Initialize all pixels to 'off'

  // Seed random number generator with analog noise
  randomSeed(analogRead(0) + micros());

  // Initialize shuffle
  shuffleAnimations();

  Serial.println("Matrix initialized on pin 10");
  Serial.println("Starting random playback (8 seconds per animation)...");
}

void loop()
{
  // Get current animation index from shuffled order
  uint8_t animIndex = animationOrder[currentAnimationIndex];

  Serial.print("Playing animation ");
  Serial.print(animIndex + 1);
  Serial.print(" of ");
  Serial.println(NUM_ANIMATIONS);

  // Play the animation (64 frames = 8 seconds)
  playAnimation(animIndex);

  // Move to next animation
  currentAnimationIndex++;

  // If we've played all animations, reshuffle and start over
  if (currentAnimationIndex >= NUM_ANIMATIONS)
  {
    currentAnimationIndex = 0;
    Serial.println("Reshuffling animations...");
    shuffleAnimations();
  }
}

// Fisher-Yates shuffle algorithm for random animation order
void shuffleAnimations()
{
  // Initialize array with sequential indices
  for (uint8_t i = 0; i < NUM_ANIMATIONS; i++)
  {
    animationOrder[i] = i;
  }

  // Shuffle using Fisher-Yates algorithm
  for (uint8_t i = NUM_ANIMATIONS - 1; i > 0; i--)
  {
    uint8_t j = random(i + 1);
    uint8_t temp = animationOrder[i];
    animationOrder[i] = animationOrder[j];
    animationOrder[j] = temp;
  }
}

// Get RGB color from palette stored in PROGMEM
uint32_t getPaletteColor(uint8_t animIndex, uint8_t colorIdx)
{
  uint8_t r = pgm_read_byte(&PALETTES[animIndex][colorIdx * 3]);
  uint8_t g = pgm_read_byte(&PALETTES[animIndex][colorIdx * 3 + 1]);
  uint8_t b = pgm_read_byte(&PALETTES[animIndex][colorIdx * 3 + 2]);
  return matrix.Color(r, g, b);
}

// Display a single frame from an animation
void displayFrame(uint8_t animIndex, uint8_t frameIndex)
{
  uint16_t frameOffset = frameIndex * 64;

  for (uint8_t pixelIdx = 0; pixelIdx < 64; pixelIdx++)
  {
    uint8_t colorIdx = pgm_read_byte(&FRAMES[animIndex][frameOffset + pixelIdx]);
    uint32_t color = getPaletteColor(animIndex, colorIdx);
    matrix.setPixelColor(pixelIdx, color);
  }

  matrix.show();
}

// Play an animation for 64 frames (8 seconds at 8 FPS)
void playAnimation(uint8_t animIndex)
{
  // Loop through all 8 frames, 8 times = 64 total frames = 8 seconds
  for (uint8_t cycle = 0; cycle < 8; cycle++)
  {
    for (uint8_t frameIdx = 0; frameIdx < 8; frameIdx++)
    {
      displayFrame(animIndex, frameIdx);
      delay(FRAME_DELAY);
    }
  }
}
