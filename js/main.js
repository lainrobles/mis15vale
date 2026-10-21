const intro = document.getElementById('intro');
const openButton = document.getElementById('openInvitation');
const music = document.getElementById('music');
const musicToggle = document.getElementById('musicToggle');
const mainContent = document.getElementById('mainContent');

function prepareHeroLetters() {
  const title = document.querySelector('[data-animate-letters]');
  if (!title || title.dataset.prepared) return;

  const text = title.textContent.trim();
  title.textContent = '';
  [...text].forEach((character, index) => {
    const span = document.createElement('span');
    span.className = character === ' ' ? 'letter space' : 'letter';
    span.style.setProperty('--letter-index', index);
    span.textContent = character === ' ' ? '\u00a0' : character;
    title.appendChild(span);
  });
  title.dataset.prepared = 'true';
}

prepareHeroLetters();

function openInvitation() {
  intro?.classList.add('hidden');
  mainContent?.classList.add('visible');
  mainContent?.setAttribute('aria-hidden', 'false');
  musicToggle?.classList.add('visible');

  if (music) {
    music.volume = 0.4;
    music.play().catch(() => musicToggle?.classList.add('muted'));
  }

  window.setTimeout(() => intro?.remove(), 900);
}

openButton?.addEventListener('click', openInvitation);

musicToggle?.addEventListener('click', () => {
  if (!music) return;
  if (music.paused) {
    music.play().then(() => musicToggle.classList.remove('muted')).catch(() => {});
  } else {
    music.pause();
    musicToggle.classList.add('muted');
  }
});

const eventDate = new Date('2026-11-28T22:00:00-03:00').getTime();

function setFlipValue(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  const nextValue = String(value).padStart(2, '0');
  if (element.dataset.value === nextValue) return;

  element.classList.remove('is-flipping');
  element.parentElement?.classList.remove('is-turning');
  void element.offsetWidth;
  element.textContent = nextValue;
  element.dataset.value = nextValue;
  element.classList.add('is-flipping');
  element.parentElement?.classList.add('is-turning');
  window.setTimeout(() => element.parentElement?.classList.remove('is-turning'), 820);
}

function updateCountdown() {
  const countdown = document.getElementById('countdown');
  if (!countdown) return;

  const distance = eventDate - Date.now();
  if (distance <= 0) {
    countdown.innerHTML = '<h3>¡Llegó el gran día!</h3>';
    return;
  }

  setFlipValue('days', Math.floor(distance / 86400000));
  setFlipValue('hours', Math.floor((distance / 3600000) % 24));
  setFlipValue('minutes', Math.floor((distance / 60000) % 60));
  setFlipValue('seconds', Math.floor((distance / 1000) % 60));
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll('main section').forEach((section, sectionIndex) => {
  const subtitle = section.querySelector('.section-subtitle');
  const title = section.querySelector('.section-title');
  const visual = section.querySelector('.countdown, .quote-card, .gallery-showcase, .location-card, .dress-card, .gift-card, .rsvp-text');

  subtitle?.classList.add('motion-item', sectionIndex % 2 ? 'motion-right' : 'motion-left');
  title?.classList.add('motion-item', sectionIndex % 2 ? 'motion-left' : 'motion-right');
  visual?.classList.add('motion-item', 'motion-up');
});

const motionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('motion-visible');
      motionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.motion-item').forEach((element) => motionObserver.observe(element));

const giftButton = document.getElementById('giftButton');
const bankModal = document.getElementById('bankModal');
const dressModal = document.getElementById('dressModal');
const dressExampleButton = document.getElementById('dressExampleButton');
const copyAliasButton = document.getElementById('copyAliasButton');
const copyStatus = document.getElementById('copyStatus');

giftButton?.addEventListener('click', () => bankModal?.showModal());
dressExampleButton?.addEventListener('click', () => dressModal?.showModal());

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog')?.close());
});

document.querySelectorAll('.invitation-modal').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    const bounds = modal.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) modal.close();
  });
});

copyAliasButton?.addEventListener('click', async () => {
  const alias = document.getElementById('aliasValue')?.textContent.trim() || '';
  try {
    await navigator.clipboard.writeText(alias);
  } catch {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = alias;
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand('copy');
    temporaryInput.remove();
  }

  copyStatus.textContent = '¡Alias copiado!';
  copyAliasButton.textContent = 'Copiado ✓';
  window.setTimeout(() => {
    copyStatus.textContent = '';
    copyAliasButton.textContent = 'Copiar alias';
  }, 2200);
});

const gallery = document.getElementById('galleryShowcase');
if (gallery) {
  const cards = [...gallery.querySelectorAll('.gallery-card')];
  const dotsContainer = gallery.querySelector('.gallery-dots');
  let current = 0;
  let startX = 0;
  let autoplay;

  const circularDistance = (index) => {
    let distance = index - current;
    if (distance > cards.length / 2) distance -= cards.length;
    if (distance < -cards.length / 2) distance += cards.length;
    return distance;
  };

  cards.forEach((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `Mostrar elemento ${index + 1} de la galería`);
    dot.addEventListener('click', () => {
      current = index;
      renderGallery();
      restartGalleryAutoplay();
    });
    dotsContainer?.appendChild(dot);
  });

  const dots = [...gallery.querySelectorAll('.gallery-dot')];

 function renderGallery() {
  cards.forEach((card, index) => {
    const distance = circularDistance(index);
    const video = card.querySelector('video');

    card.classList.remove(
      'is-active',
      'is-prev',
      'is-next',
      'is-far-prev',
      'is-far-next'
    );

    if (distance === 0) {
      card.classList.add('is-active');
    } else if (distance === -1) {
      card.classList.add('is-prev');
    } else if (distance === 1) {
      card.classList.add('is-next');
    } else if (distance < 0) {
      card.classList.add('is-far-prev');
    } else {
      card.classList.add('is-far-next');
    }

    card.setAttribute('aria-hidden', distance === 0 ? 'false' : 'true');

    if (video) {
      if (distance === 0) {
        window.clearInterval(autoplay);

        video.muted = true;
        video.playsInline = true;
        video.currentTime = 0;

        video.play().catch(() => {
          console.log('El navegador bloqueó la reproducción automática.');
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index === current);
  });
}

  function moveGallery(direction) {
    current = (current + direction + cards.length) % cards.length;
    renderGallery();
  }

  function restartGalleryAutoplay() {
    window.clearInterval(autoplay);
    const activeVideo = cards[current]?.querySelector('video');
    if (activeVideo && !activeVideo.paused) return;
    autoplay = window.setInterval(() => moveGallery(1), 4200);
  }

  gallery.querySelector('.gallery-prev')?.addEventListener('click', () => { moveGallery(-1); restartGalleryAutoplay(); });
  gallery.querySelector('.gallery-next')?.addEventListener('click', () => { moveGallery(1); restartGalleryAutoplay(); });
  gallery.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  gallery.addEventListener('pointerup', (event) => {
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 42) {
      moveGallery(distance < 0 ? 1 : -1);
      restartGalleryAutoplay();
    }
  });
  gallery.addEventListener('mouseenter', () => window.clearInterval(autoplay));
  gallery.addEventListener('mouseleave', restartGalleryAutoplay);
 gallery.querySelectorAll('video').forEach((video) => {
  video.muted = true;
  video.playsInline = true;

  video.addEventListener('play', () => {
    window.clearInterval(autoplay);
  });

  video.addEventListener('pause', () => {
    const videoCard = video.closest('.gallery-card');

    if (!videoCard?.classList.contains('is-active')) {
      restartGalleryAutoplay();
    }
  });

  video.addEventListener('ended', () => {
    moveGallery(1);
    restartGalleryAutoplay();
  });
});

  renderGallery();
  restartGalleryAutoplay();
}

// Colocá el mismo número de WhatsApp (código de país + área + número, solo dígitos) para ambos enlaces.
// Ejemplo de formato: 549381XXXXXXXX. Pendiente de confirmación.
const numeroWhatsApp = '5493816640146'; // +54 9 para WhatsApp móvil de Argentina
const whatsappDestinations = [
  ['songWhatsApp', '¡Hola! Para los XV de Vale me gustaría recomendar esta canción: ', '.song-note'],
  ['rsvpWhatsApp', '¡Hola! Quiero confirmar mi asistencia a los XV de Vale. Mi nombre es: ', '.whatsapp-notice']
];
whatsappDestinations.forEach(([id, message, noteSelector]) => {
  const a = document.getElementById(id);
  if (!a) return;
  const numero = numeroWhatsApp.replace(/\D/g, '');
  if (numero) {
    a.href = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.removeAttribute('aria-disabled');
    const note = a.parentElement.querySelector(noteSelector);
    if (note) note.hidden = true;
  } else {
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
    a.addEventListener('click', (event) => event.preventDefault());
  }
});

const butterflyAssets = Array.from({ length: 6 }, (_, i) => `butterfly-pink-${i+1}.png`);
const decoratedAreas = document.querySelectorAll('main .hero, main section, main footer');

decoratedAreas.forEach((area, areaIndex) => {
  const amount = area.matches('.hero') ? 9 : area.matches('.footer') ? 4 : 6;

  for (let index = 0; index < amount; index += 1) {
    const wrapper = document.createElement('span');
    const butterfly = document.createElement('img');
    const seed = areaIndex * 37 + index * 19;
    const size = 58 + (seed % 7) * 14;
    const left = 2 + ((seed * 13) % 91);
    const top = 4 + ((seed * 17) % 84);
    const direction = (areaIndex + index) % 2 ? 1 : -1;

    wrapper.className = `flying-butterfly${index % 3 === 0 ? ' mirrored' : ''}${index % 7 === 0 ? ' soft' : ''}${index >= 4 ? ' mobile-light' : ''}`;
    wrapper.style.setProperty('--fly-left', `${left}%`);
    wrapper.style.setProperty('--fly-top', `${top}%`);
    wrapper.style.setProperty('--fly-size', `${size}px`);
    wrapper.style.setProperty('--fly-opacity', `${0.43 + (seed % 4) * 0.06}`);
    wrapper.style.setProperty('--fly-duration', `${17 + (seed % 13)}s`);
    wrapper.style.setProperty('--fly-delay', `${-(seed % 24)}s`);
    wrapper.style.setProperty('--flutter-duration', `${0.9 + (seed % 7) * 0.11}s`);
    wrapper.style.setProperty('--flutter-delay', `${-(seed % 5) * 0.16}s`);
    wrapper.style.setProperty('--start-rotation', `${direction * (4 + seed % 7)}deg`);
    wrapper.style.setProperty('--end-rotation', `${-direction * (3 + seed % 8)}deg`);
    wrapper.style.setProperty('--drift-x1', `${direction * (35 + seed % 55)}px`);
    wrapper.style.setProperty('--drift-y1', `${-(22 + seed % 35)}px`);
    wrapper.style.setProperty('--drift-x2', `${-direction * (18 + seed % 44)}px`);
    wrapper.style.setProperty('--drift-y2', `${-(48 + seed % 52)}px`);
    wrapper.style.setProperty('--drift-x3', `${direction * (48 + seed % 68)}px`);
    wrapper.style.setProperty('--drift-y3', `${-(20 + seed % 45)}px`);
    wrapper.style.setProperty('--drift-x4', `${direction * (12 + seed % 62)}px`);
    wrapper.style.setProperty('--drift-y4', `${-(72 + seed % 65)}px`);

    butterfly.src = `img/butterflies-bebe-originales/${butterflyAssets[(seed + index) % butterflyAssets.length]}`;
    butterfly.alt = '';
    butterfly.setAttribute('aria-hidden', 'true');
    butterfly.decoding = 'async';
    wrapper.appendChild(butterfly);
    area.appendChild(wrapper);
  }
});

// Restauración de las mariposas ORIGINALES y sus movimientos para la portada.
// Solo cambia su matiz, sin reemplazar las seis siluetas originales.
const portadaDecor = document.querySelector('#intro .cover-decor');
if (portadaDecor) {
  [
    { x:'10%', y:'17%', s:90, d:21, delay:-3, b:0 },
    { x:'83%', y:'16%', s:70, d:25, delay:-11, b:3 },
    { x:'12%', y:'66%', s:96, d:29, delay:-7, b:4 },
    { x:'80%', y:'66%', s:86, d:24, delay:-16, b:2 },
    { x:'43%', y:'7%', s:46, d:22, delay:-13, b:1 },
    { x:'68%', y:'83%', s:58, d:27, delay:-6, b:5 }
  ].forEach((c, i) => {
    const wrap = document.createElement('span');
    wrap.className = `cover-butterfly${i%2 ? ' mirrored' : ''}`;
    wrap.style.cssText = `--cb-x:${c.x};--cb-y:${c.y};--cb-s:${c.s}px;--cb-d:${c.d}s;--cb-delay:${c.delay}s;`;
    const img = document.createElement('img');
    img.src = `img/butterflies-bebe-originales/butterfly-pink-${c.b+1}.png`;
    img.alt='';
    wrap.appendChild(img);
    portadaDecor.appendChild(wrap);
  });
}
// Estrellitas animadas para que los destellos sean visibles, pero no tapen botones.
function addTwinkles(parent, count, seedShift = 0) {
  if (!parent) return;
  for (let i=0;i<count;i++) {
    const s=document.createElement('i');
    s.className='vale-star';
    const x=(i*47+19+seedShift*13)%97;
    const y=(i*61+8+seedShift*7)%94;
    const size= (i%5===0? 15 : (i%3===0? 11 : 7));
    s.style.cssText=`--st-x:${x}%;--st-y:${y}%;--st-size:${size}px;--st-delay:${-((i*7+seedShift)%17)}s;--st-speed:${2.1+(i%5)*.8}s;`;
    parent.appendChild(s);
  }
}
addTwinkles(portadaDecor,26);
addTwinkles(document.querySelector('#mainContent .site-sparkles'),36,9);
