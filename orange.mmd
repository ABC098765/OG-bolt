# Orange Burst Animation Technical Plan

## Overview
Create a step-by-step animation where orange emojis burst and create realistic flowing paint splashes that only hit text characters and flow down smoothly.

## Step-by-Step Animation Flow

### Step 1: Initial State
- **Text**: "SUPER FRUIT CENTER" completely invisible/transparent
- **Background**: Clean gradient background
- **State**: Waiting for animation trigger

### Step 2: Orange Entry & Burst
- **Orange Source**: Orange emoji (🍊) enters from random side (left, right, top)
- **Movement**: Smooth trajectory toward center using CSS transform + transition
- **Burst Effect**: Orange scales up and disappears with burst animation
- **Timing**: ~2-3 seconds from entry to burst

### Step 3: Splash Generation & Text Targeting
- **Splash Creation**: Generate 8-15 splash particles from burst point
- **Text Targeting**: Each splash targets random characters (S, U, P, E, R, F, R, U, I, T, C, E, N, T, E, R)
- **Character Detection**: Use individual `<span>` elements for each character to get precise bounding boxes
- **Splash Constraint**: Splashes ONLY land within character boundaries using CSS clip-path or overflow hidden

### Step 4: Smooth Dripping Physics
- **Gravity Simulation**: Use mathematical functions for realistic drip movement
- **Initial Velocity**: Splashes start with random horizontal velocity, then gravity takes over
- **Acceleration**: Apply constant downward acceleration (9.8 pixels/frame²)
- **Flow Path**: Calculate parabolic trajectory using physics equations
- **Character Masking**: Ensure drips stay within character boundaries during entire flow

## Technical Implementation Methods

### Method 1: CSS + JavaScript Hybrid (RECOMMENDED)
**Pros:**
- Smooth hardware-accelerated animations via CSS transforms
- JavaScript handles complex calculations
- Good performance for particle systems
- Easy to debug and modify

**Implementation:**
- CSS transforms for movement (`translateX`, `translateY`)
- CSS custom properties for dynamic values
- JavaScript `requestAnimationFrame` for physics calculations
- Character-level `<span>` wrapping for text targeting

### Method 2: Pure JavaScript Frame-by-Frame
**Pros:**
- Complete control over every frame
- Complex physics easily implemented
- Precise collision detection

**Cons:**
- More CPU intensive
- Requires manual optimization
- Harder to achieve 60fps smoothness

### Method 3: CSS Keyframes Only
**Pros:**
- Hardware accelerated
- Very smooth
- Low JavaScript overhead

**Cons:**
- Limited flexibility for random targeting
- Hard to implement realistic physics
- Difficult dynamic character targeting

## Mathematical Approach for Smooth Dripping

### Physics Equations Needed:
```javascript
// Gravity simulation
const gravity = 0.2; // pixels per frame squared
const initialVelocityX = (Math.random() - 0.5) * 4; // Random horizontal
const initialVelocityY = 0; // Start with no vertical velocity

// Per frame updates
velocityY += gravity;
positionX += velocityX;
positionY += velocityY;

// Damping for realistic flow
velocityX *= 0.99; // Air resistance
```

### Character Boundary Detection:
```javascript
// Get character boundaries
const charElement = document.querySelector(`#char-${index}`);
const bounds = charElement.getBoundingClientRect();

// Check if splash is within character
const withinBounds = (
  splash.x >= bounds.left && 
  splash.x <= bounds.right && 
  splash.y >= bounds.top && 
  splash.y <= bounds.bottom
);
```

## Splash Visual Design

### Cartoonish Approach:
- **Shape**: Irregular blob using CSS border-radius with multiple values
- **Colors**: Orange gradient with transparency
- **Size**: Random sizes (8-20px) for variety
- **Animation**: Scale and fade effects during drip

### Realistic Approach:
- **Shape**: More organic using CSS clip-path or SVG paths
- **Texture**: Multiple gradient layers for depth
- **Viscosity**: Slower movement, trail effects
- **Drips**: Tear-drop shapes that stretch as they fall

## Text Character Targeting System

### HTML Structure:
```html
<h1>
  <span id="char-0">S</span>
  <span id="char-1">U</span>
  <span id="char-2">P</span>
  <!-- ... etc for each character -->
</h1>
```

### Splash Assignment:
- Each splash gets assigned to a random character ID
- Uses `getBoundingClientRect()` to get exact character position
- Splash trajectory calculated to hit character center
- Boundary checking ensures splash stays within character bounds

## Animation Timing & Control

### Orange Sequence:
1. **Orange 1**: Enters after 1 second, hits 3-4 characters
2. **Orange 2**: Enters after 6 seconds, hits 3-4 different characters  
3. **Orange 3**: Enters after 11 seconds, hits remaining characters
4. **Stop Condition**: When all characters are painted, stop generating oranges

### Performance Optimization:
- **Particle Limit**: Max 30 active splashes at any time
- **Cleanup**: Remove splashes that fall below viewport
- **RAF Throttling**: Limit updates to 60fps
- **Memory Management**: Clear completed animations

## Character Paint Tracking

### Paint State System:
```javascript
const characterPaintState = {
  'S': { painted: false, splashCount: 0 },
  'U': { painted: false, splashCount: 0 },
  // ... etc
};

// Mark character as painted when splash count >= 2
if (char.splashCount >= 2) {
  char.painted = true;
  applyPaintedStyling(charElement);
}
```

### Visual Feedback:
- **Unpainted**: Transparent text
- **Partially Painted**: Semi-transparent with orange tint
- **Fully Painted**: Full orange gradient visibility

## Recommended Implementation Order

1. **Setup character-level HTML structure**
2. **Create orange entry/burst animation (no splashes yet)**
3. **Add basic splash generation (simple dots)**
4. **Implement character targeting system**
5. **Add physics-based dripping motion**
6. **Polish splash visuals (shape, color, effects)**
7. **Add paint state tracking and text revelation**
8. **Implement stop condition**
9. **Performance optimization and cleanup**

## Expected Challenges

1. **Character Boundary Detection**: Getting pixel-perfect character bounds
2. **Smooth Physics**: Balancing realism with performance
3. **Memory Management**: Preventing splash buildup
4. **Cross-browser Compatibility**: CSS custom properties and transforms
5. **Mobile Performance**: Ensuring 60fps on mobile devices

## Final Notes

This animation will be **math-heavy** due to physics simulation, but the CSS + JavaScript hybrid approach should provide the best balance of performance and control. The character-level targeting system is crucial for precise splash placement and paint revelation.