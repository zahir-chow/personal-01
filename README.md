# 🎉 Magical 3D Birthday Experience ✨

A visually stunning and emotionally warm 3D birthday wishing experience built with Three.js and JavaScript. This project creates a magical, cinematic journey through memories with smooth animations, glowing particles, and elegant transitions.

## ✨ Features

### 🎨 Visual Style
- Ultra-smooth animations with soft lighting and glowing particles
- Elegant color gradients (pastel, gold, pink, warm tones)
- Depth, parallax, and subtle camera movement for a dream-like 3D atmosphere
- Gentle, graceful, and premium animations

### ⏳ Countdown Experience
- Beautiful animated countdown from "10" down to "GO"
- Each number appears with soft fade-in, scale-up, and glow effect
- Sweet, calming sound on every count tick
- Magical transition on "GO" with light burst and particles

### 🖼️ Memory Journey (Scroll-Based)
- Smooth camera dive into 3D space as you scroll
- Memory images floating gracefully in space
- Each image appears with soft animations (fade, slide, rotate, depth movement)
- Gentle, emotional, and nostalgic discovery experience

### 🎶 Background Music
- Soft looping birthday background music
- Warm, romantic, and celebratory feel
- Easy to replace with your own audio file

### 🎉 Final Birthday Wish
- Large elegant typography
- Glowing/sparkling text animation
- Floating particles, hearts, and light trails
- Joyful, emotional, and unforgettable finale

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for loading audio files)

### Installation

1. **Clone or download this repository**
   ```bash
   cd birthday
   ```

2. **Set up a local web server**
   
   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in your browser**
   ```
   http://localhost:8000
   ```

## 🎨 Customization

### Adding Your Own Images

Edit `main.js` and update the `MEMORY_IMAGES` array:

```javascript
const MEMORY_IMAGES = [
    'path/to/your/image1.jpg',
    'path/to/your/image2.jpg',
    'path/to/your/image3.jpg',
    // Add more images...
];
```

### Changing the Name/Title

Edit `index.html` and update the memory title:

```html
<h1 id="main-name">Your Name Here</h1>
<p class="subtitle">Your custom subtitle</p>
```

### Customizing the Birthday Message

Edit `index.html` and update the final wish section:

```html
<h2 class="wish-title">🎂 Your Custom Title 🎉</h2>
<p class="wish-message">Your personalized birthday message here...</p>
<div class="wish-signature">Your signature 💖</div>
```

### Adding Your Own Music

1. Place your audio file in a `music` folder:
   ```
   music/
     └── birthday-music.mp3
   ```

2. The audio will automatically play when the journey starts.

### Adding Countdown Sound

1. Place your countdown tick sound in a `sounds` folder:
   ```
   sounds/
     └── countdown-tick.mp3
   ```

2. The sound will play on each countdown number.

### Adjusting Configuration

Edit the `CONFIG` object in `main.js`:

```javascript
const CONFIG = {
    countdownStart: 10,        // Starting countdown number
    memoryCount: 5,            // Number of memory images
    cameraSpeed: 0.02,         // Camera movement speed
    particleCount: 2000,       // Number of particles
    scrollSensitivity: 0.5     // Scroll sensitivity
};
```

## 🎨 Styling Customization

### Colors

Edit `styles.css` to change color schemes:

- **Background gradient**: Modify the `body` background gradient
- **Text colors**: Update color values in `.memory-title`, `.wish-title`, etc.
- **Particle colors**: Edit color values in `main.js` `createParticleSystem()` function

### Animations

- **Countdown animation**: Modify `@keyframes countdownPulse` in `styles.css`
- **Particle animations**: Adjust rotation speeds in `animate()` function in `main.js`
- **Image animations**: Customize scroll-based animations in `handleScroll()` function

## 📁 Project Structure

```
birthday/
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── main.js            # Three.js scene and logic
├── README.md          # This file
├── music/             # Background music (create this folder)
│   └── birthday-music.mp3
└── sounds/            # Countdown sounds (create this folder)
    └── countdown-tick.mp3
```

## 🎯 Tips for Best Experience

1. **Image Quality**: Use high-quality images (800x600px or larger) for best visual results
2. **Audio Format**: Use MP3 format for maximum browser compatibility
3. **Performance**: Reduce `particleCount` if experiencing performance issues on slower devices
4. **Mobile**: The experience is responsive and works on mobile devices
5. **Browser**: For best results, use Chrome, Firefox, or Safari

## 🐛 Troubleshooting

### Images not loading
- Make sure image URLs are correct and accessible
- Check browser console for CORS errors
- Use local images or ensure external URLs allow cross-origin requests

### Audio not playing
- Browsers require user interaction before playing audio
- Make sure audio files exist in the correct folders
- Check browser console for audio loading errors

### Performance issues
- Reduce `particleCount` in CONFIG
- Use smaller image sizes
- Close other browser tabs

## 💖 Credits

Built with love using:
- [Three.js](https://threejs.org/) - 3D graphics library
- Pure JavaScript - No frameworks, just magic ✨

## 📝 License

Feel free to use this project for personal or commercial purposes. Make it your own and spread the birthday joy! 🎉

---

**Made with 💖 for someone special**


