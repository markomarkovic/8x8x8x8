#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include "animations.h"

// LED Matrix Configuration
#define LED_PIN 10
#define MATRIX_WIDTH 8
#define MATRIX_HEIGHT 8
#define NUM_LEDS (MATRIX_WIDTH * MATRIX_HEIGHT)
#define BRIGHTNESS 32 // 0-255, start dim for testing

// Animation Configuration
#define NUM_FRAMES 8                // Number of frames per animation
#define FPS 8                       // Playback speed
#define FRAME_DELAY (1000 / FPS)    // Delay per frame in ms
#define ANIMATION_DURATION_SEC 8    // Duration each animation plays
#define NUM_FRAMES_PER_ANIMATION (FPS * ANIMATION_DURATION_SEC)

// Color Configuration
#define BYTES_PER_COLOR 3 // RGB

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

  Serial.print("Matrix initialized on pin ");
  Serial.println(LED_PIN);
  Serial.print("Starting random playback (");
  Serial.print(ANIMATION_DURATION_SEC);
  Serial.println(" seconds per animation)...");
}

void loop()
{
  // Get current animation index from shuffled order
  uint8_t animIndex = animationOrder[currentAnimationIndex];

  Serial.print("Playing animation ");
  Serial.print(animIndex + 1);
  Serial.print(" of ");
  Serial.println(NUM_ANIMATIONS);

  // Play the animation
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
  uint16_t offset = colorIdx * BYTES_PER_COLOR;
  uint8_t r = pgm_read_byte(&PALETTES[animIndex][offset]);
  uint8_t g = pgm_read_byte(&PALETTES[animIndex][offset + 1]);
  uint8_t b = pgm_read_byte(&PALETTES[animIndex][offset + 2]);
  return matrix.Color(r, g, b);
}

// Display a single frame from an animation
void displayFrame(uint8_t animIndex, uint8_t frameIndex)
{
  uint16_t frameOffset = frameIndex * NUM_LEDS;

  for (uint8_t pixelIdx = 0; pixelIdx < NUM_LEDS; pixelIdx++)
  {
    uint8_t colorIdx = pgm_read_byte(&FRAMES[animIndex][frameOffset + pixelIdx]);
    uint32_t color = getPaletteColor(animIndex, colorIdx);
    matrix.setPixelColor(pixelIdx, color);
  }

  matrix.show();
}

// Play an animation for the configured duration
void playAnimation(uint8_t animIndex)
{
  // Loop through all frames multiple times to reach desired duration
  for (uint8_t cycle = 0; cycle < ANIMATION_DURATION_SEC; cycle++)
  {
    for (uint8_t frameIdx = 0; frameIdx < NUM_FRAMES; frameIdx++)
    {
      displayFrame(animIndex, frameIdx);
      delay(FRAME_DELAY);
    }
  }
}
