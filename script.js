// ==========================================
//  STATE
// ==========================================
const state = {
  occasion: null,
  text: '',
  style: 'minimal',
  palette: 'classic',
  customTextColor: '#1D1D1F',
  customCardColor: '#FFFFFF',
  name: '',
  contact: '',
  comment: ''
};

const MAX_LINES = 5;
const MAX_CHARS = 120;
const MAX_CHARS_PER_LINE = 16;

// ==========================================
//  ROOM BACKGROUNDS (Unsplash)
// ==========================================
const ROOMS = [
  {
    name: 'Гостиная',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&h=680&fit=crop&crop=center&q=80',
    thumb: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=100&h=76&fit=crop&crop=center&q=60'
  },
  {
    name: 'Уютная',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=680&fit=crop&crop=center&q=80',
    thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=76&fit=crop&crop=center&q=60'
  },
  {
    name: 'Светлая',
    url: 'https://images.unsplash.com/photo-1560448076-957f79776e95?w=900&h=680&fit=crop&crop=center&q=80',
    thumb: 'https://images.unsplash.com/photo-1560448076-957f79776e95?w=100&h=76&fit=crop&crop=center&q=60'
  },
  {
    name: 'Модерн',
    url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&h=680&fit=crop&crop=center&q=80',
    thumb: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=100&h=76&fit=crop&crop=center&q=60'
  }
];
let currentRoom = 0;

// ==========================================
//  PALETTES
// ==========================================
const PALETTES = {
  classic: { text: '#1D1D1F', card: '#FFFFFF', multi: false },
  ocean:   { text: '#1E40AF', card: '#FFFFFF', multi: false },
  sunset:  { text: '#C2410C', card: '#FFFFFF', multi: false },
  forest:  { text: '#15803D', card: '#FFFFFF', multi: false },
  berry:   { text: '#7E22CE', card: '#FFFFFF', multi: false },
  candy:   { colors: ['#F472B6','#60A5FA','#34D399','#FBBF24','#A78BFA','#FB923C'], card: '#FFFFFF', multi: true },
  custom:  { text: '#1D1D1F', card: '#FFFFFF', multi: false }
};

// ==========================================
//  SUGGESTIONS PER OCCASION
// ==========================================
const SUGGESTIONS = {
  birthday:     ['С ДНЁМ РОЖДЕНИЯ', 'ПОЗДРАВЛЯЕМ', 'С ЮБИЛЕЕМ', 'ЛУЧШИЙ ДЕНЬ'],
  wedding:      ['СОВЕТ ДА ЛЮБОВЬ', 'ГОРЬКО', 'СЧАСТЬЯ ВАМ'],
  graduation:   ['УРА КАНИКУЛЫ', 'Я СДЕЛАЛ ЭТО', 'ВЫПУСКНИК'],
  newyear:      ['С НОВЫМ ГОДОМ', 'УРА ПРАЗДНИК', 'С НАСТУПАЮЩИМ'],
  march8:       ['С 8 МАРТА', 'ЛЮБИМЫМ ДЕВОЧКАМ', 'ВЕСНА ПРИШЛА'],
  feb23:        ['С 23 ФЕВРАЛЯ', 'ЗАЩИТНИКАМ', 'НАСТОЯЩИЙ ГЕРОЙ'],
  corporate:    ['ЛУЧШАЯ КОМАНДА', 'МЫ МОЛОДЦЫ', 'НАМ ПО СИЛАМ ВСЁ'],
  bachelorette: ['ПРОЩАЙ СВОБОДА', 'ПОСЛЕДНИЙ ДЕНЬ', 'НЕВЕСТА'],
  party:        ['БОРИСЬ И ПОЗОРЬСЯ\nДО КОНЦА', 'ПОЧЕМУ НЕТ\nЕСЛИ ДА', 'НЕ ПАДАЙ ДУХОМ\nГДЕ ПОПАЛО', 'СЧАСТЛИВОГО\nЧЕГО-ТО ТАМ', 'МЕНЯ СЕГОДНЯ\nРЕТРОГРАДИТ']
};

// ==========================================
//  COSMOS GRADIENTS
// ==========================================
function cosmosGradient(index, total) {
  const hue1 = 260 + (index / Math.max(total - 1, 1)) * 60;
  const hue2 = hue1 + 30;
  return `linear-gradient(135deg, hsl(${hue1},72%,52%), hsl(${hue2},72%,58%))`;
}

const CHALK_COLORS = ['#FBBF24','#60A5FA','#F472B6','#34D399','#FB923C','#A78BFA','#F87171'];

// ==========================================
//  DOM REFS
// ==========================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const previewCanvas = $('#previewCanvas');
const previewEmpty = $('#previewEmpty');
const bannerContainer = $('#bannerContainer');
const textInput = $('#bannerText');
const charCounter = $('#charCounter');
const lineCounter = $('#lineCounter');
const suggestionsLabel = $('#suggestionsLabel');
const suggestionsContainer = $('#suggestionsContainer');
const customColorRow = $('#customColorRow');
const submitBtn = $('#submitBtn');
const successToast = $('#successToast');
const confettiContainer = $('#confettiContainer');
const previewModalOverlay = $('#previewModalOverlay');

// ==========================================
//  SPLIT TEXT INTO LINES (respects \n, auto-wraps long lines)
// ==========================================
function splitIntoLines(text) {
  const rawLines = text.split('\n');
  const result = [];

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      // Preserve blank line as separator if between content
      if (result.length > 0 && result.length < MAX_LINES) continue;
      continue;
    }

    if (trimmed.length <= MAX_CHARS_PER_LINE) {
      result.push(trimmed);
    } else {
      // Auto-wrap long lines by words
      const words = trimmed.split(/\s+/);
      let cur = '';
      for (const w of words) {
        if (cur.length + w.length + 1 > MAX_CHARS_PER_LINE && cur) {
          result.push(cur);
          if (result.length >= MAX_LINES) break;
          cur = w;
        } else {
          cur += (cur ? ' ' : '') + w;
        }
      }
      if (cur && result.length < MAX_LINES) result.push(cur);
    }

    if (result.length >= MAX_LINES) break;
  }

  return result;
}

// ==========================================
//  LINE SCALE — shrink letters for more lines
// ==========================================
function getLineScale(lineCount) {
  const scales = { 1: 0.9, 2: 0.72, 3: 0.58, 4: 0.48, 5: 0.40 };
  return scales[Math.min(lineCount, 5)] || 0.9;
}

// ==========================================
//  RENDER BANNER PREVIEW
// ==========================================
let animationCounter = 0;

function renderBanner() {
  const text = state.text.toUpperCase().trim();

  if (!text) {
    bannerContainer.style.display = 'none';
    previewEmpty.style.display = '';
    updateCounters();
    return;
  }

  previewEmpty.style.display = 'none';
  bannerContainer.style.display = '';
  bannerContainer.innerHTML = '';
  bannerContainer.className = 'banner-container style-' + state.style;

  const lines = splitIntoLines(text);
  const lineCount = lines.length;
  const scale = getLineScale(lineCount);

  bannerContainer.dataset.lines = lineCount;
  bannerContainer.style.setProperty('--line-scale', scale);

  const pal = state.palette === 'custom'
    ? { text: state.customTextColor, card: state.customCardColor, multi: false }
    : PALETTES[state.palette];

  animationCounter++;
  const thisAnim = animationCounter;

  let globalCharIdx = 0;

  lines.forEach((line, lineIdx) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'banner-line';

    const lettersEl = document.createElement('div');
    lettersEl.className = 'banner-letters';

    const chars = line.split('');
    const n = chars.length;
    const sag = Math.min(16, 5 + n * 0.7) * scale;
    const maxRot = 2.5;

    // SVG string
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('string-svg');
    svg.setAttribute('preserveAspectRatio', 'none');

    lineEl.appendChild(svg);
    lineEl.appendChild(lettersEl);

    chars.forEach((ch, i) => {
      const letterEl = document.createElement('div');
      letterEl.className = 'banner-letter';

      if (ch === ' ') {
        letterEl.classList.add('letter-space');
        lettersEl.appendChild(letterEl);
        globalCharIdx++;
        return;
      }

      const t = n > 1 ? i / (n - 1) : 0.5;
      const yOffset = sag * 4 * t * (1 - t);
      const rotation = maxRot * (2 * t - 1) * (0.6 + Math.random() * 0.4);

      letterEl.style.setProperty('--y', yOffset + 'px');
      letterEl.style.setProperty('--rot', rotation + 'deg');
      letterEl.style.setProperty('--idx', i);

      // Clip
      const clip = document.createElement('div');
      clip.className = 'letter-clip';

      // Body
      const body = document.createElement('div');
      body.className = 'letter-body';
      body.textContent = ch;

      applyLetterStyle(body, i, n, pal);

      letterEl.appendChild(clip);
      letterEl.appendChild(body);

      // Entrance animation, then settle
      letterEl.classList.add('animate-in');
      letterEl.style.animationDelay = (globalCharIdx * 0.035) + 's';
      letterEl.addEventListener('animationend', () => {
        letterEl.classList.remove('animate-in');
        letterEl.classList.add('settled');
      }, { once: true });

      lettersEl.appendChild(letterEl);
      globalCharIdx++;
    });

    bannerContainer.appendChild(lineEl);

    // Draw SVG string after layout settles
    requestAnimationFrame(() => {
      if (animationCounter !== thisAnim) return;
      drawStringPath(svg, lettersEl, sag);
    });
  });

  updatePrice(text);
  updateCounters();
}

function applyLetterStyle(body, index, total, pal) {
  const style = state.style;

  if (style === 'minimal') {
    body.style.color = pal.multi ? pal.colors[index % pal.colors.length] : pal.text;
  }

  else if (style === 'cards') {
    body.style.background = pal.card;
    body.style.color = pal.multi ? pal.colors[index % pal.colors.length] : pal.text;
  }

  else if (style === 'cosmos') {
    body.style.background = cosmosGradient(index, total);
    body.style.color = '#fff';
  }

  else if (style === 'chalk') {
    body.style.background = '#2A2A2A';
    if (pal.multi) {
      body.style.color = pal.colors[index % pal.colors.length];
    } else if (state.palette !== 'classic') {
      body.style.color = pal.text;
    } else {
      body.style.color = CHALK_COLORS[index % CHALK_COLORS.length];
    }
  }

  else if (style === 'contrast') {
    const textColor = pal.multi ? pal.colors[index % pal.colors.length] : pal.text;
    if (index % 2 === 0) {
      body.style.background = textColor;
      body.style.color = '#fff';
    } else {
      body.style.background = '#fff';
      body.style.color = textColor;
      body.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
    }
  }
}

// Walk offsetParent chain to get position relative to ancestor
function offsetRelativeTo(el, ancestor) {
  let x = 0, y = 0, cur = el;
  while (cur && cur !== ancestor) {
    x += cur.offsetLeft;
    y += cur.offsetTop;
    cur = cur.offsetParent;
  }
  return { x, y };
}

function drawStringPath(svg, lettersEl, sag) {
  const letters = lettersEl.querySelectorAll('.banner-letter:not(.letter-space)');
  if (letters.length < 2) {
    svg.style.display = 'none';
    return;
  }

  const lineEl = lettersEl.parentElement;
  const svgW = lineEl.offsetWidth;
  const svgH = lineEl.offsetHeight;

  if (svgW <= 0 || svgH <= 0) return;

  svg.style.display = '';
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.style.width = svgW + 'px';
  svg.style.height = svgH + 'px';

  const first = letters[0];
  const last = letters[letters.length - 1];

  // offsetLeft/offsetTop are NOT affected by CSS transforms,
  // so these are correct even while entrance animation plays
  const fp = offsetRelativeTo(first, lineEl);
  const lp = offsetRelativeTo(last, lineEl);

  const padX = 12;
  const x1 = fp.x + first.offsetWidth / 2 - padX;
  const x2 = lp.x + last.offsetWidth / 2 + padX;
  const y1 = fp.y + 2;
  const y2 = lp.y + 2;
  const cx = (x1 + x2) / 2;
  const cy = Math.max(y1, y2) + sag + 4;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
  svg.innerHTML = '';
  svg.appendChild(path);
}

// ==========================================
//  UPDATE COUNTERS
// ==========================================
function updateCounters() {
  const text = state.text;
  const len = text.length;
  const lines = text.trim() ? splitIntoLines(text.toUpperCase().trim()) : [];
  const lineCount = lines.length;

  charCounter.textContent = `${len} / ${MAX_CHARS}`;
  charCounter.classList.toggle('warn', len > MAX_CHARS - 10);

  lineCounter.textContent = `${lineCount} / ${MAX_LINES} строк`;
  lineCounter.classList.toggle('warn', lineCount >= MAX_LINES);
}

// ==========================================
//  MOBILE PREVIEW SYNC
// ==========================================
function syncMobilePreview() {
  const mobileCanvas = $('#mobilePreviewCanvas');
  if (!mobileCanvas) return;
  mobileCanvas.innerHTML = '';
  // Copy the room background
  const room = ROOMS[currentRoom];
  mobileCanvas.style.backgroundImage = `url('${room.url}')`;
  mobileCanvas.style.backgroundSize = 'cover';
  mobileCanvas.style.backgroundPosition = 'center';
  if (!state.text.trim()) {
    mobileCanvas.innerHTML = '<div class="preview-empty"><div class="preview-empty-icon">🎏</div><p>Введите текст</p></div>';
  } else {
    const clone = bannerContainer.cloneNode(true);
    clone.style.display = '';
    // Remove animate-in, add settled to all letters in clone
    clone.querySelectorAll('.banner-letter').forEach(l => {
      l.classList.remove('animate-in');
      l.classList.add('settled');
      l.style.animationDelay = '';
    });
    mobileCanvas.appendChild(clone);
  }
}

// ==========================================
//  PRICE CALC
// ==========================================
function updatePrice(text) {
  const letterCount = text.replace(/\s/g, '').length;
  const basePrice = 590;
  const perLetter = 50;
  const price = basePrice + letterCount * perLetter;
  const priceEl = $('#orderPrice');
  if (priceEl) {
    priceEl.textContent = letterCount > 0 ? `${price.toLocaleString('ru-RU')} ₽` : 'от 990 ₽';
  }
}

// ==========================================
//  VALIDATE FORM
// ==========================================
function validateForm() {
  const hasText = state.text.trim().length > 0;
  const hasName = state.name.trim().length > 0;
  const hasContact = state.contact.trim().length > 0;
  submitBtn.disabled = !(hasText && hasName && hasContact);
}

// ==========================================
//  SUGGESTIONS
// ==========================================
function showSuggestions(occasion) {
  const items = SUGGESTIONS[occasion] || [];
  if (!items.length) {
    suggestionsLabel.style.display = 'none';
    suggestionsContainer.innerHTML = '';
    return;
  }
  suggestionsLabel.style.display = '';
  suggestionsContainer.innerHTML = '';
  items.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    // Show display text without newlines
    chip.textContent = s.replace(/\n/g, ' ');
    chip.addEventListener('click', () => {
      textInput.value = s;
      state.text = s;
      renderBanner();
      validateForm();
    });
    suggestionsContainer.appendChild(chip);
  });
}

// ==========================================
//  CONFETTI
// ==========================================
function launchConfetti() {
  const colors = ['#FF6723','#FBBF24','#34D399','#60A5FA','#F472B6','#A78BFA'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    confettiContainer.appendChild(piece);
  }
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 5000);
}

// ==========================================
//  EVENT HANDLERS
// ==========================================

// Occasion pills
$$('.occasion-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    $$('.occasion-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.occasion = pill.dataset.occasion;
    showSuggestions(state.occasion);
  });
});

// Text input (supports multiline via Enter)
textInput.addEventListener('input', (e) => {
  state.text = e.target.value;
  renderBanner();
  validateForm();
});

// Style cards
$$('.style-card').forEach(card => {
  card.addEventListener('click', () => {
    $$('.style-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    state.style = card.dataset.style;
    renderBanner();
  });
});

// Palette buttons
$$('.palette-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.palette-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.palette = btn.dataset.palette;
    customColorRow.style.display = state.palette === 'custom' ? 'flex' : 'none';
    renderBanner();
  });
});

// Custom colors
$('#customTextColor').addEventListener('input', (e) => {
  state.customTextColor = e.target.value;
  renderBanner();
});
$('#customCardColor').addEventListener('input', (e) => {
  state.customCardColor = e.target.value;
  renderBanner();
});

// Form fields
$('#orderName').addEventListener('input', (e) => { state.name = e.target.value; validateForm(); });
$('#orderContact').addEventListener('input', (e) => { state.contact = e.target.value; validateForm(); });
$('#orderComment').addEventListener('input', (e) => { state.comment = e.target.value; });

// Submit
submitBtn.addEventListener('click', () => {
  if (submitBtn.disabled) return;

  const order = {
    occasion: state.occasion,
    text: state.text,
    lines: splitIntoLines(state.text.toUpperCase().trim()),
    style: state.style,
    palette: state.palette,
    customColors: state.palette === 'custom'
      ? { text: state.customTextColor, card: state.customCardColor }
      : null,
    name: state.name,
    contact: state.contact,
    comment: state.comment,
    timestamp: new Date().toISOString()
  };

  console.log('📦 Заказ:', order);

  successToast.classList.add('show');
  launchConfetti();
  setTimeout(() => { successToast.classList.remove('show'); }, 4000);
});

// Mobile preview
const mobilePreviewBtn = $('#mobilePreviewBtn');
if (mobilePreviewBtn) {
  mobilePreviewBtn.addEventListener('click', () => {
    syncMobilePreview();
    previewModalOverlay.style.display = 'block';
    requestAnimationFrame(() => {
      previewModalOverlay.classList.add('show');
    });
  });
}

previewModalOverlay.addEventListener('click', (e) => {
  if (e.target === previewModalOverlay || e.target.classList.contains('preview-modal-handle')) {
    previewModalOverlay.classList.remove('show');
    setTimeout(() => { previewModalOverlay.style.display = 'none'; }, 400);
  }
});

// ==========================================
//  SCROLL REVEAL
// ==========================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => observer.observe(el));

// ==========================================
//  RESIZE → REDRAW STRINGS
// ==========================================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderBanner, 200);
});

// ==========================================
//  ROOM BACKGROUNDS INIT
// ==========================================
function setRoom(index) {
  currentRoom = index;
  const room = ROOMS[index];
  previewCanvas.style.backgroundImage = `url('${room.url}')`;
  // Update thumbnails
  document.querySelectorAll('.room-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });
}

function initRooms() {
  const thumbsContainer = document.getElementById('roomThumbs');
  ROOMS.forEach((room, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'room-thumb' + (i === 0 ? ' active' : '');
    thumb.style.backgroundImage = `url('${room.thumb}')`;
    thumb.title = room.name;
    thumb.addEventListener('click', () => setRoom(i));
    thumbsContainer.appendChild(thumb);
  });
  // Preload room images
  ROOMS.forEach(room => {
    const img = new Image();
    img.src = room.url;
  });
  // Set initial room
  setRoom(0);
}

// ==========================================
//  INIT — demo with 2 lines
// ==========================================
(function init() {
  initRooms();
  const demo = 'ВАША\nГИРЛЯНДА';
  textInput.value = demo;
  state.text = demo;
  renderBanner();
  validateForm();
})();
