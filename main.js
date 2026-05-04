/* ─────────────────────────────────────────
   Concrete Dreams — Main Script
───────────────────────────────────────── */

/* ── Ticker: duplicate content for seamless loop ── */
(function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();

/* ── Cart state ── */
const cart = {
  items: [],

  add(name, price, size) {
    const existing = this.items.find(i => i.name === name && i.size === size);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ name, price: parseFloat(price), size, qty: 1 });
    }
    this.render();
    cartDrawer.open();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  render() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    const count = this.items.reduce((s, i) => s + i.qty, 0);
    if (countEl) {
      countEl.textContent = count;
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 300);
    }

    if (!itemsEl) return;
    if (this.items.length === 0) {
      itemsEl.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.</p>';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    itemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item__img">${item.name.substring(0, 10)}</div>
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__meta">${item.size ? `Size: ${item.size}` : ''} × ${item.qty}</p>
        </div>
        <p class="cart-item__price">€${(item.price * item.qty).toFixed(2)}</p>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = `€${this.total().toFixed(2)}`;
    if (footerEl) footerEl.style.display = 'flex';
  }
};

/* ── Cart Drawer ── */
const cartDrawer = {
  el: null,
  isOpen: false,

  init() {
    this.el = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    const closeBtn = document.getElementById('cartClose');
    const cartBtn  = document.querySelector('.nav__cart-btn');

    cartBtn?.addEventListener('click', e => {
      e.preventDefault();
      this.toggle();
    });
    closeBtn?.addEventListener('click', () => this.close());
    backdrop?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  },

  open() {
    if (!this.el) return;
    this.isOpen = true;
    this.el.classList.add('open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.el) return;
    this.isOpen = false;
    this.el.classList.remove('open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
};

/* ── Add to Cart buttons ── */
function initAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const name  = btn.dataset.name;
      const price = btn.dataset.price;

      const selectedSize = card?.querySelector('.size.selected');
      const size = selectedSize?.dataset.size || null;

      const originalText = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => { btn.textContent = originalText; }, 1600);

      cart.add(name, price, size);
    });
  });
}

/* ── Size selector ── */
function initSizeSelector() {
  document.querySelectorAll('.card').forEach(card => {
    card.querySelectorAll('.size:not(:disabled)').forEach(sizeBtn => {
      sizeBtn.addEventListener('click', () => {
        card.querySelectorAll('.size').forEach(s => s.classList.remove('selected'));
        sizeBtn.classList.add('selected');
      });
    });
  });
}

/* ── Smooth scroll with offset for fixed header ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--top-offset')) || 90;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
}

/* ── Nav scroll state ── */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    nav.style.borderBottomColor = window.scrollY > 40
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(255,255,255,0.07)';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Language toggle ── */
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  const langs = ['EN', 'IT'];
  let i = 0;
  btn.addEventListener('click', () => {
    i = (i + 1) % langs.length;
    btn.textContent = langs[i];
  });
}

/* ── Newsletter form ── */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  const msg  = document.getElementById('newsletterMessage');
  if (!form || !msg) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('#newsletterEmail').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.className = 'newsletter__message newsletter__message--error';
      return;
    }
    const submitBtn = form.querySelector('.newsletter__submit');
    submitBtn.textContent = 'Done ✓';
    submitBtn.disabled = true;
    msg.textContent = 'Welcome to the inner circle.';
    msg.className = 'newsletter__message newsletter__message--success';
    form.querySelector('#newsletterEmail').value = '';
    setTimeout(() => {
      submitBtn.textContent = 'Subscribe';
      submitBtn.disabled = false;
      msg.textContent = '';
      msg.className = 'newsletter__message';
    }, 5000);
  });
}

/* ── Intersection Observer: fade-in on scroll ── */
function initReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.visible {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);

  const targets = [
    ...document.querySelectorAll('.card'),
    ...document.querySelectorAll('.about__left'),
    ...document.querySelectorAll('.about__right'),
    ...document.querySelectorAll('.manifesto__text'),
    document.querySelector('.newsletter__inner'),
  ].filter(Boolean);

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ── Image loading: show real photo, hide placeholder when image is present ── */
function initImages() {
  // Product card photos
  document.querySelectorAll('.card__photo').forEach(img => {
    const reveal = () => {
      img.style.display = 'block';
      const visual = img.parentElement.querySelector('.card__visual');
      if (visual) visual.style.display = 'none';
    };
    if (img.complete && img.naturalWidth > 0) {
      reveal();
    } else {
      img.addEventListener('load', reveal);
      // error: keep placeholder, hide broken img
      img.addEventListener('error', () => { img.style.display = 'none'; });
    }
  });

  // Hero photo
  const heroPhoto = document.querySelector('.hero__photo');
  if (heroPhoto) {
    const revealHero = () => {
      heroPhoto.style.display = 'block';
      heroPhoto.closest('.hero')?.classList.add('has-photo');
    };
    if (heroPhoto.complete && heroPhoto.naturalWidth > 0) {
      revealHero();
    } else {
      heroPhoto.addEventListener('load', revealHero);
      heroPhoto.addEventListener('error', () => { heroPhoto.style.display = 'none'; });
    }
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  cartDrawer.init();
  initAddToCart();
  initSizeSelector();
  initSmoothScroll();
  initNavScroll();
  initLangToggle();
  initNewsletter();
  initReveal();
  cart.render();
});
