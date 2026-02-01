import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = path.resolve(process.cwd(), '20260202');

// --- Configuration ---
const ANIMALS = [
  'Panda', 'Owl', 'Dog', 'Cat', 'Elephant', 'Mouse', 'Dragon', 'Snake', 
  'Sheep', 'Goat', 'Ox', 'Capybara', 'Fox', 'Rabbit', 'Rhino', 'Shark', 'Whale'
];

const PROFESSIONS = [
  'Paper_Working', 'Programming', 'Planning', 'Designing', 'Researching', 
  'Studying', 'Crafting', 'Fighting', 'Spelling', 'Speaking'
];

// --- 1. Filter Definition (Masterpiece Low Poly Pin Style) ---
// Alex Pixel Cutter style: Clean boundaries, vibrant, semi-3D look without over-baking.
const FILTER_DEF = `
    <style>
      /* Global Floating Animation */
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }
      .avatar-body {
        animation: float 4s ease-in-out infinite;
        transform-origin: center;
      }

      /* Eye Blink */
      @keyframes blink {
        0%, 96%, 100% { transform: scaleY(1); }
        98% { transform: scaleY(0.1); }
      }
      .eye-anim {
        transform-origin: center;
        animation: blink 4s infinite;
      }
      
      /* Specific Animations */
      @keyframes ear-twitch { 0%, 95%, 100% { transform: rotate(0deg); } 97% { transform: rotate(5deg); } }
      .ear-l { transform-origin: center bottom; animation: ear-twitch 5s infinite; }
      .ear-r { transform-origin: center bottom; animation: ear-twitch 5s infinite; animation-delay: 0.5s; }
      
      @keyframes sheen { 0%, 90% { opacity: 0; transform: translateX(-20px) rotate(45deg); } 95% { opacity: 0.6; } 100% { opacity: 0; transform: translateX(20px) rotate(45deg); } }
      .lens-sheen { animation: sheen 6s infinite; }
    </style>

    <filter id="pixel-cutter-filter" x="-50%" y="-50%" width="200%" height="200%">
      <!-- 1. Refined Outline (Thinner, softer gold) -->
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="thick"/>
      <feFlood flood-color="#F4D03F" result="gold"/>
      <feComposite in="gold" in2="thick" operator="in" result="outline"/>
      
      <!-- 2. Subtle Shadow -->
      <feGaussianBlur in="thick" stdDeviation="2" result="shadowBlur"/>
      <feOffset in="shadowBlur" dx="2" dy="2" result="shadowOffset"/>
      <feFlood flood-color="#000" flood-opacity="0.2" result="shadowColor"/>
      <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="shadow"/>
      
      <!-- 3. Minimal Gloss (Just a hint of material) -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.1" specularExponent="20" lighting-color="#FFF" result="specular">
        <fePointLight x="-5000" y="-10000" z="10000"/>
      </feSpecularLighting>
      <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularOut"/>

      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="outline"/>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode in="specularOut"/>
      </feMerge>
    </filter>
`;

// --- 2. Color Palettes (Vibrant) ---
const PALETTES = {
  Panda: { base: '#ECF0F1', dark: '#2C3E50', light: '#FFFFFF', accent: '#2ECC71', eye: '#2C3E50' },
  Owl: { base: '#8E44AD', dark: '#5B2C6F', light: '#D2B4DE', accent: '#F1C40F', eye: '#F39C12' },
  Dog: { base: '#D35400', dark: '#A04000', light: '#F39C12', accent: '#3498DB', eye: '#2C3E50' },
  Cat: { base: '#95A5A6', dark: '#7F8C8D', light: '#BDC3C7', accent: '#E91E63', eye: '#F1C40F' },
  Elephant: { base: '#7FB3D5', dark: '#5499C7', light: '#A9CCE3', accent: '#E74C3C', eye: '#2C3E50' },
  Mouse: { base: '#BDC3C7', dark: '#909497', light: '#E5E8E8', accent: '#F39C12', eye: '#2C3E50' },
  Dragon: { base: '#27AE60', dark: '#1E8449', light: '#58D68D', accent: '#C0392B', eye: '#F1C40F' },
  Snake: { base: '#16A085', dark: '#117864', light: '#48C9B0', accent: '#F1C40F', eye: '#F39C12' },
  Sheep: { base: '#FDFEFE', dark: '#BDC3C7', light: '#FFFFFF', accent: '#3498DB', eye: '#2C3E50' },
  Goat: { base: '#F5F5F5', dark: '#D5D8DC', light: '#FFFFFF', accent: '#8E44AD', eye: '#2C3E50' },
  Ox: { base: '#6E2C00', dark: '#4E1C00', light: '#A04000', accent: '#E74C3C', eye: '#F1C40F' },
  Capybara: { base: '#D35400', dark: '#873600', light: '#E67E22', accent: '#27AE60', eye: '#3E2723' },
  Fox: { base: '#E67E22', dark: '#BA4A00', light: '#F39C12', accent: '#2C3E50', eye: '#2C3E50' },
  Rabbit: { base: '#FADBD8', dark: '#E6B0AA', light: '#FDEDEC', accent: '#E91E63', eye: '#C0392B' },
  Rhino: { base: '#707B7C', dark: '#566573', light: '#99A3A4', accent: '#F1C40F', eye: '#2C3E50' },
  Shark: { base: '#3498DB', dark: '#2874A6', light: '#85C1E9', accent: '#E74C3C', eye: '#17202A' },
  Whale: { base: '#2E86C1', dark: '#21618C', light: '#5DADE2', accent: '#F1C40F', eye: '#17202A' }
};

// --- 3. Geometry Generators (Chibi Low Poly) ---
// All coordinate systems assume 512x512 canvas, centered roughly at 256, 256.
// Scale factor applied later to fit accessories.

function genPanda(p) {
  return `
    <g>
      <!-- Ears -->
      <circle cx="170" cy="150" r="45" fill="${p.dark}" class="ear-l"/>
      <circle cx="342" cy="150" r="45" fill="${p.dark}" class="ear-r"/>
      <!-- Head -->
      <path d="M200 120 L312 120 L360 180 L360 320 L312 380 L200 380 L152 320 L152 180 Z" fill="${p.base}"/>
      <!-- Patches -->
      <ellipse cx="200" cy="240" rx="35" ry="30" fill="${p.dark}" transform="rotate(-15 200 240)"/>
      <ellipse cx="312" cy="240" rx="35" ry="30" fill="${p.dark}" transform="rotate(15 312 240)"/>
      <!-- Eyes -->
      <circle cx="205" cy="235" r="8" fill="#FFF" class="eye-anim"/>
      <circle cx="307" cy="235" r="8" fill="#FFF" class="eye-anim"/>
      <!-- Nose -->
      <path d="M246 300 L266 300 L256 320 Z" fill="${p.eye}"/>
    </g>`;
}

function genOwl(p) {
  return `
    <g>
      <!-- Head -->
      <path d="M180 120 L332 120 L360 200 L256 380 L152 200 Z" fill="${p.base}"/>
      <path d="M256 120 L332 120 L360 200 L256 260 Z" fill="${p.dark}" opacity="0.2"/>
      <!-- Face -->
      <circle cx="210" cy="200" r="55" fill="${p.light}"/>
      <circle cx="302" cy="200" r="55" fill="${p.light}"/>
      <!-- Eyes -->
      <circle cx="210" cy="200" r="35" fill="${p.eye}"/>
      <circle cx="210" cy="200" r="15" fill="#222" class="eye-anim"/>
      <circle cx="302" cy="200" r="35" fill="${p.eye}"/>
      <circle cx="302" cy="200" r="15" fill="#222" class="eye-anim"/>
      <!-- Beak -->
      <path d="M246 240 L266 240 L256 280 Z" fill="${p.accent}"/>
      <!-- Tufts -->
      <path d="M180 120 L150 50 L210 120 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M332 120 L362 50 L302 120 Z" fill="${p.dark}" class="ear-r"/>
    </g>`;
}

function genDog(p) {
  return `
    <g>
      <!-- Ears (Floppy / Folded) -->
      <path d="M160 120 L90 160 L140 240 L190 160 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M352 120 L422 160 L372 240 L322 160 Z" fill="${p.dark}" class="ear-r"/>
      
      <!-- Head (Rounded square, wider bottom for jowls) -->
      <path d="M190 100 L322 100 L360 200 L340 340 L256 370 L172 340 L152 200 Z" fill="${p.base}"/>
      <path d="M256 100 L322 100 L360 200 L256 260 Z" fill="${p.light}" opacity="0.3"/>
      
      <!-- Muzzle (White/Light area) -->
      <path d="M200 240 L312 240 L320 340 L256 370 L192 340 Z" fill="#FDFEFE"/>
      
      <!-- Nose (Large, rounded triangle) -->
      <path d="M236 290 L276 290 L256 320 Z" fill="${p.eye}"/>
      
      <!-- Tongue (Cute factor) -->
      <path d="M246 320 L266 320 L266 345 A10 10 0 0 1 246 345 Z" fill="#E91E63"/>
      
      <!-- Eyes -->
      <circle cx="210" cy="200" r="14" fill="${p.eye}" class="eye-anim"/>
      <circle cx="302" cy="200" r="14" fill="${p.eye}" class="eye-anim"/>
      <circle cx="215" cy="195" r="4" fill="#FFF" opacity="0.6"/>
      <circle cx="307" cy="195" r="4" fill="#FFF" opacity="0.6"/>
    </g>`;
}

function genCat(p) {
  return `
    <g>
      <!-- Ears (Triangle on top, better perspective) -->
      <path d="M160 160 L130 50 L220 140 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M165 150 L145 80 L200 130 Z" fill="${p.light}" class="ear-l"/>
      
      <path d="M352 160 L382 50 L292 140 Z" fill="${p.dark}" class="ear-r"/>
      <path d="M347 150 L367 80 L312 130 Z" fill="${p.light}" class="ear-r"/>
      
      <!-- Head (Wide cheeks, soft pentagon) -->
      <path d="M200 120 L312 120 L370 220 L350 340 L256 380 L162 340 L142 220 Z" fill="${p.base}"/>
      
      <!-- Forehead Markings -->
      <path d="M256 120 L312 120 L370 220 L256 260 Z" fill="${p.light}" opacity="0.3"/>
      
      <!-- Eyes (Big, Cat-like pupils) -->
      <ellipse cx="200" cy="230" rx="22" ry="28" fill="${p.eye}" class="eye-anim"/>
      <ellipse cx="312" cy="230" rx="22" ry="28" fill="${p.eye}" class="eye-anim"/>
      <ellipse cx="200" cy="230" rx="6" ry="20" fill="#17202A"/> <!-- Vertical Pupil -->
      <ellipse cx="312" cy="230" rx="6" ry="20" fill="#17202A"/>
      
      <!-- Snout/Mouth -->
      <path d="M246 310 L266 310 L256 325 Z" fill="${p.accent}"/>
      <path d="M256 325 L240 340 M256 325 L272 340" stroke="#2C3E50" stroke-width="3" fill="none"/>
      
      <!-- Whiskers -->
      <line x1="160" y1="300" x2="100" y2="290" stroke="#FFF" stroke-width="2" opacity="0.8"/>
      <line x1="160" y1="320" x2="110" y2="330" stroke="#FFF" stroke-width="2" opacity="0.8"/>
      <line x1="352" y1="300" x2="412" y2="290" stroke="#FFF" stroke-width="2" opacity="0.8"/>
      <line x1="352" y1="320" x2="402" y2="330" stroke="#FFF" stroke-width="2" opacity="0.8"/>
    </g>`;
}

function genElephant(p) {
  return `
    <g>
      <!-- Ears -->
      <path d="M180 160 L60 100 L60 300 L180 280 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M332 160 L452 100 L452 300 L332 280 Z" fill="${p.dark}" class="ear-r"/>
      <!-- Head -->
      <circle cx="256" cy="220" r="90" fill="${p.base}"/>
      <!-- Trunk -->
      <path d="M236 260 L276 260 L266 400 L286 420 L256 430 L226 420 L246 400 Z" fill="${p.light}" class="trunk-anim" style="transform-origin: 256px 260px; animation: ear-twitch 4s infinite;"/>
      <!-- Eyes -->
      <circle cx="216" cy="220" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="296" cy="220" r="10" fill="${p.eye}" class="eye-anim"/>
      <!-- Tusks -->
      <path d="M210 320 L200 380 L220 330 Z" fill="#FFF"/>
      <path d="M302 320 L312 380 L292 330 Z" fill="#FFF"/>
    </g>`;
}

function genMouse(p) {
  return `
    <g>
      <circle cx="150" cy="150" r="55" fill="${p.dark}" class="ear-l"/>
      <circle cx="150" cy="150" r="35" fill="${p.light}" class="ear-l"/>
      <circle cx="362" cy="150" r="55" fill="${p.dark}" class="ear-r"/>
      <circle cx="362" cy="150" r="35" fill="${p.light}" class="ear-r"/>
      <path d="M256 160 L330 220 L300 340 L256 380 L212 340 L182 220 Z" fill="${p.base}"/>
      <circle cx="220" cy="240" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="292" cy="240" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="256" cy="380" r="15" fill="${p.accent}"/>
      <line x1="220" y1="340" x2="140" y2="320" stroke="#555" stroke-width="3"/>
      <line x1="220" y1="360" x2="140" y2="370" stroke="#555" stroke-width="3"/>
      <line x1="292" y1="340" x2="372" y2="320" stroke="#555" stroke-width="3"/>
      <line x1="292" y1="360" x2="372" y2="370" stroke="#555" stroke-width="3"/>
    </g>`;
}

function genDragon(p) {
  return `
    <g>
      <!-- Spikes / Mane -->
      <path d="M256 80 L236 120 L276 120 Z" fill="${p.accent}"/>
      <path d="M256 80 L220 160 L292 160 Z" fill="${p.dark}"/>
      
      <!-- Horns (Curved) -->
      <path d="M180 140 L120 40 L160 120 Z" fill="${p.light}"/>
      <path d="M332 140 L392 40 L352 120 Z" fill="${p.light}"/>
      
      <!-- Head (Angular, aggressive) -->
      <path d="M200 120 L312 120 L360 200 L320 320 L256 360 L192 320 L152 200 Z" fill="${p.base}"/>
      <path d="M256 120 L312 120 L360 200 L256 280 Z" fill="${p.light}" opacity="0.3"/>
      
      <!-- Eyes (Slit, Reptilian) -->
      <path d="M170 200 L230 200 L200 230 Z" fill="${p.eye}" class="eye-anim"/>
      <path d="M342 200 L282 200 L312 230 Z" fill="${p.eye}" class="eye-anim"/>
      <rect x="198" y="200" width="4" height="20" fill="#222" transform="rotate(15 200 210)"/>
      <rect x="310" y="200" width="4" height="20" fill="#222" transform="rotate(-15 312 210)"/>
      
      <!-- Snout (Protruding) -->
      <path d="M220 320 L292 320 L280 380 L232 380 Z" fill="${p.dark}"/>
      <path d="M232 380 L242 370 M280 380 L270 370" stroke="#111" stroke-width="3" opacity="0.5"/>
      
      <!-- Teeth -->
      <path d="M235 380 L240 395 L245 380 Z" fill="#FFF"/>
      <path d="M267 380 L272 395 L277 380 Z" fill="#FFF"/>
    </g>`;
}

function genSnake(p) {
  return `
    <g>
      <!-- Head -->
      <path d="M200 140 L312 140 L340 260 L300 360 L212 360 L172 260 Z" fill="${p.base}"/>
      <path d="M256 140 L312 140 L340 260 L256 360 Z" fill="${p.light}" opacity="0.3"/>
      <!-- Eyes -->
      <g class="eye-anim">
        <circle cx="190" cy="240" r="15" fill="${p.eye}"/>
        <rect x="188" y="230" width="4" height="20" fill="#000"/>
      </g>
      <g class="eye-anim" style="--delay:0.2s">
        <circle cx="322" cy="240" r="15" fill="${p.eye}"/>
        <rect x="320" y="230" width="4" height="20" fill="#000"/>
      </g>
      <!-- Tongue -->
      <path d="M256 360 L256 420 L240 440 M256 420 L272 440" stroke="${p.accent}" stroke-width="4" fill="none"/>
    </g>`;
}

function genSheep(p) {
  return `
    <g>
      <!-- Wool -->
      <circle cx="256" cy="180" r="80" fill="${p.base}"/>
      <circle cx="190" cy="160" r="40" fill="${p.base}"/>
      <circle cx="322" cy="160" r="40" fill="${p.base}"/>
      <circle cx="256" cy="120" r="50" fill="${p.base}"/>
      <!-- Face -->
      <path d="M210 180 L302 180 L290 320 L222 320 Z" fill="${p.dark}"/>
      <g class="eye-anim"><circle cx="230" cy="240" r="8" fill="#FFF"/></g>
      <g class="eye-anim"><circle cx="282" cy="240" r="8" fill="#FFF"/></g>
      <!-- Horns -->
      <path d="M160 180 L120 220 L180 220 Z" fill="${p.accent}" class="ear-l"/>
      <path d="M352 180 L392 220 L332 220 Z" fill="${p.accent}" class="ear-r"/>
    </g>`;
}

function genGoat(p) {
  return `
    <g>
      <!-- Horns -->
      <path d="M200 140 L200 60 L220 140 Z" fill="${p.accent}"/>
      <path d="M312 140 L312 60 L292 140 Z" fill="${p.accent}"/>
      <!-- Ears -->
      <path d="M170 180 L120 200 L170 220 Z" fill="${p.base}" class="ear-l"/>
      <path d="M342 180 L392 200 L342 220 Z" fill="${p.base}" class="ear-r"/>
      <!-- Face -->
      <path d="M200 140 L312 140 L330 240 L280 380 L232 380 L182 240 Z" fill="${p.base}"/>
      <path d="M256 140 L312 140 L330 240 L256 380 Z" fill="${p.dark}" opacity="0.3"/>
      <!-- Beard -->
      <path d="M256 380 L240 420 L272 420 Z" fill="${p.dark}"/>
      <!-- Eyes -->
      <rect x="190" y="240" width="30" height="10" fill="${p.eye}" class="eye-anim"/>
      <rect x="292" y="240" width="30" height="10" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genOx(p) {
  return `
    <g>
      <!-- Horns -->
      <path d="M180 160 L100 100 L140 200 Z" fill="${p.light}"/>
      <path d="M332 160 L412 100 L372 200 Z" fill="${p.light}"/>
      <!-- Head -->
      <path d="M180 140 L332 140 L350 240 L256 380 L162 240 Z" fill="${p.base}"/>
      <path d="M256 140 L332 140 L350 240 L256 380 Z" fill="${p.dark}" opacity="0.4"/>
      <!-- Snout -->
      <path d="M220 340 L292 340 L280 390 L232 390 Z" fill="${p.accent}"/>
      <circle cx="240" cy="370" r="6" fill="${p.eye}"/>
      <circle cx="272" cy="370" r="6" fill="${p.eye}"/>
      <!-- Eyes -->
      <circle cx="200" cy="240" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="312" cy="240" r="10" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genCapybara(p) {
  return `
    <g>
      <!-- Ears -->
      <circle cx="180" cy="160" r="20" fill="${p.dark}" class="ear-l"/>
      <circle cx="332" cy="160" r="20" fill="${p.dark}" class="ear-r"/>
      <!-- Head -->
      <path d="M190 160 L322 160 L330 360 L182 360 Z" fill="${p.base}"/>
      <path d="M190 160 L322 160 L326 260 L186 260 Z" fill="${p.light}" opacity="0.3"/>
      <!-- Snout -->
      <path d="M210 260 L302 260 L302 360 L210 360 Z" fill="${p.light}"/>
      <rect x="240" y="320" width="10" height="20" rx="5" fill="${p.eye}"/>
      <rect x="262" y="320" width="10" height="20" rx="5" fill="${p.eye}"/>
      <!-- Eyes (Chill) -->
      <rect x="200" y="210" width="40" height="6" rx="3" fill="${p.eye}" class="eye-anim"/>
      <rect x="272" y="210" width="40" height="6" rx="3" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genFox(p) {
  return `
    <g>
      <!-- Ears -->
      <path d="M172 160 L80 60 L140 240 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M340 160 L432 60 L372 240 Z" fill="${p.dark}" class="ear-r"/>
      <!-- Head -->
      <path d="M256 100 L340 160 L256 220 L172 160 Z" fill="${p.light}"/>
      <path d="M172 160 L256 220 L220 320 L140 240 Z" fill="${p.base}"/>
      <path d="M340 160 L372 240 L292 320 L256 220 Z" fill="${p.dark}"/>
      <!-- Snout -->
      <path d="M256 220 L292 320 L256 360 L220 320 Z" fill="#FFF"/>
      <path d="M256 360 L276 370 L256 390 L236 370 Z" fill="${p.eye}"/>
      <!-- Eyes -->
      <path d="M190 250 L220 250 L215 270 L195 270 Z" fill="${p.eye}" class="eye-anim"/>
      <path d="M292 250 L322 250 L317 270 L297 270 Z" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genRabbit(p) {
  return `
    <g>
      <!-- Ears (Long) -->
      <path d="M200 160 L180 40 L240 160 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M312 160 L332 40 L272 160 Z" fill="${p.dark}" class="ear-r"/>
      <path d="M200 160 L190 80 L220 160 Z" fill="${p.light}" class="ear-l"/>
      <path d="M312 160 L322 80 L292 160 Z" fill="${p.light}" class="ear-r"/>
      <!-- Head -->
      <circle cx="256" cy="240" r="80" fill="${p.base}"/>
      <!-- Cheeks -->
      <circle cx="226" cy="280" r="30" fill="${p.light}" opacity="0.5"/>
      <circle cx="286" cy="280" r="30" fill="${p.light}" opacity="0.5"/>
      <!-- Nose -->
      <path d="M246 280 L266 280 L256 300 Z" fill="${p.accent}"/>
      <!-- Eyes -->
      <circle cx="216" cy="230" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="296" cy="230" r="10" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genRhino(p) {
  return `
    <g>
      <!-- Ears -->
      <path d="M180 180 L140 140 L180 220 Z" fill="${p.dark}" class="ear-l"/>
      <path d="M332 180 L372 140 L332 220 Z" fill="${p.dark}" class="ear-r"/>
      <!-- Head (Bulky) -->
      <path d="M180 160 L332 160 L350 300 L256 360 L162 300 Z" fill="${p.base}"/>
      <path d="M256 160 L332 160 L350 300 L256 360 Z" fill="${p.dark}" opacity="0.3"/>
      <!-- Horn -->
      <path d="M256 260 L276 340 L236 340 Z" fill="#E5E7E9"/>
      <path d="M256 200 L266 240 L246 240 Z" fill="#E5E7E9"/>
      <!-- Eyes -->
      <circle cx="200" cy="240" r="8" fill="${p.eye}" class="eye-anim"/>
      <circle cx="312" cy="240" r="8" fill="${p.eye}" class="eye-anim"/>
    </g>`;
}

function genShark(p) {
  return `
    <g>
      <!-- Fin -->
      <path d="M256 80 L220 160 L290 160 Z" fill="${p.dark}"/>
      <!-- Body/Head -->
      <path d="M160 160 L352 160 L332 360 L256 400 L180 360 Z" fill="${p.base}"/>
      <path d="M256 160 L352 160 L332 360 L256 400 Z" fill="${p.light}" opacity="0.3"/>
      <!-- Belly -->
      <path d="M200 360 L312 360 L256 400 Z" fill="#FFF"/>
      <!-- Eyes -->
      <circle cx="190" cy="260" r="12" fill="${p.eye}" class="eye-anim"/>
      <circle cx="322" cy="260" r="12" fill="${p.eye}" class="eye-anim"/>
      <!-- Gills -->
      <path d="M170 280 L180 320 M160 280 L170 320" stroke="${p.dark}" stroke-width="3"/>
      <path d="M342 280 L332 320 M352 280 L342 320" stroke="${p.dark}" stroke-width="3"/>
    </g>`;
}

function genWhale(p) {
  return `
    <g>
      <!-- Body -->
      <path d="M140 180 L372 180 L352 360 L256 400 L160 360 Z" fill="${p.base}"/>
      <!-- Belly -->
      <path d="M160 300 L352 300 L256 400 Z" fill="${p.light}" opacity="0.5"/>
      <!-- Eyes -->
      <circle cx="180" cy="280" r="10" fill="${p.eye}" class="eye-anim"/>
      <circle cx="332" cy="280" r="10" fill="${p.eye}" class="eye-anim"/>
      <!-- Spout -->
      <path d="M256 180 L246 120 M256 180 L266 120 M256 180 L256 110" stroke="#A9CCE3" stroke-width="4"/>
      <circle cx="246" cy="110" r="5" fill="#A9CCE3"/>
      <circle cx="266" cy="110" r="5" fill="#A9CCE3"/>
      <circle cx="256" cy="100" r="5" fill="#A9CCE3"/>
    </g>`;
}

const GENERATORS = {
  Panda: genPanda, Owl: genOwl, Dog: genDog, Cat: genCat, Elephant: genElephant,
  Mouse: genMouse, Dragon: genDragon, Snake: genSnake, Sheep: genSheep, Goat: genGoat,
  Ox: genOx, Capybara: genCapybara, Fox: genFox, Rabbit: genRabbit, Rhino: genRhino,
  Shark: genShark, Whale: genWhale
};

// --- 4. Profession Accessory Generator ---

function getAccessories(profession, p) {
  const acc = [];
  
  if (profession === 'Paper_Working') {
    acc.push(`
      <g transform="translate(340, 320) rotate(-20)">
        <rect x="0" y="0" width="70" height="90" fill="#FFF" stroke="#BDC3C7" stroke-width="2"/>
        <path d="M-25 30 L50 50" stroke="#7F8C8D" stroke-width="8" stroke-linecap="round"/>
        <circle cx="-30" cy="25" r="12" stroke="#E74C3C" stroke-width="5" fill="none"/>
        <circle cx="55" cy="55" r="12" stroke="#E74C3C" stroke-width="5" fill="none"/>
      </g>
    `);
  }
  
  if (profession === 'Programming') {
    acc.push(`
      <g transform="translate(136, 310)">
        <rect x="-5" y="-5" width="250" height="130" rx="10" fill="rgba(0, 230, 118, 0.1)"/> <!-- Glow -->
        <rect x="0" y="0" width="240" height="120" rx="8" fill="rgba(10, 25, 10, 0.9)" stroke="#00E676" stroke-width="2"/>
        <text x="15" y="35" fill="#00E676" font-family="monospace" font-size="14" font-weight="bold">&gt; RUN AGENT</text>
        <text x="15" y="60" fill="#00E676" font-family="monospace" font-size="14">&gt; status: active</text>
        <rect x="15" y="80" width="120" height="12" fill="#00E676" opacity="0.4" class="lens-sheen"/>
      </g>
      <path d="M140 200 Q120 100 256 100 Q392 100 372 200" stroke="#222" stroke-width="10" fill="none" opacity="0.8"/>
      <rect x="110" y="170" width="35" height="65" rx="8" fill="#111"/>
      <rect x="367" y="170" width="35" height="65" rx="8" fill="#111"/>
    `);
  }
  
  if (profession === 'Planning') {
    acc.push(`
      <circle cx="310" cy="220" r="30" fill="rgba(200,230,255,0.2)" stroke="#F39C12" stroke-width="5"/>
      <path d="M340 220 L340 330" stroke="#F39C12" stroke-width="3"/>
      <g transform="translate(180, 390)">
        <rect x="0" y="0" width="160" height="45" rx="5" fill="#3498DB"/>
        <rect x="10" y="8" width="140" height="2" fill="rgba(255,255,255,0.3)"/>
        <rect x="10" y="18" width="140" height="2" fill="rgba(255,255,255,0.3)"/>
        <rect x="140" y="-5" width="15" height="55" fill="#2980B9"/>
      </g>
    `);
  }
  
  if (profession === 'Designing') {
    acc.push(`
      <g transform="translate(0, -20) rotate(-10 256 120)">
        <path d="M150 120 Q256 60 362 120 L340 160 Q256 140 172 160 Z" fill="#C0392B"/>
        <path d="M150 120 Q256 85 362 120" fill="none" stroke="#B71C1C" stroke-width="3" opacity="0.6"/>
        <circle cx="256" cy="80" r="10" fill="#C0392B"/>
      </g>
      <g transform="translate(330, 350)">
        <path d="M0 0 C20 -20 70 -20 90 0 C90 50 50 70 0 50 C-15 40 -15 10 0 0 Z" fill="#F5CBA7" stroke="#8D6E63" stroke-width="3"/>
        <circle cx="25" cy="20" r="8" fill="#E74C3C"/>
        <circle cx="55" cy="15" r="8" fill="#3498DB"/>
        <circle cx="70" cy="40" r="8" fill="#F1C40F"/>
        <path d="M-25 50 L25 25" stroke="#8D6E63" stroke-width="6" stroke-linecap="round"/>
      </g>
    `);
  }
  
  if (profession === 'Researching') {
    acc.push(`
      <g transform="translate(350, 330) rotate(-15)">
        <circle cx="0" cy="0" r="50" stroke="#5D6D7E" stroke-width="10" fill="rgba(200,245,255,0.4)"/>
        <path d="M0 50 L0 100" stroke="#5D6D7E" stroke-width="14" stroke-linecap="round"/>
        <path d="M-25 -25 L25 25" stroke="#FFF" stroke-width="6" opacity="0.5" class="lens-sheen"/>
      </g>
      <g transform="translate(130, 370)">
        <rect x="0" y="0" width="110" height="70" rx="5" fill="#FFF" stroke="#BDC3C7" stroke-width="2"/>
        <polyline points="10,50 35,20 60,55 85,15 100,40" fill="none" stroke="#2ECC71" stroke-width="4" stroke-linecap="round"/>
      </g>
    `);
  }
  
  if (profession === 'Studying') {
    acc.push(`
      <g transform="translate(256, 410)">
        <path d="M-90 0 L0 20 L90 0 L90 60 L0 80 L-90 60 Z" fill="#FDFEFE" stroke="#2C3E50" stroke-width="3"/>
        <line x1="0" y1="20" x2="0" y2="80" stroke="#BDC3C7" stroke-width="2"/>
        <line x1="-75" y1="20" x2="-10" y2="35" stroke="#95A5A6" stroke-width="2"/>
        <line x1="-75" y1="40" x2="-10" y2="55" stroke="#95A5A6" stroke-width="2"/>
        <line x1="15" y1="35" x2="80" y2="20" stroke="#95A5A6" stroke-width="2"/>
      </g>
      <g stroke="#3498DB" stroke-width="5" fill="rgba(52, 152, 219, 0.1)">
        <path d="M185 220 L245 220 L240 270 L190 270 Z"/>
        <path d="M267 220 L327 220 L322 270 L272 270 Z"/>
        <line x1="245" y1="240" x2="267" y2="240"/>
      </g>
    `);
  }
  
  if (profession === 'Crafting') {
    acc.push(`
      <g transform="translate(370, 310)">
        <circle cx="0" cy="0" r="35" stroke="#95A5A6" stroke-width="5" stroke-dasharray="12 8" fill="#7F8C8D"/>
        <circle cx="0" cy="0" r="12" fill="#566573"/>
      </g>
      <g transform="translate(140, 330) rotate(-40)">
        <rect x="0" y="0" width="25" height="90" rx="5" fill="#8D6E63"/>
        <path d="M-25 -25 L50 -25 L50 15 L-25 15 Z" fill="#5D6D7E"/>
        <rect x="-25" y="-5" width="75" height="5" fill="rgba(255,255,255,0.2)"/>
      </g>
    `);
  }
  
  if (profession === 'Fighting') {
    acc.push(`
      <g transform="translate(0, -10)">
        <path d="M150 140 L362 140 L362 175 L150 175 Z" fill="#C0392B"/>
        <!-- Headband Knots -->
        <g transform="translate(362, 157)">
          <path d="M0 0 L40 -20 L50 10 Z" fill="#B71C1C"/>
          <path d="M0 0 L30 30 L50 20 Z" fill="#B71C1C"/>
        </g>
      </g>
      <path d="M190 210 L220 280" stroke="#C0392B" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
    `);
  }
  
  if (profession === 'Spelling') {
    acc.push(`
      <g transform="translate(170, 360)">
        <rect x="0" y="0" width="50" height="50" rx="5" fill="#E74C3C" stroke="#C0392B" stroke-width="2"/>
        <text x="12" y="38" fill="#FFF" font-family="sans-serif" font-weight="bold" font-size="28">A</text>
      </g>
      <g transform="translate(230, 360)">
        <rect x="0" y="0" width="50" height="50" rx="5" fill="#3498DB" stroke="#2980B9" stroke-width="2"/>
        <text x="12" y="38" fill="#FFF" font-family="sans-serif" font-weight="bold" font-size="28">B</text>
      </g>
      <g transform="translate(290, 360)">
        <rect x="0" y="0" width="50" height="50" rx="5" fill="#F1C40F" stroke="#F39C12" stroke-width="2"/>
        <text x="12" y="38" fill="#FFF" font-family="sans-serif" font-weight="bold" font-size="28">C</text>
      </g>
    `);
  }
  
  if (profession === 'Speaking') {
    acc.push(`
      <g transform="translate(330, 370)">
        <rect x="-20" y="-50" width="40" height="70" rx="20" fill="#566573" stroke="#2C3E50" stroke-width="2"/>
        <rect x="-15" y="-40" width="30" height="40" rx="10" fill="#7F8C8D" opacity="0.5"/>
        <rect x="-6" y="20" width="12" height="50" fill="#2C3E50"/>
      </g>
      <path d="M370 340 Q400 365 370 390" stroke="#3498DB" stroke-width="4" fill="none" opacity="0.8" stroke-linecap="round"/>
      <path d="M385 330 Q425 365 385 400" stroke="#3498DB" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/>
    `);
  }

  return acc.join('\n');
}

// --- 5. Main Generation Loop ---

function generateSvg(animal, profession) {
  const p = PALETTES[animal];
  const generator = GENERATORS[animal];
  
  if (!p || !generator) {
    console.error(`Missing palette or generator for ${animal}`);
    return '';
  }

  const headSvg = generator(p);
  const accessoriesSvg = getAccessories(profession, p);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    ${FILTER_DEF}
  </defs>
  <g filter="url(#pixel-cutter-filter)">
    <g class="avatar-body" transform="translate(0, 20) scale(0.85) translate(51.2, 51.2)">
      ${headSvg}
      ${accessoriesSvg}
    </g>
  </g>
</svg>`;
}

function main() {
  console.log(`Generating avatars for ${ANIMALS.length} animals and ${PROFESSIONS.length} professions...`);
  
  let count = 0;
  for (const animal of ANIMALS) {
    for (const profession of PROFESSIONS) {
      const filename = `${animal}_${profession}.svg`;
      const content = generateSvg(animal, profession);
      if (content) {
        fs.writeFileSync(path.join(TARGET_DIR, filename), content, 'utf8');
        count++;
      }
    }
  }
  console.log(`Successfully generated ${count} avatars in ${TARGET_DIR}`);
}

main();
