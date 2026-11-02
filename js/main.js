/* ==========================================================================
   AARU'S ROMANTIC BIRTHDAY SURPRISE - INTERACTIVE JAVASCRIPT
   Canvas Petal Particles, Web Audio Melody, Romantic Surprises & Gifts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPetalCanvas();
  initWebAudio();
  initChocolateBox();
  initTeddyHug();
  initFlowerShower();
  initGiftBoxes();
  initPhotoLightbox();
  initFairyTrail();
  initFinaleActions();
});

/* ==========================================================================
   1. CANVAS ROSE PETALS & FLOATING HEARTS
   ========================================================================== */
function initPetalCanvas() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const maxPetals = window.innerWidth < 600 ? 30 : 55;

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.8;
      this.angle = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.oscillationSpeed = Math.random() * 0.02 + 0.01;
      this.oscillationDist = Math.random() * 1.5 + 0.5;
      this.time = Math.random() * 100;
      this.type = Math.random() > 0.25 ? 'petal' : 'heart';
      this.alpha = Math.random() * 0.4 + 0.4;
      this.hue = Math.floor(Math.random() * 20 + 340); // 340 to 360 (Rose/Red)
    }

    update() {
      this.time += this.oscillationSpeed;
      this.y += this.speedY;
      this.x += Math.sin(this.time) * this.oscillationDist + this.speedX;
      this.angle += this.rotSpeed;

      if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.alpha;

      if (this.type === 'petal') {
        // Draw 3D curved rose petal
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          this.size * 0.7, -this.size * 0.8,
          this.size * 1.2, this.size * 0.4,
          0, this.size * 1.3
        );
        ctx.bezierCurveTo(
          -this.size * 1.2, this.size * 0.4,
          -this.size * 0.7, -this.size * 0.8,
          0, 0
        );
        const grad = ctx.createRadialGradient(0, this.size * 0.4, 0, 0, this.size * 0.4, this.size);
        grad.addColorStop(0, `hsla(${this.hue}, 95%, 72%, 0.85)`);
        grad.addColorStop(0.7, `hsla(${this.hue}, 85%, 50%, 0.8)`);
        grad.addColorStop(1, `hsla(${this.hue}, 90%, 35%, 0.7)`);
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        // Draw mini glowing floating heart
        const s = this.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.5, -s, s * 0.2, 0, s);
        ctx.bezierCurveTo(s, s * 0.2, s * 0.5, -s * 0.5, 0, s * 0.3);
        ctx.fillStyle = `rgba(244, 63, 94, ${this.alpha * 0.9})`;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < maxPetals; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw(ctx);
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Burst petals function exposed globally
  window.burstPetals = function(count = 35) {
    for (let i = 0; i < count; i++) {
      const p = new Petal();
      p.x = width * 0.5 + (Math.random() - 0.5) * (width * 0.6);
      p.y = Math.random() * (height * 0.3);
      p.speedY = Math.random() * 3 + 2;
      petals.push(p);
    }
    // Trim back after 4 seconds
    setTimeout(() => {
      while (petals.length > maxPetals) {
        petals.pop();
      }
    }, 4000);
  };
}

/* ==========================================================================
   2. WEB AUDIO ROMANTIC MUSIC & CHIMES (NO EXTERNAL AUDIO FILES NEEDED!)
   ========================================================================== */
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function initWebAudio() {
  const musicToggle = document.getElementById('music-toggle');
  if (!musicToggle) return;

  function toggleMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (isMusicPlaying) {
      stopRomanticMelody();
      musicToggle.classList.add('music-paused');
      musicToggle.setAttribute('aria-label', 'Play Romantic Music');
    } else {
      startRomanticMelody();
      musicToggle.classList.remove('music-paused');
      musicToggle.setAttribute('aria-label', 'Pause Romantic Music');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // Auto-start music on first interaction if possible
  const startOnce = () => {
    if (!isMusicPlaying) {
      toggleMusic();
    }
    window.removeEventListener('click', startOnce);
  };
  window.addEventListener('click', startOnce, { once: true });
}

function playNote(freq, startTime, duration, type = 'sine', gainVal = 0.12) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function startRomanticMelody() {
  if (isMusicPlaying) return;
  isMusicPlaying = true;

  // Gentle, romantic arpeggio notes in F Major / D Minor (Hz)
  const notes = [
    349.23, 440.0, 523.25, 698.46, 523.25, 440.0, // F4, A4, C5, F5, C5, A4
    293.66, 349.23, 440.0, 587.33, 440.0, 349.23, // D4, F4, A4, D5, A4, F4
    261.63, 329.63, 392.0, 523.25, 392.0, 329.63, // C4, E4, G4, C5, G4, E4
    233.08, 293.66, 349.23, 466.16, 349.23, 293.66  // Bb3, D4, F4, Bb4, F4, D4
  ];

  let step = 0;
  function scheduleNext() {
    if (!isMusicPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const freq = notes[step % notes.length];
    
    // Main chime note
    playNote(freq, now, 0.9, 'triangle', 0.07);
    // Soft high harmonic
    playNote(freq * 2, now + 0.02, 0.6, 'sine', 0.03);

    step++;
  }

  scheduleNext();
  musicInterval = setInterval(scheduleNext, 520);
}

function stopRomanticMelody() {
  isMusicPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

// Sound effect for magic sparkle
function playSparkleSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  const now = audioCtx.currentTime;
  notes.forEach((f, i) => {
    playNote(f, now + i * 0.08, 0.5, 'sine', 0.08);
  });
}

/* ==========================================================================
   3. CHOCOLATE SURPRISE SECTION 🍫
   ========================================================================== */
function initChocolateBox() {
  const chocBox = document.getElementById('choc-box-interactive');
  const toggleBtn = document.getElementById('choc-toggle-btn');
  const slots = document.querySelectorAll('.choc-slot');

  if (!chocBox) return;

  function openChocBox() {
    chocBox.classList.add('is-open');
    playSparkleSound();
    if (window.burstPetals) window.burstPetals(25);
    createFloatingEmojis(chocBox, ['🍫', '❤️', '✨', '💝', '🍬'], 18);
  }

  function toggleBox() {
    if (chocBox.classList.contains('is-open')) {
      chocBox.classList.remove('is-open');
    } else {
      openChocBox();
    }
  }

  chocBox.addEventListener('click', (e) => {
    // If clicking lid
    if (!chocBox.classList.contains('is-open')) {
      openChocBox();
    }
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleBox);
  }

  // Individual chocolate clicks
  const chocMessages = [
    "Heart Truffle: Sweeter than all the chocolate in the world! ❤️",
    "Gold Swirl: Pure luxury for my golden girl! ✨",
    "Rosebud Delight: As delicate and fragrant as your smile! 🌹",
    "Caramel Kiss: Melts straight in your heart! 🍬",
    "Berry Blush: Bursting with infinite sweetness! 🍓",
    "Hazelnut Dream: Crispy, rich, and made with love! 🌰"
  ];

  slots.forEach((slot, idx) => {
    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      playSparkleSound();
      createFloatingEmojis(slot, ['❤️', '✨', '🍫'], 6);
      showToast(chocMessages[idx % chocMessages.length]);
    });
  });
}

/* ==========================================================================
   4. TEDDY BEAR SURPRISE 🧸
   ========================================================================== */
function initTeddyHug() {
  const hugBtn = document.getElementById('send-hug-btn');
  const teddyWrapper = document.getElementById('teddy-interactive-wrapper');
  const hugCountBadge = document.getElementById('hug-counter-badge');
  let hugCount = 1;

  function deliverHug() {
    if (!teddyWrapper) return;
    teddyWrapper.classList.remove('hugging');
    void teddyWrapper.offsetWidth; // Trigger reflow
    teddyWrapper.classList.add('hugging');

    playSparkleSound();
    hugCount++;
    if (hugCountBadge) {
      hugCountBadge.innerHTML = `🧸 Bear Hugs Sent: <strong>${hugCount}</strong> 🤗`;
    }

    createFloatingEmojis(teddyWrapper, ['🤗', '❤️', '🧸', '💖', '🫂', '✨'], 22);
    showToast("Big warm cuddly bear hug delivered to Aaru! 🤗❤️");
  }

  if (hugBtn) {
    hugBtn.addEventListener('click', deliverHug);
  }
  if (teddyWrapper) {
    teddyWrapper.addEventListener('click', deliverHug);
  }
}

/* ==========================================================================
   5. FLOWER SHOWER 🌹
   ========================================================================== */
function initFlowerShower() {
  const showerBtn = document.getElementById('shower-roses-btn');
  if (!showerBtn) return;

  showerBtn.addEventListener('click', () => {
    playSparkleSound();
    if (window.burstPetals) {
      window.burstPetals(60);
    }
    createFloatingEmojis(showerBtn, ['🌹', '🌸', '💐', '🌺', '💖'], 25);
    showToast("Shower of infinite roses blooming for you, my queen! 🌹💐");
  });
}

/* ==========================================================================
   6. INTERACTIVE 3 GIFT BOXES 🎁
   ========================================================================== */
function initGiftBoxes() {
  const giftBoxes = document.querySelectorAll('.gift-card');
  const modal = document.getElementById('gift-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-gift-title');
  const modalBody = document.getElementById('modal-gift-body');

  const giftData = {
    1: {
      title: "🍫 Gift 1: Chocolate Surprise",
      content: `
        <div style="font-size: 3.5rem; margin-bottom: 15px;">🍫🎁✨</div>
        <p style="font-size: 1.15rem; color: #fff; line-height: 1.6; margin-bottom: 15px;">
          "Sending you a box of unlimited sweetness! May every single bite bring a smile to your cute face, my dearest Aaru!" 🍫❤️
        </p>
        <div style="display: flex; justify-content: center; gap: 8px; font-size: 1.8rem;">
          🍬 🍫 🍓 🌰 💝
        </div>
      `
    },
    2: {
      title: "🧸 Gift 2: Teddy Bear Surprise",
      content: `
        <div style="font-size: 3.5rem; margin-bottom: 15px;">🧸💖🤗</div>
        <p style="font-size: 1.15rem; color: #fff; line-height: 1.6; margin-bottom: 15px;">
          "This cuddly little teddy promises to give you infinite hugs whenever you need one! You are my forever cutie pie!" 🧸💕
        </p>
        <div style="display: flex; justify-content: center; gap: 8px; font-size: 1.8rem;">
          🧸 🫂 💗 🎀 🧸
        </div>
      `
    },
    3: {
      title: "💌 Gift 3: A Message From My Heart",
      content: `
        <div style="font-size: 3.5rem; margin-bottom: 15px;">💌🌹💍</div>
        <p style="font-size: 1.15rem; color: #fff; line-height: 1.6; margin-bottom: 20px;">
          "The most precious gift I have is my heart, and it beats only for you. Scroll down to read my personal letter written just for you!" ❤️
        </p>
        <button class="btn-romantic" onclick="scrollToLetter()" style="padding: 12px 28px; font-size: 0.95rem;">
          Open Letter Now 💌
        </button>
      `
    }
  };

  giftBoxes.forEach((box) => {
    box.addEventListener('click', () => {
      const giftId = box.getAttribute('data-gift-id');
      const data = giftData[giftId];
      if (!data) return;

      playSparkleSound();
      createFloatingEmojis(box, ['🎁', '✨', '💖', '🎉'], 15);

      if (modalTitle && modalBody && modal) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        modal.classList.add('active');
      }
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  window.scrollToLetter = function() {
    if (modal) modal.classList.remove('active');
    const letterSec = document.getElementById('personal-message');
    if (letterSec) {
      letterSec.scrollIntoView({ behavior: 'smooth' });
    }
  };
}

/* ==========================================================================
   7. PHOTO LIGHTBOX MODAL
   ========================================================================== */
function initPhotoLightbox() {
  const polaroids = document.querySelectorAll('.polaroid-card');
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImg) return;

  polaroids.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const cap = card.querySelector('.polaroid-caption');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Aaru';
      }
      if (cap && lightboxCaption) {
        lightboxCaption.textContent = cap.textContent;
      }
      playSparkleSound();
      lightbox.classList.add('active');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });
}

/* ==========================================================================
   8. FAIRY SPARKLE & TOUCH TRAIL FX
   ========================================================================== */
function initFairyTrail() {
  let lastSpawn = 0;
  const sparkles = ['✨', '💖', '⭐', '🌸', '💕'];

  function spawnFairySparkle(x, y) {
    const now = Date.now();
    if (now - lastSpawn < 45) return; // Throttle
    lastSpawn = now;

    const el = document.createElement('div');
    el.className = 'fairy-sparkle';
    el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 850);
  }

  window.addEventListener('mousemove', (e) => {
    spawnFairySparkle(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      spawnFairySparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
}

/* ==========================================================================
   9. GRAND FINALE & UTILITIES
   ========================================================================== */
function initFinaleActions() {
  const readAgainBtn = document.getElementById('read-again-btn');
  if (readAgainBtn) {
    readAgainBtn.addEventListener('click', () => {
      const target = document.getElementById('personal-message');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Subtle glow effect on the letter
        const letterCard = target.querySelector('.letter-envelope-card');
        if (letterCard) {
          letterCard.style.transition = 'box-shadow 0.6s ease';
          letterCard.style.boxShadow = '0 0 70px rgba(244, 63, 94, 0.8)';
          setTimeout(() => {
            letterCard.style.boxShadow = '';
          }, 2000);
        }
      }
    });
  }
}

// Floating emoji bursts from interactive elements
function createFloatingEmojis(parentEl, emojiList, count = 12) {
  const rect = parentEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'celebration-burst';
    el.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
    el.style.left = `${centerX}px`;
    el.style.top = `${centerY}px`;
    el.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    el.style.position = 'fixed';
    el.style.transition = 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.opacity = '1';
    el.style.zIndex = '9999';

    document.body.appendChild(el);

    const destX = centerX + (Math.random() - 0.5) * 240;
    const destY = centerY - (Math.random() * 220 + 80);

    requestAnimationFrame(() => {
      el.style.transform = `translate(${destX - centerX}px, ${destY - centerY}px) scale(${Math.random() * 0.6 + 0.8}) rotate(${(Math.random() - 0.5) * 60}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      el.remove();
    }, 1500);
  }
}

// Sweet toast notification
let toastTimer = null;
function showToast(msg) {
  let toast = document.getElementById('romantic-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'romantic-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(59, 7, 24, 0.95);
      border: 1px solid #f43f5e;
      color: #fff;
      padding: 12px 24px;
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(225,29,72,0.4);
      z-index: 10000;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      text-align: center;
      max-width: 90vw;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 3200);
}

