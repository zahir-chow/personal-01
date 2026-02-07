// ============================================
// Advanced Magical 3D Birthday Experience
// ============================================

// Global variables
let scene, camera, renderer, controls;
let particles, particleSystem;
let memoryImages = [];
let balloons = [];
let scrollProgress = 0;
let isCountdownComplete = false;
let isJourneyStarted = false;
let currentMemoryIndex = 0;
let audioContext;
let audioEnabled = false;

// Configuration - Simplified for better performance
const CONFIG = {
    countdownStart: 10,
    memoryCount: 11, // Your 10 special images + 1 birthday letter
    cameraSpeed: 0.05,
    particleCount: 2000, // Reduced for performance
    scrollSensitivity: 0.5,
    imageSize: 12, // Bigger for full screen effect
    balloonCount: 30, // Reduced for cleaner scene
    enableInteractions: true, // Enable surprise interactions
    imageDisplayDuration: 0.08 // Each image gets 8% of scroll, making the last image appear from 80% scroll onwards
};

// Your special images with beautiful messages
const MEMORY_IMAGES = [
    {
        image: 'images/image-1.jpg',
        text: 'Koto Mayabi Uni, Ahhh Ki shundor! Shunduri Ta AMar , hehehehehe................',

    },
    {
        image: 'images/image-2.jpg',
        text: 'Amr prothom petni.....hehe..........shunduri petni......Maluhu Petniiiiiii....(Motki Motki Bubu bubu..',

    },
    {
        image: 'images/image-3.jpg',
        text: 'Chaader Aloy Amader Prem.',

    },
    {
        image: 'images/image4.jpg',
        text: 'Sokaleeeeeee Utheiiiiiiiiiiii, Kuashaaaaa, Shiter Sokalee amader Katano ekta Muhurto.',

    },
    {
        image: 'images/image-6.jpg',
        text: 'Nur r AMi sathe AMr Shunduri.................!!!',

    },
    {
        image: 'images/image-7.jpg',
        text: 'Sobar Sera Hasiiiiii, EMon er Shunduri.',

    },
    {
        image: 'images/image-8.jpg',
        text: 'Uni Jokhn Onk Hasi Khusi THaken. Amar Shunduri....',

    },
    {
        image: 'images/image-9.jpg',
        text: 'Shunduri Jokhn Dushtami kore.....',

    },
    {
        image: 'images/image-10.jpeg',
        text: 'Shunduri JMne aMare ValoBashEEE',

    },
    {
        image: 'images/image-11.jpeg',
        text: 'Ahhhhh Unar Hasi....',
    },

    {
        image: 'images/birthday-letter.jpg',
        text: 'Happy Birthday Kolizaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!!!!!!!',

    }
];

// Initialize the experience
function init() {
    console.log('Initializing experience...');
    setupAudioContext();
    setupThreeJS();
    setupEventListeners();
    setScrollHeight(); // Set initial scroll height
    startCountdown();
}

// Function to set the document height for scrolling
function setScrollHeight() {
    const scrollHeightPerImage = 300;
    const totalHeightUnits = CONFIG.memoryCount * scrollHeightPerImage + 400;

    // We'll use pixels for more reliable cross-browser scrolling
    const totalPixels = (totalHeightUnits * window.innerHeight) / 100;

    // Apply to body
    document.body.style.height = `${totalPixels}px`;

    // Also apply to spacer div if it exists
    const spacer = document.getElementById('scroll-spacer');
    if (spacer) {
        spacer.style.height = `${totalPixels}px`;
    }

    console.log(`Scroll height set to ${totalPixels}px (${totalHeightUnits}vh)`);
}

// ============================================
// Audio Context Setup (Fix autoplay policy)
// ============================================

function setupAudioContext() {
    // Create audio context for better control
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }

    // Enable audio on first user interaction
    const enableAudio = () => {
        if (!audioEnabled && audioContext) {
            audioContext.resume().then(() => {
                audioEnabled = true;
                console.log('Audio enabled');
                const btn = document.getElementById('enable-audio-btn');
                if (btn) btn.style.display = 'none';
            });
        }

        // Try to play background music if journey already started
        const bgMusic = document.getElementById('background-music');
        if (bgMusic) {
            bgMusic.play().catch(e => console.log("Bg music interaction play failed:", e));
        }

        // Also try countdown sound if it was meant to be playing
        const countSound = document.getElementById('countdown-sound');
        if (countSound) {
            countSound.play().catch(e => console.log("Countdown sound interaction play failed:", e));
        }
    };

    // Show audio enable button if needed
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.play().catch(() => {
            // Autoplay blocked, show button
            const btn = document.getElementById('enable-audio-btn');
            if (btn) {
                btn.style.display = 'block';
                btn.addEventListener('click', enableAudio);
            }
        });
    }

    // Enable on any user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
}

function playSound(audioElement) {
    if (!audioElement) return;

    try {
        // Resume audio context if needed
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Reset and play
        audioElement.currentTime = 0;
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Audio playing successfully
                })
                .catch(error => {
                    // Auto-play was prevented - this is normal, will work after user interaction
                    console.log('Audio play prevented (needs user interaction):', error.message);
                });
        }
    } catch (error) {
        console.log('Error playing sound:', error.message);
    }
}

// ============================================
// Three.js Setup
// ============================================

function setupThreeJS() {
    // Scene with beautiful gradient background
    scene = new THREE.Scene();
    // Create beautiful gradient background
    const gradientTexture = createGradientTexture();
    scene.background = gradientTexture;
    scene.fog = new THREE.FogExp2(0x667eea, 0.0005);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.set(0, 0, 5);

    // Renderer with advanced settings
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Advanced Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Main directional light with shadow
    const directionalLight = new THREE.DirectionalLight(0xffd700, 1.2);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Multiple colored point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xffb6c1, 0.8, 200);
    pointLight1.position.set(-15, 10, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffd700, 0.7, 200);
    pointLight2.position.set(15, -10, -15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 0.6, 150);
    pointLight3.position.set(0, 20, 0);
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xff69b4, 0.5, 180);
    pointLight4.position.set(-20, -15, 20);
    scene.add(pointLight4);

    // Beautiful particle systems
    createParticleSystem();
    createHeartParticles(); // Add floating hearts
    createStarField(); // Add twinkling stars

    // Create flying balloons
    createBalloons();

    // Setup interactions will be called after images load

    // Create memory images
    createMemoryImages();

    // Setup interactions after a delay
    if (CONFIG.enableInteractions) {
        setTimeout(() => {
            try {
                if (typeof setupInteractions === 'function') {
                    setupInteractions();
                }
            } catch (e) {
                console.log('Interactions setup error:', e);
            }
        }, 2000);
    }

    // Start animation loop
    animate();
}

// ============================================
// Advanced Particle Systems
// ============================================

function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);
    const velocities = new Float32Array(CONFIG.particleCount * 3);

    // Simplified color palette - only 2 colors for cleaner look
    const color1 = new THREE.Color(0xffd700); // Gold
    const color2 = new THREE.Color(0xffb6c1); // Pink

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;

        // Positions
        positions[i3] = (Math.random() - 0.5) * 300;
        positions[i3 + 1] = (Math.random() - 0.5) * 300;
        positions[i3 + 2] = (Math.random() - 0.5) * 300;

        // Simplified colors - only 2 colors
        const color = Math.random() < 0.5 ? color1 : color2;

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // Sizes
        sizes[i] = Math.random() * 4 + 2;

        // Velocities for animation
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            intensity: { value: 1.0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 velocity;
            varying vec3 vColor;
            varying float vOpacity;
            uniform float time;
            uniform float intensity;
            
            void main() {
                vColor = color; // Use Three.js built-in color attribute
                vec3 pos = position + velocity * time * 50.0;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                float dist = length(mvPosition.xyz);
                gl_PointSize = size * (500.0 / dist) * intensity;
                vOpacity = 1.0 - smoothstep(0.0, 300.0, dist);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vOpacity;
            
            void main() {
                float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                gl_FragColor = vec4(vColor, alpha * vOpacity * 0.9);
            }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.velocities = velocities;
    scene.add(particleSystem);
}

// ============================================
// Beautiful Background Gradient
// ============================================

function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // Beautiful romantic gradient - purple to pink to gold
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#667eea'); // Purple
    gradient.addColorStop(0.3, '#764ba2'); // Deep purple
    gradient.addColorStop(0.6, '#f093fb'); // Pink
    gradient.addColorStop(1, '#f5576c'); // Rose

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ============================================
// Floating Heart Particles
// ============================================

let heartParticles = null;

function createHeartParticles() {
    const heartCount = 50;
    const hearts = new THREE.Group();

    for (let i = 0; i < heartCount; i++) {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x, y + 0.25);
        heartShape.bezierCurveTo(x, y, x - 0.25, y, x - 0.25, y + 0.25);
        heartShape.bezierCurveTo(x - 0.25, y + 0.5, x, y + 0.75, x, y + 1);
        heartShape.bezierCurveTo(x, y + 0.75, x + 0.25, y + 0.5, x + 0.25, y + 0.25);
        heartShape.bezierCurveTo(x + 0.25, y, x, y, x, y + 0.25);

        const geometry = new THREE.ShapeGeometry(heartShape);
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() < 0.5 ? 0xff69b4 : 0xffb6c1,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        const heart = new THREE.Mesh(geometry, material);
        heart.scale.set(0.3, 0.3, 0.3);
        heart.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        heart.userData.velocity = {
            x: (Math.random() - 0.5) * 0.02,
            y: Math.random() * 0.03 + 0.01,
            z: (Math.random() - 0.5) * 0.02,
            rotation: (Math.random() - 0.5) * 0.02
        };
        hearts.add(heart);
    }

    heartParticles = hearts;
    scene.add(hearts);
}

// ============================================
// Twinkling Star Field
// ============================================

let starField = null;

function createStarField() {
    const starCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 500;
        positions[i3 + 1] = (Math.random() - 0.5) * 500;
        positions[i3 + 2] = (Math.random() - 0.5) * 500;

        const color = new THREE.Color(0xffffff);
        color.lerp(new THREE.Color(0xffd700), Math.random() * 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

// ============================================
// Heart-Shaped Border Frame for Images
// ============================================

function createHeartFrame(width, height) {
    const frameGroup = new THREE.Group();
    const frameThickness = 0.2; // Border thickness

    // Create a rectangular frame with heart-shaped decorations on corners
    // This creates a border AROUND the image, not covering it

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Create heart shapes for the four corners
    function createCornerHeart(size) {
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, size * 0.25);
        heartShape.bezierCurveTo(0, 0, -size * 0.25, 0, -size * 0.25, size * 0.25);
        heartShape.bezierCurveTo(-size * 0.25, size * 0.5, 0, size * 0.75, 0, size);
        heartShape.bezierCurveTo(0, size * 0.75, size * 0.25, size * 0.5, size * 0.25, size * 0.25);
        heartShape.bezierCurveTo(size * 0.25, 0, 0, 0, 0, size * 0.25);
        return heartShape;
    }

    const cornerSize = Math.min(width, height) * 0.15;

    // Top-left corner heart
    const topLeftHeart = createCornerHeart(cornerSize);
    const topLeftGeometry = new THREE.ShapeGeometry(topLeftHeart);
    const topLeftMaterial = new THREE.MeshBasicMaterial({
        color: 0xff1493,
        transparent: true,
        opacity: 0.9
    });
    const topLeft = new THREE.Mesh(topLeftGeometry, topLeftMaterial);
    topLeft.position.set(-halfWidth + cornerSize * 0.3, halfHeight - cornerSize * 0.3, 0.01);
    topLeft.rotation.z = Math.PI / 4;

    // Top-right corner heart
    const topRightHeart = createCornerHeart(cornerSize);
    const topRightGeometry = new THREE.ShapeGeometry(topRightHeart);
    const topRight = new THREE.Mesh(topRightGeometry, topLeftMaterial);
    topRight.position.set(halfWidth - cornerSize * 0.3, halfHeight - cornerSize * 0.3, 0.01);
    topRight.rotation.z = -Math.PI / 4;

    // Bottom-left corner heart
    const bottomLeftHeart = createCornerHeart(cornerSize);
    const bottomLeftGeometry = new THREE.ShapeGeometry(bottomLeftHeart);
    const bottomLeft = new THREE.Mesh(bottomLeftGeometry, topLeftMaterial);
    bottomLeft.position.set(-halfWidth + cornerSize * 0.3, -halfHeight + cornerSize * 0.3, 0.01);
    bottomLeft.rotation.z = -Math.PI / 4;

    // Bottom-right corner heart
    const bottomRightHeart = createCornerHeart(cornerSize);
    const bottomRightGeometry = new THREE.ShapeGeometry(bottomRightHeart);
    const bottomRight = new THREE.Mesh(bottomRightGeometry, topLeftMaterial);
    bottomRight.position.set(halfWidth - cornerSize * 0.3, -halfHeight + cornerSize * 0.3, 0.01);
    bottomRight.rotation.z = Math.PI / 4;

    // Create rectangular border frame
    const borderShape = new THREE.Shape();
    borderShape.moveTo(-halfWidth - frameThickness, -halfHeight - frameThickness);
    borderShape.lineTo(halfWidth + frameThickness, -halfHeight - frameThickness);
    borderShape.lineTo(halfWidth + frameThickness, halfHeight + frameThickness);
    borderShape.lineTo(-halfWidth - frameThickness, halfHeight + frameThickness);
    borderShape.lineTo(-halfWidth - frameThickness, -halfHeight - frameThickness);

    // Inner cutout
    const innerHole = new THREE.Path();
    innerHole.moveTo(-halfWidth, -halfHeight);
    innerHole.lineTo(halfWidth, -halfHeight);
    innerHole.lineTo(halfWidth, halfHeight);
    innerHole.lineTo(-halfWidth, halfHeight);
    innerHole.lineTo(-halfWidth, -halfHeight);
    borderShape.holes.push(innerHole);

    const borderGeometry = new THREE.ShapeGeometry(borderShape);
    const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.z = 0.01;

    // Add glow effect
    const glowGeometry = new THREE.PlaneGeometry(width + frameThickness * 2, height + frameThickness * 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffb6c1,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.01;

    frameGroup.add(border);
    frameGroup.add(topLeft);
    frameGroup.add(topRight);
    frameGroup.add(bottomLeft);
    frameGroup.add(bottomRight);
    frameGroup.add(glow);

    return frameGroup;
}

// Removed secondary particle systems for simplicity and better performance

// ============================================
// Flying Balloons
// ============================================

function createBalloons() {
    // Simplified color palette - only 3 colors
    const balloonColors = [
        0xffd700, // Gold
        0xffb6c1, // Pink
        0xff69b4  // Hot Pink
    ];

    for (let i = 0; i < CONFIG.balloonCount; i++) {
        // Create balloon group
        const balloonGroup = new THREE.Group();

        // Random color
        const colorIndex = Math.floor(Math.random() * balloonColors.length);
        const balloonColor = balloonColors[colorIndex];

        // Create balloon body (sphere with slight deformation for realism)
        const balloonGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        // Slight deformation to make it look more like a balloon
        const positions = balloonGeometry.attributes.position;
        for (let j = 0; j < positions.count; j++) {
            const i3 = j * 3;
            if (positions.array[i3 + 1] > 0) { // Top half
                positions.array[i3 + 1] *= 1.1; // Stretch top
            }
        }
        positions.needsUpdate = true;

        const balloonMaterial = new THREE.MeshStandardMaterial({
            color: balloonColor,
            emissive: balloonColor,
            emissiveIntensity: 0.3,
            roughness: 0.3,
            metalness: 0.1
        });

        const balloonMesh = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloonMesh.castShadow = true;
        balloonMesh.receiveShadow = true;

        // Create balloon string (thin cylinder)
        const stringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 3, 8);
        const stringMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });
        const stringMesh = new THREE.Mesh(stringGeometry, stringMaterial);
        stringMesh.position.y = -1.5;
        stringMesh.rotation.z = (Math.random() - 0.5) * 0.2; // Slight sway

        // Add highlight/shine to balloon
        const highlightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightMesh.position.set(0.2, 0.3, 0.3);

        // Add to group
        balloonGroup.add(balloonMesh);
        balloonGroup.add(stringMesh);
        balloonGroup.add(highlightMesh);

        // Random starting position
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 100;
        const height = -50 + Math.random() * 100;

        balloonGroup.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        // Random rotation
        balloonGroup.rotation.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.3
        );

        // Store animation data
        balloonGroup.userData = {
            originalY: balloonGroup.position.y,
            floatSpeed: 0.02 + Math.random() * 0.03,
            swaySpeed: 0.5 + Math.random() * 0.5,
            swayAmount: 0.5 + Math.random() * 1,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            index: i,
            color: balloonColor
        };

        scene.add(balloonGroup);
        balloons.push(balloonGroup);
    }
}

// ============================================
// Memory Images (Bigger and More Advanced)
// ============================================

function createMemoryImages() {
    const loader = new THREE.TextureLoader();

    // Pre-initialize the array with nulls so we can insert at specific indices
    memoryImages = new Array(MEMORY_IMAGES.length).fill(null);

    MEMORY_IMAGES.forEach((imageData, index) => {
        const imageUrl = typeof imageData === 'string' ? imageData : imageData.image;
        const imageText = typeof imageData === 'object' ? imageData.text : '';
        const imageSubtext = typeof imageData === 'object' ? imageData.subtext : '';

        loader.load(
            imageUrl,
            (texture) => {
                console.log(`Image ${index + 1} loaded successfully:`, imageUrl);
                texture.anisotropy = 16;
                const aspect = texture.image.width / texture.image.height;
                const width = CONFIG.imageSize * 1.5;
                const height = width / aspect;

                const geometry = new THREE.PlaneGeometry(width, height, 32, 32);

                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    emissive: 0x222222,
                    emissiveIntensity: 0.3,
                    roughness: 0.3,
                    metalness: 0.1
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(0, 0, -10);
                mesh.rotation.y = (Math.random() - 0.5) * 0.2;
                mesh.rotation.x = (Math.random() - 0.5) * 0.1;
                mesh.scale.set(0, 0, 0);
                mesh.userData.originalPosition = mesh.position.clone();
                mesh.userData.originalRotation = mesh.rotation.clone();
                mesh.userData.isVisible = false;
                mesh.userData.index = index;
                mesh.userData.text = imageText;
                mesh.userData.subtext = imageSubtext;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                material.transparent = true;
                material.opacity = 0;

                const heartFrame = createHeartFrame(width, height);
                heartFrame.position.copy(mesh.position);
                heartFrame.rotation.copy(mesh.rotation);
                heartFrame.userData.parentIndex = index;
                scene.add(heartFrame);

                const glowGeometry = new THREE.PlaneGeometry(width * 1.15, height * 1.15);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff69b4,
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.BackSide
                });
                const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
                glowMesh.position.copy(mesh.position);
                glowMesh.rotation.copy(mesh.rotation);
                glowMesh.userData.parentIndex = index;
                scene.add(glowMesh);

                scene.add(mesh);

                // Store at the correct index to maintain order
                memoryImages[index] = { mesh, glow: glowMesh, heartFrame: heartFrame };

                console.log(`Successfully placed Image ${index + 1} at its correct position.`);
            },
            undefined,
            (error) => {
                console.error('Error loading image:', error);
                createPlaceholderImage(index);
            }
        );
    });
}

function createPlaceholderImage(index) {
    const width = CONFIG.imageSize;
    const height = width * 0.75;

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.1 + (index % 10) * 0.1, 0.7, 0.6),
        emissive: new THREE.Color().setHSL(0.1 + (index % 10) * 0.1, 0.7, 0.4),
        roughness: 0.3,
        metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    const spacing = 12;
    const zOffset = -index * spacing - 15;
    const yOffset = index * spacing - CONFIG.memoryCount * 6;

    mesh.position.set(
        (Math.random() - 0.5) * 15,
        yOffset,
        zOffset
    );
    mesh.rotation.y = (Math.random() - 0.5) * 0.4;
    mesh.scale.set(0, 0, 0);
    mesh.userData.originalPosition = mesh.position.clone();
    mesh.userData.isVisible = false;
    mesh.userData.index = index;

    scene.add(mesh);
    memoryImages.push({ mesh, glow: null });
}

// ============================================
// Interactive Surprises
// ============================================

function setupInteractions() {
    // Raycaster for mouse interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse move for hover effects
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Check balloon hover
        balloons.forEach((balloonGroup) => {
            const balloonMesh = balloonGroup.children[0];
            if (balloonMesh) {
                const intersects = raycaster.intersectObject(balloonMesh);
                if (intersects.length > 0) {
                    document.body.style.cursor = 'pointer';
                    balloonGroup.userData.isHovered = true;
                } else {
                    balloonGroup.userData.isHovered = false;
                }
            }
        });

        // Check image hover
        memoryImages.forEach((imageObj) => {
            const mesh = imageObj.mesh;
            if (mesh && mesh.userData.isVisible) {
                const intersects = raycaster.intersectObject(mesh);
                if (intersects.length > 0) {
                    document.body.style.cursor = 'pointer';
                    mesh.userData.isHovered = true;
                } else {
                    mesh.userData.isHovered = false;
                }
            }
        });
    });

    // Click handler for surprises
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Check balloon clicks
        balloons.forEach((balloonGroup, index) => {
            const balloonMesh = balloonGroup.children[0];
            if (balloonMesh) {
                const intersects = raycaster.intersectObject(balloonMesh);
                if (intersects.length > 0) {
                    popBalloon(balloonGroup, index);
                }
            }
        });

        // Check image clicks - freeze the image
        memoryImages.forEach((imageObj) => {
            const mesh = imageObj.mesh;
            if (mesh && mesh.visible && mesh.material.opacity > 0) {
                const intersects = raycaster.intersectObject(mesh);
                if (intersects.length > 0) {
                    // Freeze the image - stop it from growing/moving
                    mesh.userData.isFrozen = true;
                    console.log('Image frozen at scale:', mesh.scale.x);
                    // Optional: still allow zoom
                    // zoomImage(mesh);
                }
            }
        });
    });
}

function popBalloon(balloonGroup, index) {
    // Create confetti burst
    createConfettiBurst(balloonGroup.position);

    // Play pop sound
    const popSound = document.getElementById('pop-sound');
    if (popSound) {
        popSound.currentTime = 0;
        playSound(popSound);
    }

    // Animate balloon pop
    const scale = { value: 1 };
    const tween = (progress) => {
        scale.value = 1 + progress * 2;
        balloonGroup.scale.set(scale.value, scale.value, scale.value);

        if (progress < 1) {
            requestAnimationFrame(() => tween(progress + 0.05));
        } else {
            // Remove balloon
            scene.remove(balloonGroup);
            const balloonIndex = balloons.indexOf(balloonGroup);
            if (balloonIndex > -1) {
                balloons.splice(balloonIndex, 1);
            }
        }
    };
    tween(0);
}

function createConfettiBurst(position) {
    const confettiCount = 20;
    const colors = [0xffd700, 0xffb6c1, 0xff69b4, 0xffffff];

    for (let i = 0; i < confettiCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.8
        });
        const confetti = new THREE.Mesh(geometry, material);

        confetti.position.copy(position);
        confetti.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5 + 0.2,
            (Math.random() - 0.5) * 0.5
        );
        confetti.userData.life = 1.0;

        scene.add(confetti);

        // Animate confetti
        const animateConfetti = () => {
            confetti.position.add(confetti.userData.velocity);
            confetti.userData.velocity.y -= 0.01; // Gravity
            confetti.userData.life -= 0.02;
            confetti.material.opacity = confetti.userData.life;
            confetti.scale.multiplyScalar(0.98);

            if (confetti.userData.life > 0) {
                requestAnimationFrame(animateConfetti);
            } else {
                scene.remove(confetti);
            }
        };
        animateConfetti();
    }
}

function zoomImage(mesh) {
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
    `;

    const img = document.createElement('img');
    if (mesh.material && mesh.material.map && mesh.material.map.image) {
        img.src = mesh.material.map.image.src;
    }
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.style.opacity = '1', 10);

    overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => document.body.removeChild(overlay), 300);
    });
}

// ============================================
// Countdown (With Fixed Audio)
// ============================================

function startCountdown() {
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    const countdownSound = document.getElementById('countdown-sound');

    if (!countdownOverlay || !countdownNumber) {
        console.error('Countdown elements not found', {
            overlay: !!countdownOverlay,
            number: !!countdownNumber
        });
        setTimeout(() => startJourney(), 1000);
        return;
    }

    console.log('Countdown starting...');

    // Make sure overlay is visible
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.style.opacity = '1';

    // Create sparkle particles
    try {
        createCountdownSparkles(countdownOverlay);
    } catch (e) {
        console.log('Sparkle creation error:', e);
    }

    let count = CONFIG.countdownStart;

    function updateCountdown() {
        if (count > 0) {
            // Update number
            countdownNumber.textContent = count;

            // Reset and trigger animation
            countdownNumber.style.animation = 'none';
            countdownNumber.classList.remove('go');

            // Force reflow
            void countdownNumber.offsetWidth;

            // Apply animation
            countdownNumber.style.animation = 'countdownPulse 1s cubic-bezier(0.34, 1.56, 0.64, 1), shimmer 3s ease-in-out infinite';

            // Create burst effect
            createNumberBurst(countdownNumber);

            // Play sound with proper handling
            playSound(countdownSound);

            count--;
            setTimeout(updateCountdown, 1000);
        } else {
            // Show "GO"
            countdownNumber.textContent = 'GO';
            countdownNumber.style.animation = 'none';
            void countdownNumber.offsetWidth;
            countdownNumber.classList.add('go');
            countdownNumber.style.animation = 'goBurst 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), shimmer 3s ease-in-out infinite';

            // Create big burst effect
            createGoBurst(countdownNumber);

            // Play sound
            playSound(countdownSound);

            // Transition out
            setTimeout(() => {
                countdownOverlay.style.transition = 'opacity 1s ease-out';
                countdownOverlay.classList.add('hidden');
                isCountdownComplete = true;
                startJourney();
            }, 2000);
        }
    }

    // Start countdown
    updateCountdown();
}

function createCountdownSparkles(container) {
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'countdown-sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkle.style.animationDuration = (1 + Math.random() * 2) + 's';
        container.appendChild(sparkle);
    }
}

function createNumberBurst(element) {
    // Create particle burst effect
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 100 + Math.random() * 50;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const color = i % 2 === 0 ? '#ffd700' : '#ffb6c1';

        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            left: ${centerX}px;
            top: ${centerY}px;
            box-shadow: 0 0 10px ${color};
            z-index: 1001;
            transform: translate(0, 0) scale(1);
            opacity: 1;
        `;

        document.body.appendChild(particle);

        // Animate
        requestAnimationFrame(() => {
            particle.style.transition = 'all 1s ease-out';
            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 1000);
    }
}

function createGoBurst(element) {
    // Create bigger burst for "GO"
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 50;
        const distance = 150 + Math.random() * 100;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const colors = ['#ffd700', '#ffb6c1', '#ffffff'];
        const color = colors[i % 3];

        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            left: ${centerX}px;
            top: ${centerY}px;
            box-shadow: 0 0 15px ${color};
            z-index: 1001;
            transform: translate(0, 0) scale(1);
            opacity: 1;
        `;

        document.body.appendChild(particle);

        // Animate
        requestAnimationFrame(() => {
            particle.style.transition = 'all 1.5s ease-out';
            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 1500);
    }
}

// ============================================
// Journey Start
// ============================================

function startJourney() {
    isJourneyStarted = true;
    setScrollHeight(); // Re-ensure height is set on journey start
    console.log('Journey started, memoryImages count:', memoryImages.length);

    // Don't show memory title - removed as requested
    const memoryTitle = document.getElementById('memory-title');
    if (memoryTitle) {
        memoryTitle.classList.add('hidden');
    }

    // Show first image immediately - start VERY small
    if (memoryImages.length > 0 && memoryImages[0].mesh) {
        const mesh = memoryImages[0].mesh;
        mesh.scale.set(0.1, 0.1, 0.1); // Start VERY small
        mesh.position.set(0, 0, -4);
        mesh.material.opacity = 1.0;
        mesh.material.transparent = true;
        mesh.visible = true;
        mesh.userData.isFrozen = false; // Track if image is frozen
        if (!mesh.parent) {
            scene.add(mesh);
        }
    }

    // Call handleScroll once to initialize
    handleScroll();

    // Start background music with proper handling
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.volume = 0.5;
        // Try to play music
        playSound(bgMusic);

        // Also try to play after a short delay (in case autoplay was blocked)
        setTimeout(() => {
            playSound(bgMusic);
        }, 500);
    }

    // Hide scroll indicator after a moment
    setTimeout(() => {
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.classList.add('hidden');
        }
    }, 3000);
}

// ============================================
// Advanced Scroll Handling
// ============================================

function setupEventListeners() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        if (!isJourneyStarted) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleScroll();
        }, 5);
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse movement for parallax
    window.mouseX = 0;
    window.mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        window.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        window.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
}

function handleScroll() {
    // Simple scroll handling - works after countdown
    if (!isJourneyStarted) {
        return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    // Simple camera movement - keep camera at origin looking forward
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -5);

    // Simple image display - ONE AT A TIME, SLOW AND SMOOTH
    const textOverlay = document.getElementById('image-text-overlay');
    // Each image gets more scroll time - minimum 5 seconds of scrolling
    // With 200vh per image, and normal scroll speed, this gives ~5-7 seconds per image
    // Each image gets a portion of total scroll
    const imageDisplayDuration = CONFIG.imageDisplayDuration;
    const lastImageIndex = memoryImages.length - 1;

    // Show images based on scroll
    memoryImages.forEach((imageObj, index) => {
        if (!imageObj || !imageObj.mesh) return;

        const mesh = imageObj.mesh;
        const glow = imageObj.glow;
        const heartFrame = imageObj.heartFrame;

        // Calculate progress for THIS specific image
        // It starts appearing at index * imageDisplayDuration
        const startTime = index * imageDisplayDuration;
        const endTime = startTime + imageDisplayDuration;

        let imageProgress = 0;
        let isVisible = false;

        if (scrollProgress >= startTime && scrollProgress < endTime) {
            // Image is currently in its active scroll window (growing then fading out)
            imageProgress = (scrollProgress - startTime) / imageDisplayDuration;
            isVisible = true;
        } else if (index === lastImageIndex && scrollProgress >= startTime) {
            // Special case for the LAST image (Birthday Letter):
            // It grows just like others, but stays visible until the final wish.
            // We cap its progress at 1.0 so it doesn't keep growing forever.
            imageProgress = Math.min((scrollProgress - startTime) / imageDisplayDuration, 1.0);
            isVisible = true;
        }

        if (isVisible) {
            // Make sure mesh is in scene
            if (!mesh.parent) {
                scene.add(mesh);
            }

            // Initialize frozen state if not set
            if (mesh.userData.isFrozen === undefined) {
                mesh.userData.isFrozen = false;
            }

            // If image is frozen (clicked), keep it stable
            if (mesh.userData.isFrozen) {
                mesh.visible = true;
                mesh.material.opacity = 1.0;
            } else {
                // Growth animation - Start small (0.1) and grow to readable size (1.8)
                const minScale = 0.1;
                const maxScale = 1.8; // Optimized for full-screen readability without being huge

                // Use easing function for smooth growth
                const easedProgress = imageProgress < 0.5
                    ? 2 * imageProgress * imageProgress
                    : 1 - Math.pow(-2 * imageProgress + 2, 2) / 2;

                const scale = minScale + (maxScale - minScale) * easedProgress;

                mesh.scale.set(scale, scale, scale);
                mesh.position.set(0, 0, -4);

                const origRotY = mesh.userData?.originalRotation?.y || 0;
                const origRotX = mesh.userData?.originalRotation?.x || 0;
                // Straighten out as it gets bigger
                mesh.rotation.y = origRotY * (1 - easedProgress);
                mesh.rotation.x = origRotX * (1 - easedProgress);

                mesh.material.opacity = 1.0;
            }

            mesh.material.transparent = true;
            mesh.visible = true;

            if (glow) {
                if (!glow.parent) scene.add(glow);
                glow.scale.set(mesh.scale.x * 1.1, mesh.scale.y * 1.1, mesh.scale.z * 1.1);
                glow.position.copy(mesh.position);
                glow.rotation.copy(mesh.rotation);
                glow.material.opacity = 0.2;
                glow.visible = true;
            }

            if (heartFrame) {
                heartFrame.position.copy(mesh.position);
                heartFrame.rotation.copy(mesh.rotation);
                heartFrame.scale.copy(mesh.scale);
                heartFrame.visible = true;
            }

            // Show text
            if (textOverlay && mesh.userData?.text) {
                textOverlay.classList.remove('hidden');
                const textMainEl = textOverlay.querySelector('.image-text-main');
                const textSubEl = textOverlay.querySelector('.image-text-sub');
                if (textMainEl) textMainEl.textContent = mesh.userData.text;
                if (textSubEl) textSubEl.textContent = mesh.userData.subtext || '';
                textOverlay.style.opacity = 1.0;
            }
        } else {
            // Hide image
            mesh.scale.set(0, 0, 0);
            mesh.material.opacity = 0;
            mesh.visible = false;
            if (glow) glow.visible = false;
            if (heartFrame) heartFrame.visible = false;
        }
    });

    // Final wish
    if (scrollProgress > 0.9) {
        const finalWish = document.getElementById('final-wish');
        if (finalWish) {
            finalWish.style.opacity = Math.min((scrollProgress - 0.9) / 0.1, 1);
            finalWish.classList.add('visible');
        }
    }
}

// ============================================
// Advanced Animation Loop
// ============================================

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate main particle system
    if (particleSystem) {
        particleSystem.rotation.y += 0.0003;
        particleSystem.rotation.x += 0.0002;
        particleSystem.material.uniforms.time.value = time;

        // Update particle positions
        const positions = particleSystem.geometry.attributes.position;
        const velocities = particleSystem.geometry.attributes.velocity;
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            positions.array[i3] += velocities.array[i3];
            positions.array[i3 + 1] += velocities.array[i3 + 1];
            positions.array[i3 + 2] += velocities.array[i3 + 2];

            // Wrap around
            if (Math.abs(positions.array[i3]) > 150) velocities.array[i3] *= -1;
            if (Math.abs(positions.array[i3 + 1]) > 150) velocities.array[i3 + 1] *= -1;
            if (Math.abs(positions.array[i3 + 2]) > 150) velocities.array[i3 + 2] *= -1;
        }
        positions.needsUpdate = true;
    }

    // Animate floating hearts
    if (heartParticles) {
        heartParticles.children.forEach((heart) => {
            const vel = heart.userData.velocity;
            heart.position.x += vel.x;
            heart.position.y += vel.y;
            heart.position.z += vel.z;
            heart.rotation.z += vel.rotation;

            // Wrap around and reset
            if (heart.position.y > 100) {
                heart.position.y = -100;
                heart.position.x = (Math.random() - 0.5) * 200;
                heart.position.z = (Math.random() - 0.5) * 200;
            }

            // Pulsing effect
            const pulse = Math.sin(time * 2 + heart.position.x) * 0.1 + 1;
            heart.scale.set(0.3 * pulse, 0.3 * pulse, 0.3 * pulse);
        });
    }

    // Animate twinkling stars
    if (starField) {
        starField.rotation.y += 0.0001;
        const positions = starField.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            // Subtle twinkling movement
            positions.array[i3 + 1] += Math.sin(time * 0.5 + i) * 0.01;
        }
        positions.needsUpdate = true;
    }

    // Animate flying balloons with hover effects
    balloons.forEach((balloonGroup) => {
        const userData = balloonGroup.userData;

        // Float upward
        balloonGroup.position.y += userData.floatSpeed;

        // Swaying motion
        const swayX = Math.sin(time * userData.swaySpeed + userData.index) * userData.swayAmount;
        const swayZ = Math.cos(time * userData.swaySpeed * 0.7 + userData.index) * userData.swayAmount;
        balloonGroup.position.x += (swayX - (balloonGroup.position.x - balloonGroup.userData.originalX || 0)) * 0.1;
        balloonGroup.position.z += (swayZ - (balloonGroup.position.z - balloonGroup.userData.originalZ || 0)) * 0.1;

        // Store original positions if not set
        if (balloonGroup.userData.originalX === undefined) {
            balloonGroup.userData.originalX = balloonGroup.position.x;
            balloonGroup.userData.originalZ = balloonGroup.position.z;
        }

        // Rotate balloon
        balloonGroup.rotation.y += userData.rotationSpeed;
        balloonGroup.rotation.z = Math.sin(time * userData.swaySpeed + userData.index) * 0.2;

        // String sway
        const stringMesh = balloonGroup.children[1];
        if (stringMesh) {
            stringMesh.rotation.z = Math.sin(time * userData.swaySpeed * 1.5 + userData.index) * 0.3;
        }

        // Reset position if too high (wrap around)
        if (balloonGroup.position.y > 200) {
            balloonGroup.position.y = -100;
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 100;
            balloonGroup.position.x = Math.cos(angle) * radius;
            balloonGroup.position.z = Math.sin(angle) * radius;
            balloonGroup.userData.originalX = balloonGroup.position.x;
            balloonGroup.userData.originalZ = balloonGroup.position.z;
        }

        // Pulsing glow effect + hover effect
        const balloonMesh = balloonGroup.children[0];
        if (balloonMesh && balloonMesh.material) {
            let pulse = 0.3 + Math.sin(time * 2 + userData.index) * 0.1;
            if (userData.isHovered) {
                pulse = 0.6; // Brighter on hover
                balloonGroup.scale.set(1.1, 1.1, 1.1);
            } else {
                balloonGroup.scale.set(1, 1, 1);
            }
            balloonMesh.material.emissiveIntensity = pulse;
        }
    });

    // Animate memory images with stable, gentle floating effect
    memoryImages.forEach((imageObj) => {
        const mesh = imageObj.mesh;
        const glow = imageObj.glow;

        if (mesh.userData.isVisible) {
            // Only apply gentle floating if not being animated by scroll
            // Check if image is in the scroll animation range
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollProgress = Math.min(scrollTop / maxScroll, 1);
            const imageProgress = (currentScrollProgress * CONFIG.memoryCount) - mesh.userData.index;

            // Only float if image is not actively being scrolled (stable state)
            if (imageProgress < 0 || imageProgress >= 1) {
                // Very gentle floating - much reduced for stability
                const floatY = Math.sin(time * 0.3 + mesh.userData.index) * 0.1;
                const floatX = Math.cos(time * 0.2 + mesh.userData.index) * 0.05;

                mesh.position.y = mesh.userData.originalPosition.y + floatY;
                mesh.position.x = mesh.userData.originalPosition.x + floatX;
            }
            // If in scroll range, position is controlled by handleScroll

            // Hover effect
            if (mesh.userData.isHovered) {
                mesh.scale.set(1.05, 1.05, 1.05);
                if (mesh.material) {
                    mesh.material.emissiveIntensity = 0.5;
                }
            } else {
                mesh.scale.set(1, 1, 1);
                if (mesh.material) {
                    mesh.material.emissiveIntensity = 0.2;
                }
            }

            if (glow) {
                glow.position.copy(mesh.position);
                glow.scale.copy(mesh.scale);
            }

            // Very subtle rotation - reduced for stability
            mesh.rotation.y += 0.0002;
            mesh.rotation.x += 0.0001;

            if (glow) {
                glow.rotation.copy(mesh.rotation);
            }
        }
    });

    // Advanced camera movement with parallax
    if (isJourneyStarted) {
        const mouseX = (window.mouseX || 0) * 0.5;
        const mouseY = (window.mouseY || 0) * 0.5;
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (mouseY - camera.position.y) * 0.05;
    }

    // Dynamic lighting
    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
    lights.forEach((light, index) => {
        if (light.position) {
            light.position.x += Math.sin(time + index) * 0.1;
            light.position.y += Math.cos(time + index * 0.5) * 0.1;
            light.intensity = 0.5 + Math.sin(time * 2 + index) * 0.3;
        }
    });

    renderer.render(scene, camera);
}

// ============================================
// Initialize
// ============================================

// Start when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    try {
        init();
    } catch (error) {
        console.error('Initialization error:', error);
        // Fallback: start countdown anyway
        setTimeout(() => {
            const countdownOverlay = document.getElementById('countdown-overlay');
            if (countdownOverlay && !countdownOverlay.classList.contains('hidden')) {
                startCountdown();
            }
        }, 100);
    }
});

// Also try DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
});

// Initial call to set height
// Removed top-level height setting to preven blocking
// init() handles this now
