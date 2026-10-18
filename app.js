/**
 * ChromaShift — Adaptive Intelligent Theme Engine
 * Two-View Architecture: Studio Extractor (Page 1) & Single-Component Stage (Page 2)
 */

// Global State
const state = {
  currentView: 'studio', // 'studio' | 'result'
  activeComponentTab: 'analytics', // 'analytics' | 'media' | 'menu' | 'controls'
  themeMode: 'dark', // 'dark' | 'light'
  harmonyMode: 'vibrant', // 'vibrant' | 'muted' | 'deep'
  saturationBoost: 1.0,
  hueOffset: 0,
  palette: [],
  rawDominant: null,
  rawSecondary: null,
  rawAccent: null,
  imageSrc: 'assets/sample-orange.jpg',
  fileName: 'sample-orange.jpg',
  exportTab: 'tailwind'
};

// Component Name Dictionary
const COMPONENT_NAMES = {
  analytics: 'SaaS Analytics Dashboard',
  media: 'Music Streaming Web App',
  menu: 'Storefront & Product Detail Page',
  controls: 'Design System & UI Kit Playground'
};

// DOM Elements: Views
const viewStudio = document.getElementById('viewStudio');
const viewResult = document.getElementById('viewResult');
const btnGoToResult = document.getElementById('btnGoToResult');
const btnBackToStudio = document.getElementById('btnBackToStudio');
const brandHomeTrigger = document.getElementById('brandHomeTrigger');
const breadcrumbStudioLink = document.getElementById('breadcrumbStudioLink');
const btnShortcutExpectedResult = document.getElementById('btnShortcutExpectedResult');
const breadcrumbActiveComponentName = document.getElementById('breadcrumbActiveComponentName');

// DOM Elements: Theme Toggles
const view1ThemeToggle = document.getElementById('view1ThemeToggle');
const view2ThemeToggle = document.getElementById('view2ThemeToggle');

// DOM Elements: Studio
const currentImagePreview = document.getElementById('currentImagePreview');
const mediaArtwork = document.getElementById('mediaArtwork');
const imageFileInput = document.getElementById('imageFileInput');
const dropzone = document.getElementById('dropzone');
const dropzoneCard = document.getElementById('dropzoneCard');
const btnBrowseFile = document.getElementById('btnBrowseFile');
const uploadFileNameLabel = document.getElementById('uploadFileNameLabel');
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
const ambientMeshGlow = document.getElementById('ambientMeshGlow');
const harmonySegmented = document.getElementById('harmonySegmented');

// DOM Elements: View 2 Sidebar & Template Elements
const sidebarThemeSnapshotName = document.getElementById('sidebarThemeSnapshotName');
const menuItemTitle = document.getElementById('menuItemTitle');
const menuItemDesc = document.getElementById('menuItemDesc');
const menuItemPrice = document.getElementById('menuItemPrice');
const menuItemTags = document.getElementById('menuItemTags');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const mediaPlayHeroBtn = document.getElementById('mediaPlayHeroBtn');
const mediaPlayLargeBtn = document.getElementById('mediaPlayLargeBtn');
const musicWave = document.getElementById('musicWave');
const btnAddToCart = document.getElementById('btnAddToCart');
const productMainImage = document.getElementById('productMainImage');
const mediaArtworkRight = document.getElementById('mediaArtworkRight');
const mediaArtworkMini = document.getElementById('mediaArtworkMini');

// Export Modal Removed

// Hash navigation listener (Strict routing - NEVER kick user back on accidental hash changes)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash === '#result') {
    switchView('result');
  } else if (hash === '#studio') {
    switchView('studio');
  }
  // Any other hash (#media, #store, etc.) is ignored to keep user in their current view
});

// Intercept all clicks inside mockup frame to prevent page navigation or reload
const dashboardContent = document.querySelector('.dashboard-content');
if (dashboardContent) {
  dashboardContent.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const formBtn = e.target.closest('form button');
    if (formBtn) {
      e.preventDefault();
    }
  });
}

// Interactive mockup button feedback without page change
document.querySelectorAll('.spotify-card, .hover-play-btn').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });
});

document.querySelectorAll('.btn-buy-instant, .btn-add-cart, #btnAddToCartMain').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showToast('Item saved to your bag! 🛍️');
  });
});

document.querySelectorAll('.size-pill').forEach(pill => {
  pill.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

document.querySelectorAll('.thumb-slot').forEach(slot => {
  slot.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.thumb-slot').forEach(s => s.classList.remove('active'));
    slot.classList.add('active');
    const img = slot.querySelector('img');
    const mainImg = document.getElementById('productMainImage');
    if (img && mainImg) {
      mainImg.src = img.src;
    }
  });
});

document.querySelectorAll('.btn-heart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.classList.toggle('text-accent');
    btn.classList.toggle('text-primary');
    showToast('Saved to your favorites! ♥');
  });
});

/* ==========================================================================
   Initialization
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#result') {
    switchView('result');
  } else {
    switchView('studio');
  }

  // Load initial theme from default sample
  currentImagePreview.onload = () => processImageTheme();
  if (currentImagePreview.complete) {
    processImageTheme();
  }
});
