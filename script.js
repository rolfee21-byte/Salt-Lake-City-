/* ===== SHARED JAVASCRIPT ===== */

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('back-top')?.classList.toggle('visible', window.scrollY > 400);
  });
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

// Back to top
document.getElementById('back-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Counter animation
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();
  const isDecimal = String(target).includes('.');
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// Live SLC time
function updateTime() {
  const el = document.getElementById('slc-time');
  if (!el) return;
  const now = new Date();
  const slcTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
  const h = slcTime.getHours().toString().padStart(2, '0');
  const m = slcTime.getMinutes().toString().padStart(2, '0');
  el.textContent = `${h}:${m} MT`;
}
updateTime();
setInterval(updateTime, 60000);

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('[data-tabs]') || btn.closest('.tabs-container');
    if (!group) return;
    const target = btn.dataset.tab;
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    group.querySelector(`[data-panel="${target}"]`)?.classList.add('active');
  });
});

// Accordion
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.accordion-item');
    const body = item.querySelector('.accordion-body');
    const inner = item.querySelector('.accordion-body-inner');
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.accordion-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.accordion-body').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = inner.scrollHeight + 'px';
    }
  });
});

// Modal
let activeModal = null;
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  activeModal = overlay;
}
function closeModal(id) {
  const overlay = document.getElementById(id || '');
  const target = overlay || activeModal;
  if (!target) return;
  target.classList.remove('open');
  document.body.style.overflow = '';
  activeModal = null;
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal());
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
window.openModal = openModal;
window.closeModal = closeModal;

// Filter cards
function initFilter(containerSelector, filterSelector, cardSelector, dataAttr = 'category') {
  const container = document.querySelector(containerSelector);
  const filterBtns = document.querySelectorAll(filterSelector);
  if (!container || !filterBtns.length) return;

  const searchInput = document.querySelector('.search-input');

  function applyFilters() {
    const activeFilter = document.querySelector(filterSelector + '.active')?.dataset.filter || 'all';
    const searchTerm = searchInput?.value.toLowerCase() || '';
    let visibleCount = 0;

    container.querySelectorAll(cardSelector).forEach(card => {
      const cat = card.dataset[dataAttr] || '';
      const text = card.textContent.toLowerCase();
      const matchesCat = activeFilter === 'all' || cat.includes(activeFilter);
      const matchesSearch = !searchTerm || text.includes(searchTerm);
      const visible = matchesCat && matchesSearch;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    const noResults = container.querySelector('.no-results') || document.querySelector('.no-results-msg');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
}

// Toast notifications
function showToast(message, type = 'info') {
  const container = document.querySelector('.toast-container') || (() => {
    const c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
window.showToast = showToast;

// Favorites (localStorage)
const FAV_KEY = 'slc_favorites';
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function toggleFavorite(id, name) {
  let favs = getFavorites();
  const exists = favs.includes(id);
  if (exists) {
    favs = favs.filter(f => f !== id);
    showToast(`Removed "${name}" from favorites`);
  } else {
    favs.push(id);
    showToast(`Added "${name}" to favorites! ❤️`, 'success');
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('favorited', !exists);
    btn.title = !exists ? 'Remove from favorites' : 'Add to favorites';
  });
}
window.toggleFavorite = toggleFavorite;
window.getFavorites = getFavorites;

// Initialize fav buttons
function initFavButtons() {
  const favs = getFavorites();
  document.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.classList.toggle('favorited', favs.includes(btn.dataset.favId));
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initFavButtons();
  initFilter('.cards-grid', '.chip[data-filter]', '.filterable-card');
});

// Highlight active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});
