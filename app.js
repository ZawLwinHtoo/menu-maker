/**
 * ChromaShift — Adaptive Intelligent Theme Engine
 * Real-time image color quantization, harmonic palette generation, and site-wide theme propagation.
 */

// Preset Configurations
const PRESETS = {
  orange: {
    name: 'Citrus Orange Harmony',
    image: 'assets/sample-orange.jpg',
    paletteName: 'Vibrant Orange & Leaf Green',
    menu: {
      title: 'Sunset Citrus Glaze',
      desc: 'Handcrafted infusion harmonized with sweet citrus botanicals, extracted zest, and organic crystalline honey.',
      badge: "Chef's Special",
      price: '14.50',
      tags: ['Gluten-Free', 'Seasonal', 'Organic']
    },
    track: {
      title: 'Acoustic Citrus Sunrise',
      artist: 'ChromaShift Ambient Studio'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon Glow',
    image: 'assets/sample-cyberpunk.jpg',
    paletteName: 'Electric Cyan & Magenta Synth',
    menu: {
      title: 'Neon Cyber Glaze Bowl',
      desc: 'Dragonfruit-infused chilled acai blend with electric blue spirulina drizzle and candied ginger crystals.',
      badge: 'Futuristic Fusion',
      price: '16.90',
      tags: ['Superfood', 'Chilled', 'Antioxidant']
    },
    track: {
      title: 'Midnight Synthwave Drive',
      artist: 'Neo Tokyo Soundscapes'
    }
  },
  forest: {
    name: 'Emerald Rainforest Mist',
    image: 'assets/sample-forest.jpg',
    paletteName: 'Deep Emerald & Matcha Dew',
    menu: {
      title: 'Matcha Forest Parfait',
      desc: 'Ceremonial grade Uji matcha layered with roasted pistachios, Madagascar vanilla bean mousse, and fresh mint.',
      badge: 'Artisan Reserve',
      price: '13.80',
      tags: ['Matcha', 'Artisan', 'Low-Sugar']
    },
    track: {
      title: 'Rainforest Canopy Reverie',
      artist: 'Botanical Echoes'
    }
  }
};

// Current active state
const state = {
  currentPreset: 'orange',
  themeMode: 'dark', // 'dark' | 'light'
  saturationBoost: 1.0,
  hueOffset: 0,
  palette: [],
  imageSrc: 'assets/sample-orange.jpg',
  exportTab: 'css'
};

// DOM Elements
const currentImagePreview = document.getElementById('currentImagePreview');
const mediaArtwork = document.getElementById('mediaArtwork');
const imageFileInput = document.getElementById('imageFileInput');
const dropzone = document.getElementById('dropzone');
const dropzoneCard = document.getElementById('dropzoneCard');
const themeModeToggle = document.getElementById('themeModeToggle');
const paletteGrid = document.getElementById('paletteGrid');
const heroThemeStatus = document.getElementById('heroThemeStatus');
const extractDominantName = document.getElementById('extractDominantName');
const contrastModeLabel = document.getElementById('contrastModeLabel');
const activeHueBadge = document.getElementById('activeHueBadge');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const randomizeHueBtn = document.getElementById('randomizeHueBtn');
const radiusSegmented = document.getElementById('radiusSegmented');
const ambientMotionToggle = document.getElementById('ambientMotionToggle');
const glassmorphismToggle = document.getElementById('glassmorphismToggle');

// Showcase card elements
const menuItemTitle = document.getElementById('menuItemTitle');
const menuItemDesc = document.getElementById('menuItemDesc');
const menuItemBadge = document.getElementById('menuItemBadge');
const menuItemPrice = document.getElementById('menuItemPrice');
const menuItemTags = document.getElementById('menuItemTags');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playToggleBtn = document.getElementById('playToggleBtn');
const mediaPlayLargeBtn = document.getElementById('mediaPlayLargeBtn');
const musicWave = document.getElementById('musicWave');
const btnAddToCart = document.getElementById('btnAddToCart');

// Export Modal Elements
const exportModal = document.getElementById('exportModal');
const openExportModalBtn = document.getElementById('openExportModalBtn');
const closeExportModalBtn = document.getElementById('closeExportModalBtn');
const exportCodeBlock = document.getElementById('exportCodeBlock');
const copyTokensBtn = document.getElementById('copyTokensBtn');
const copyStatusText = document.getElementById('copyStatusText');
const toastContainer = document.getElementById('toastContainer');

// Canvas for extraction
const extractionCanvas = document.getElementById('extractionCanvas');
const ctx = extractionCanvas.getContext('2d');

/* ==========================================================================
   Color Utilities & Math
   ========================================================================== */

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(1);
}

/* ==========================================================================
   Image Color Extraction Algorithm
   ========================================================================== */

function extractColorsFromImage(imgElement) {
  // Render onto 120x120 canvas for fast sampling
  const size = 120;
  extractionCanvas.width = size;
  extractionCanvas.height = size;
  ctx.drawImage(imgElement, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const colorBuckets = {};

  // Sample pixels, ignoring extreme black or extreme white noise
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue;

    const [h, s, l] = rgbToHsl(r, g, b);

    // Skip almost washed out gray or pure black/white
    if (s < 12 && (l < 15 || l > 85)) continue;

    // Quantize into 24 hue bins and 4 saturation/lightness bins
    const hueBin = Math.round(h / 15) * 15;
    const bucketKey = `${hueBin}_${Math.round(s / 25)}_${Math.round(l / 25)}`;

    if (!colorBuckets[bucketKey]) {
      colorBuckets[bucketKey] = {
        h: hueBin,
        s,
        l,
        count: 0,
        rSum: 0,
        gSum: 0,
        bSum: 0
      };
    }

    colorBuckets[bucketKey].count++;
    colorBuckets[bucketKey].rSum += r;
    colorBuckets[bucketKey].gSum += g;
    colorBuckets[bucketKey].bSum += b;
  }

  // Convert to sorted candidate list
  const candidates = Object.values(colorBuckets).map(bucket => {
    const count = bucket.count;
    const avgR = Math.round(bucket.rSum / count);
    const avgG = Math.round(bucket.gSum / count);
    const avgB = Math.round(bucket.bSum / count);
    const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

    // Score based on frequency, saturation, and healthy lightness
    const vibrancyScore = count * (s / 100) * (1 - Math.abs(l - 50) / 60);

    return {
      r: avgR,
      g: avgG,
      b: avgB,
      h,
      s,
      l,
      count,
      score: vibrancyScore
    };
  }).sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    // Fallback if image is mono
    return generateFallbackPalette(28);
  }

  // Pick top dominant vibrant color as Primary
  const dominant = candidates[0];
  const primaryHue = dominant.h;

  // Find complementary or high contrast secondary
  let secondaryCandidate = candidates.find(c => {
    const hueDiff = Math.abs(c.h - primaryHue);
    return (hueDiff > 50 && hueDiff < 310) && c.s > 25;
  });

  if (!secondaryCandidate) {
    // Synthesize harmony hue (60 deg split)
    const secHue = (primaryHue + 150) % 360;
    const [sr, sg, sb] = hslToRgb(secHue, Math.min(85, dominant.s + 10), 48);
    secondaryCandidate = { r: sr, g: sg, b: sb, h: secHue, s: 75, l: 48 };
  }

  // Accent color (higher saturation or warm highlight)
  let accentCandidate = candidates.find(c => {
    return c !== dominant && c !== secondaryCandidate && c.s > 50;
  });

  if (!accentCandidate) {
    const accHue = (primaryHue + 45) % 360;
    const [ar, ag, ab] = hslToRgb(accHue, 90, 52);
    accentCandidate = { r: ar, g: ag, b: ab, h: accHue, s: 90, l: 52 };
  }

  return assembleAdaptivePalette(dominant, secondaryCandidate, accentCandidate);
}

function generateFallbackPalette(baseHue) {
  const [pr, pg, pb] = hslToRgb(baseHue, 88, 52);
  const [sr, sg, sb] = hslToRgb((baseHue + 140) % 360, 72, 45);
  const [ar, ag, ab] = hslToRgb((baseHue + 40) % 360, 92, 54);
  return assembleAdaptivePalette(
    { r: pr, g: pg, b: pb, h: baseHue, s: 88, l: 52 },
    { r: sr, g: sg, b: sb, h: (baseHue + 140) % 360, s: 72, l: 45 },
    { r: ar, g: ag, b: ab, h: (baseHue + 40) % 360, s: 92, l: 54 }
  );
}

function assembleAdaptivePalette(dom, sec, acc) {
  // Apply state modifications (hue shift and saturation boost)
  const shiftHue = h => ((h + state.hueOffset) % 360 + 360) % 360;
  const boostSat = s => Math.max(15, Math.min(100, Math.round(s * state.saturationBoost)));

  const hPrimary = shiftHue(dom.h);
  const sPrimary = boostSat(dom.s);
  const lPrimary = Math.max(38, Math.min(62, dom.l));
  const [pr, pg, pb] = hslToRgb(hPrimary, sPrimary, lPrimary);

  const hSec = shiftHue(sec.h);
  const sSec = boostSat(sec.s);
  const lSec = Math.max(35, Math.min(58, sec.l));
  const [sr, sg, sb] = hslToRgb(hSec, sSec, lSec);

  const hAcc = shiftHue(acc.h);
  const sAcc = boostSat(acc.s);
  const lAcc = Math.max(45, Math.min(65, acc.l));
  const [ar, ag, ab] = hslToRgb(hAcc, sAcc, lAcc);

  // Surface Tint (Ambient dark surface)
  const [surR, surG, surB] = hslToRgb(hPrimary, 18, 11);

  // Subtle Border Tone
  const [subR, subG, subB] = hslToRgb(hPrimary, 40, 28);

  // Contrast text color for primary button
  const textOnPrimary = getRelativeLuminance(pr, pg, pb) > 0.4 ? '#0f172a' : '#ffffff';

  return [
    {
      role: 'Primary',
      hex: rgbToHex(pr, pg, pb),
      rgb: [pr, pg, pb],
      hsl: [hPrimary, sPrimary, lPrimary],
      contrast: getContrastRatio([pr, pg, pb], [12, 15, 20])
    },
    {
      role: 'Secondary',
      hex: rgbToHex(sr, sg, sb),
      rgb: [sr, sg, sb],
      hsl: [hSec, sSec, lSec],
      contrast: getContrastRatio([sr, sg, sb], [12, 15, 20])
    },
    {
      role: 'Accent Highlight',
      hex: rgbToHex(ar, ag, ab),
      rgb: [ar, ag, ab],
      hsl: [hAcc, sAcc, lAcc],
      contrast: getContrastRatio([ar, ag, ab], [12, 15, 20])
    },
    {
      role: 'Ambient Surface',
      hex: rgbToHex(surR, surG, surB),
      rgb: [surR, surG, surB],
      hsl: [hPrimary, 18, 11],
      contrast: getContrastRatio([surR, surG, surB], [248, 250, 252])
    },
    {
      role: 'Subtle Border',
      hex: rgbToHex(subR, subG, subB),
      rgb: [subR, subG, subB],
      hsl: [hPrimary, 40, 28],
      contrast: 'Subtle'
    },
    {
      role: 'On-Primary Text',
      hex: textOnPrimary,
      rgb: hexToRgb(textOnPrimary),
      hsl: textOnPrimary === '#ffffff' ? [0, 0, 100] : [220, 48, 11],
      contrast: getContrastRatio([pr, pg, pb], hexToRgb(textOnPrimary))
    }
  ];
}

/* ==========================================================================
   Applying Palette to the Site
   ========================================================================== */

function applyPaletteToDocument(palette) {
  state.palette = palette;
  const root = document.documentElement;

  const primary = palette[0];
  const secondary = palette[1];
  const accent = palette[2];
  const surface = palette[3];
  const onPrimary = palette[5];

  // Set CSS Custom Properties
  root.style.setProperty('--primary', primary.hex);
  root.style.setProperty('--primary-rgb', `${primary.rgb[0]}, ${primary.rgb[1]}, ${primary.rgb[2]}`);
  root.style.setProperty('--secondary', secondary.hex);
  root.style.setProperty('--secondary-rgb', `${secondary.rgb[0]}, ${secondary.rgb[1]}, ${secondary.rgb[2]}`);
  root.style.setProperty('--accent', accent.hex);
  root.style.setProperty('--accent-rgb', `${accent.rgb[0]}, ${accent.rgb[1]}, ${accent.rgb[2]}`);
  root.style.setProperty('--text-on-primary', onPrimary.hex);

  // Ambient backdrops
  if (state.themeMode === 'dark') {
    root.style.setProperty('--bg-base', `hsl(${primary.hsl[0]}, 16%, 6%)`);
    root.style.setProperty('--bg-surface', `hsla(${primary.hsl[0]}, 16%, 11%, 0.75)`);
    root.style.setProperty('--bg-surface-elevated', `hsla(${primary.hsl[0]}, 18%, 15%, 0.9)`);
  } else {
    root.style.setProperty('--bg-base', `hsl(${primary.hsl[0]}, 25%, 97%)`);
    root.style.setProperty('--bg-surface', `hsla(${primary.hsl[0]}, 25%, 99%, 0.85)`);
    root.style.setProperty('--bg-surface-elevated', `#ffffff`);
  }

  // Update Status and Labels
  activeHueBadge.textContent = `Primary Hue: ${primary.hsl[0]}°`;
  contrastModeLabel.textContent = `WCAG Contrast ${primary.contrast}:1`;

  // Render Swatches
  renderPaletteSwatches(palette);

  // Update export code preview if modal is active
  updateExportCode();
}

function renderPaletteSwatches(palette) {
  paletteGrid.innerHTML = '';

  palette.forEach(item => {
    const card = document.createElement('div');
    card.className = 'swatch-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.title = `Click to copy ${item.hex}`;

    card.innerHTML = `
      <div class="swatch-color-pill" style="background: ${item.hex};">
        <span class="swatch-contrast-pill">${item.contrast !== 'Subtle' ? item.contrast + ':1' : 'Tone'}</span>
      </div>
      <div class="swatch-meta">
        <span class="swatch-role">${item.role}</span>
        <div class="swatch-hex">
          <span>${item.hex.toUpperCase()}</span>
          <svg class="swatch-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      copyToClipboard(item.hex, `Copied ${item.hex} (${item.role})`);
    });

    paletteGrid.appendChild(card);
  });
}

/* ==========================================================================
   Preset Switching & Custom Upload
   ========================================================================== */

function selectPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;

  state.currentPreset = presetKey;
  state.imageSrc = preset.image;
  state.hueOffset = 0;

  // Update active pill styling
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetKey);
  });

  // Update preview image
  currentImagePreview.src = preset.image;
  mediaArtwork.src = preset.image;

  // Update hero status
  heroThemeStatus.textContent = `Active Theme: ${preset.name}`;
  extractDominantName.textContent = preset.paletteName;

  // Update showcase card texts
  menuItemTitle.textContent = preset.menu.title;
  menuItemDesc.textContent = preset.menu.desc;
  menuItemBadge.textContent = preset.menu.badge;
  menuItemPrice.textContent = preset.menu.price;

  menuItemTags.innerHTML = preset.menu.tags
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  trackTitle.textContent = preset.track.title;
  trackArtist.textContent = preset.track.artist;

  // Trigger color extraction once image is loaded
  if (currentImagePreview.complete) {
    processImageTheme();
  } else {
    currentImagePreview.onload = () => processImageTheme();
  }
}

function processImageTheme() {
  try {
    const palette = extractColorsFromImage(currentImagePreview);
    applyPaletteToDocument(palette);
  } catch (err) {
    console.warn('Canvas extraction blocked (cross-origin or local), using computed fallback:', err);
    const fallback = generateFallbackPalette(state.currentPreset === 'forest' ? 145 : state.currentPreset === 'cyberpunk' ? 190 : 28);
    applyPaletteToDocument(fallback);
  }
}

function handleCustomImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file (JPG, PNG, WebP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const imgDataUrl = e.target.result;
    currentImagePreview.src = imgDataUrl;
    mediaArtwork.src = imgDataUrl;
    state.imageSrc = imgDataUrl;
    state.currentPreset = 'custom';
    state.hueOffset = 0;

    // Deselect preset pills
    document.querySelectorAll('.preset-pill').forEach(btn => btn.classList.remove('active'));

    heroThemeStatus.textContent = 'Active Theme: Custom Uploaded Image';
    extractDominantName.textContent = `User Photo (${file.name})`;
    menuItemTitle.textContent = 'Custom Artisan Selection';
    menuItemDesc.textContent = 'Theme dynamically harmonized from your uploaded visual palette.';
    menuItemBadge.textContent = 'Custom Origin';

    currentImagePreview.onload = () => {
      processImageTheme();
      showToast(`Theme extracted from ${file.name}! ✨`);
    };
  };

  reader.readAsDataURL(file);
}

/* ==========================================================================
   Export Generator (CSS / Tailwind / JSON)
   ========================================================================== */

function updateExportCode() {
  if (!state.palette || state.palette.length === 0) return;

  const [p, s, a, surf, subtle, onP] = state.palette;

  if (state.exportTab === 'css') {
    exportCodeBlock.textContent = `:root {
  /* ChromaShift Generated Theme */
  --primary: ${p.hex};
  --primary-rgb: ${p.rgb.join(', ')};
  --secondary: ${s.hex};
  --secondary-rgb: ${s.rgb.join(', ')};
  --accent: ${a.hex};
  --accent-rgb: ${a.rgb.join(', ')};
  --bg-surface: ${surf.hex};
  --border-subtle: ${subtle.hex};
  --text-on-primary: ${onP.hex};
}`;
  } else if (state.exportTab === 'tailwind') {
    exportCodeBlock.textContent = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${p.hex}',
          hover: '${a.hex}',
        },
        secondary: '${s.hex}',
        accent: '${a.hex}',
        surface: '${surf.hex}',
        border: '${subtle.hex}',
      }
    }
  }
};`;
  } else if (state.exportTab === 'json') {
    const tokens = {
      name: heroThemeStatus.textContent.replace('Active Theme: ', ''),
      themeMode: state.themeMode,
      tokens: {
        primary: { hex: p.hex, rgb: p.rgb, hsl: p.hsl, contrast: p.contrast },
        secondary: { hex: s.hex, rgb: s.rgb, hsl: s.hsl },
        accent: { hex: a.hex, rgb: a.rgb, hsl: a.hsl },
        surface: { hex: surf.hex, rgb: surf.rgb },
        border: { hex: subtle.hex, rgb: subtle.rgb },
        textOnPrimary: { hex: onP.hex }
      }
    };
    exportCodeBlock.textContent = JSON.stringify(tokens, null, 2);
  }
}

/* ==========================================================================
   UI Helpers & Interactions
   ========================================================================== */

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" width="18" height="18">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */

// Drag & drop dropzone
dropzoneCard.addEventListener('click', () => imageFileInput.click());
imageFileInput.addEventListener('change', e => {
  if (e.target.files && e.target.files[0]) {
    handleCustomImageUpload(e.target.files[0]);
  }
});

dropzoneCard.addEventListener('dragover', e => {
  e.preventDefault();
  dropzoneCard.classList.add('drag-over');
});

dropzoneCard.addEventListener('dragleave', () => {
  dropzoneCard.classList.remove('drag-over');
});

dropzoneCard.addEventListener('drop', e => {
  e.preventDefault();
  dropzoneCard.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleCustomImageUpload(e.dataTransfer.files[0]);
  }
});

// Preset button clicks
document.querySelectorAll('.preset-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    selectPreset(btn.dataset.preset);
  });
});

// Light / Dark mode toggle
themeModeToggle.addEventListener('click', () => {
  state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.themeMode);
  processImageTheme();
  showToast(`Switched to ${state.themeMode.toUpperCase()} mode`);
});

// Saturation slider
saturationSlider.addEventListener('input', e => {
  const val = parseInt(e.target.value);
  saturationValue.textContent = `${val}%`;
  state.saturationBoost = val / 100;
  processImageTheme();
});

// Hue Shift button
randomizeHueBtn.addEventListener('click', () => {
  state.hueOffset = (state.hueOffset + 35) % 360;
  processImageTheme();
  showToast(`Shifted palette hue by +35° (${state.palette[0].hsl[0]}°)`);
});

// Radius buttons
radiusSegmented.querySelectorAll('.segment-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    radiusSegmented.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const radius = btn.dataset.radius;
    document.documentElement.style.setProperty('--radius-sm', radius === '8px' ? '4px' : radius === '28px' ? '12px' : '8px');
    document.documentElement.style.setProperty('--radius-md', radius);
    showToast(`Border radius: ${btn.textContent}`);
  });
});

// Ambient and Glass toggles
ambientMotionToggle.addEventListener('change', e => {
  document.querySelectorAll('.ambient-glow').forEach(glow => {
    glow.style.display = e.target.checked ? 'block' : 'none';
  });
});

glassmorphismToggle.addEventListener('change', e => {
  document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.style.backdropFilter = e.target.checked ? 'blur(18px)' : 'none';
    panel.style.webkitBackdropFilter = e.target.checked ? 'blur(18px)' : 'none';
  });
});

// Audio player play/pause toggle
let isPlaying = false;
function togglePlay() {
  isPlaying = !isPlaying;
  musicWave.querySelectorAll('span').forEach(bar => {
    bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
  });
  const playIconHtml = isPlaying
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`;
  mediaPlayLargeBtn.innerHTML = playIconHtml;
  showToast(isPlaying ? 'Audio demo playing' : 'Audio demo paused');
}

playToggleBtn.addEventListener('click', togglePlay);
mediaPlayLargeBtn.addEventListener('click', togglePlay);

// Add to cart interaction
btnAddToCart.addEventListener('click', () => {
  showToast(`Added "${menuItemTitle.textContent}" to cart! 🍽️`);
});

// Export Modal
openExportModalBtn.addEventListener('click', () => {
  exportModal.classList.add('open');
  exportModal.setAttribute('aria-hidden', 'false');
  updateExportCode();
});

closeExportModalBtn.addEventListener('click', () => {
  exportModal.classList.remove('open');
  exportModal.setAttribute('aria-hidden', 'true');
});

exportModal.addEventListener('click', e => {
  if (e.target === exportModal) {
    exportModal.classList.remove('open');
    exportModal.setAttribute('aria-hidden', 'true');
  }
});

// Modal tabs
document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.exportTab = btn.dataset.tab;
    updateExportCode();
  });
});

copyTokensBtn.addEventListener('click', () => {
  copyToClipboard(exportCodeBlock.textContent, 'Theme tokens copied!');
});

// Keyboard shortcut (Escape to close modal)
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && exportModal.classList.contains('open')) {
    exportModal.classList.remove('open');
  }
});

/* ==========================================================================
   Initialization
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  // Start with Citrus Orange preset
  selectPreset('orange');
});
