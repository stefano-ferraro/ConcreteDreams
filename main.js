/* ═══════════════════════════════════════════
   Concrete Dreams — Alternative Redesign
   main.js
═══════════════════════════════════════════ */

'use strict';

/* ── Ticker: duplicate for seamless loop ── */
(function initTicker() {
  const el = document.getElementById('tickerTrack');
  if (el) el.innerHTML += el.innerHTML;
})();


/* ══════════════════════════════════════════
   IMAGE LOADING
   Reveals real photos; keeps text placeholders when files are missing.
══════════════════════════════════════════ */
function revealImage(img, onReveal) {
  if (!img) return;
  const done = () => { img.style.display = 'block'; if (onReveal) onReveal(); };
  const fail = () => { img.style.display = 'none'; };
  if (img.complete) {
    img.naturalWidth > 0 ? done() : fail();
  } else {
    img.addEventListener('load',  done, { once: true });
    img.addEventListener('error', fail, { once: true });
  }
}

function initImages() {
  // Hero background
  revealImage(document.querySelector('.hero__bg'));

  // Product photos — hide companion placeholder on success
  document.querySelectorAll('.product__photo').forEach(img => {
    revealImage(img, () => {
      const ph = img.parentElement.querySelector('.product__ph');
      if (ph) ph.style.display = 'none';
    });
  });

  // Lookbook photos — hide companion placeholder on success
  document.querySelectorAll('.lookbook__img').forEach(img => {
    revealImage(img, () => {
      const ph = img.nextElementSibling;
      if (ph?.classList.contains('lookbook__ph')) ph.style.display = 'none';
    });
  });
}


/* ══════════════════════════════════════════
   CART
══════════════════════════════════════════ */
const cart = {
  items: [],

  add(name, price, size, image) {
  const key = name + '|' + (size || '');
  const existing = this.items.find(i => i.key === key);

  if (existing) {
    existing.qty += 1;
    if (!existing.image && image) existing.image = image;
  } else {
    this.items.push({
      key,
      name,
      price: parseFloat(price),
      size: size || null,
      qty: 1,
      image: image || ''
    });
  }

  this.render();
},

  remove(key) {
    const idx = this.items.findIndex(i => i.key === key);
    if (idx === -1) return;
    if (this.items[idx].qty > 1) {
      this.items[idx].qty -= 1;
    } else {
      this.items.splice(idx, 1);
    }
    this.render();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  render() {
    // Badge count
    const countEl = document.getElementById('cartCount');
    if (countEl) {
      const total = this.items.reduce((s, i) => s + i.qty, 0);
      countEl.textContent = total;
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 380);
    }

    const bodyEl  = document.getElementById('cartBody');
    const footEl  = document.getElementById('cartFoot');
    const totalEl = document.getElementById('cartTotal');
    if (!bodyEl) return;

    if (!this.items.length) {
      bodyEl.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.</p>';
      if (footEl) footEl.hidden = true;
      return;
    }

    bodyEl.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item__thumb">
  ${
    item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<span>${item.name.substring(0, 12)}</span>`
  }
</div>
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__meta">${item.size ? `Size: ${item.size} · ` : ''}Qty: ${item.qty}</p>
        </div>
        <div class="cart-item__right">
          <p class="cart-item__price">€${(item.price * item.qty).toFixed(2)}</p>
          <button
            class="cart-item__remove"
            data-key="${item.key}"
            aria-label="Remove ${item.name} from cart"
          >✕</button>
        </div>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = `€${this.total().toFixed(2)}`;
    if (footEl)  footEl.hidden = false;
  }
};


/* ══════════════════════════════════════════
   CART DRAWER
══════════════════════════════════════════ */
const cartDrawer = {
  el:     null,
  isOpen: false,

  init() {
    this.el = document.getElementById('cartDrawer');

    document.getElementById('cartBtn')?.addEventListener('click',     () => this.toggle());
    document.getElementById('cartClose')?.addEventListener('click',   () => this.close());
    document.getElementById('cartBackdrop')?.addEventListener('click',() => this.close());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Remove-item delegation — lives on the static body container
    document.getElementById('cartBody')?.addEventListener('click', e => {
      const btn = e.target.closest('.cart-item__remove');
      if (btn) cart.remove(btn.dataset.key);
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

  toggle() { this.isOpen ? this.close() : this.open(); }
};


/* ══════════════════════════════════════════
   ADD TO CART BUTTONS
══════════════════════════════════════════ */
function initAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.closest('[data-product]') || btn.closest('.product');
      const size = product?.querySelector('.sz.selected')?.dataset.size ?? null;

      const image = product?.querySelector('.product__photo')?.getAttribute('src') || '';

      cart.add(btn.dataset.name, btn.dataset.price, size, image);
      cartDrawer.open();

      // Brief confirmation on the button itself
      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    });
  });
}


/* ══════════════════════════════════════════
   SIZE SELECTOR
══════════════════════════════════════════ */
function initSizes() {
  document.querySelectorAll('[data-product]').forEach(product => {
    product.querySelectorAll('.sz:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        product.querySelectorAll('.sz').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });
}


/* ══════════════════════════════════════════
   SMOOTH SCROLL (accounts for fixed nav)
══════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 62;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth'
      });
    });
  });
}


/* ══════════════════════════════════════════
   NAV — orange border brightens on scroll
══════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.style.borderBottomColor = window.scrollY > 60
        ? 'rgba(255, 154, 72, 0.4)'
        : 'rgba(255, 154, 72, 0.18)';
      ticking = false;
    });
  }, { passive: true });
}


/* ══════════════════════════════════════════
   LANGUAGE TOGGLE
══════════════════════════════════════════ */
function initLang() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  const opts = ['EN', 'IT'];
  let i = 0;
  btn.addEventListener('click', () => {
    i = (i + 1) % opts.length;
    btn.textContent = opts[i];
  });
}


/* ══════════════════════════════════════════
   NEWSLETTER FORM
══════════════════════════════════════════ */
function initNewsletter() {
  const form   = document.getElementById('newsletterForm');
  const msgEl  = document.getElementById('newsletterMsg');
  if (!form || !msgEl) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const emailEl = form.querySelector('#newsletterEmail');
    const email   = emailEl.value.trim();
    const valid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      msgEl.textContent = 'Please enter a valid email address.';
      msgEl.className   = 'newsletter__msg newsletter__msg--err';
      emailEl.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Done ✓';
    submitBtn.disabled    = true;
    emailEl.value         = '';
    msgEl.textContent     = 'Welcome to the inner circle.';
    msgEl.className       = 'newsletter__msg newsletter__msg--ok';

    setTimeout(() => {
      submitBtn.textContent = 'Subscribe';
      submitBtn.disabled    = false;
      msgEl.textContent     = '';
      msgEl.className       = 'newsletter__msg';
    }, 5000);
  });
}


/* ══════════════════════════════════════════
   SCROLL REVEAL
   Uses IntersectionObserver to fade + slide elements into view.
══════════════════════════════════════════ */
function initReveal() {
  const targets = [
    ...document.querySelectorAll('.product'),
    ...document.querySelectorAll('.lookbook__cell'),
    document.querySelector('.about__left'),
    document.querySelector('.about__right'),
    document.querySelector('.newsletter__inner'),
  ].filter(Boolean);

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings slightly
    el.style.transitionDelay = `${(i % 3) * 90}ms`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  targets.forEach(el => observer.observe(el));
}


/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  cartDrawer.init();
  initAddToCart();
  initSizes();
  initSmoothScroll();
  initNav();
  initLang();
  initNewsletter();
  initReveal();
  cart.render(); // initialise badge at 0
});
