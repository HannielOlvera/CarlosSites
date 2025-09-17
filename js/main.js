/*
  js/main.js — "Esteroides" para Carlitos
  - Requisitos: incluir <script defer src="js/main.js"></script> en tu HTML
  - Librerías opcionales (mejor que estén cargadas con defer antes o con CDN): THREE, GSAP (gsap & ScrollTrigger)
  - Estructura HTML esperada: #three-canvas o #particles, .hero-figure, .nav-toggle, #nav-menu, .grid-item img, .stat-number, #contact-form, #a11y-live
*/

(function () {
  'use strict';

  /* -------------------------- Helpers -------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function announce(a11yId, message) {
    try {
      const region = document.getElementById(a11yId);
      if (region) region.textContent = message;
    } catch (e) { /* silent */ }
  }

  function formatNumber(n) {
    return new Intl.NumberFormat().format(Math.round(n));
  }

  /* -------------------------- NAV TOGGLE -------------------------- */
  function initNavToggle() {
    const btn = $('.nav-toggle');
    const menu = $('#nav-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('nav-open');
      document.documentElement.classList.toggle('no-scroll', !isOpen);
    });

    // close on link click (mobile)
    menu.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'A') {
        menu.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('no-scroll');
      }
    });

    // close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('nav-open')) {
        menu.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('no-scroll');
      }
    });
  }

  /* -------------------------- TOASTS (accessible) -------------------------- */
  function createToast(msg, type = 'ok', timeout = 3000) {
    const t = document.createElement('div');
    t.className = `mini-toast ${type}`;
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.textContent = msg;
    document.body.appendChild(t);
    // announce for screen readers via live region if available
    announce('a11y-live', msg);

    // show + auto remove
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 320);
    }, timeout);
  }

  /* -------------------------- LIGHTBOX -------------------------- */
  function initLightbox() {
    const items = Array.from(document.querySelectorAll('.grid-item img'));
    if (!items.length) return;

    // build modal
    const modal = document.createElement('div');
    modal.className = 'lb-modal';
    modal.innerHTML = `
      <div class="lb-inner" role="dialog" aria-modal="true" aria-label="Vista previa de imagen">
        <button class="lb-close" aria-label="Cerrar">✕</button>
        <img class="lb-img" alt="" />
        <div class="lb-nav">
          <button class="lb-prev" aria-label="Anterior">‹</button>
          <button class="lb-next" aria-label="Siguiente">›</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const lbImg = modal.querySelector('.lb-img');
    const closeBtn = modal.querySelector('.lb-close');
    const prevBtn = modal.querySelector('.lb-prev');
    const nextBtn = modal.querySelector('.lb-next');
    let idx = 0;

    function show() {
      const src = items[idx].getAttribute('src');
      lbImg.src = src;
      lbImg.alt = items[idx].alt || '';
    }
    function open(i) {
      idx = i;
      show();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    function prev() {
      idx = (idx - 1 + items.length) % items.length;
      show();
    }
    function next() {
      idx = (idx + 1) % items.length;
      show();
    }

    items.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(i); });
      img.setAttribute('tabindex', '0');
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  /* -------------------------- STATS COUNTER -------------------------- */
  function initStatsCounter() {
    const stats = $$('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
        let current = 0;
        const steps = Math.min(80, Math.max(20, Math.floor(target / 3)));
        const inc = target / steps;
        const id = setInterval(() => {
          current += inc;
          if (current >= target) {
            clearInterval(id);
            el.textContent = formatNumber(target);
          } else {
            el.textContent = formatNumber(Math.floor(current));
          }
        }, 18);
        observer.unobserve(el);
      });
    }, { threshold: 0.6 });

    stats.forEach(s => observer.observe(s));
  }

  /* -------------------------- CONTACT FORM -------------------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    // add honeypot field if not present
    if (!form.querySelector('[name="hp_email"]')) {
      const hp = document.createElement('input');
      hp.type = 'email';
      hp.name = 'hp_email';
      hp.tabIndex = -1;
      hp.style.position = 'absolute';
      hp.style.left = '-9999px';
      form.appendChild(hp);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').trim();
      const email = (formData.get('email') || '').trim();
      const message = (formData.get('message') || '').trim();
      const honeypot = (formData.get('hp_email') || '').trim();

      if (honeypot) { // likely bot
        createToast('Error: spam detectado', 'err');
        return;
      }
      if (!name || !email || !message) { createToast('Por favor completa todos los campos', 'err'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { createToast('Correo inválido', 'err'); return; }

      const submitBtn = form.querySelector('[type="submit"]');
      const original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      announce('a11y-live', 'Enviando mensaje...');

      try {
        // Replace this with your real endpoint
        // const resp = await fetch('/api/contact', { method: 'POST', body: formData });
        // if (!resp.ok) throw new Error('Network response not ok');

        // simulated send
        await new Promise(r => setTimeout(r, 900));

        form.reset();
        createToast('Mensaje enviado. Gracias — te contesto pronto', 'ok');
        announce('a11y-live', 'Mensaje enviado correctamente');
      } catch (err) {
        createToast('Error al enviar, intenta de nuevo', 'err');
        announce('a11y-live', 'Error al enviar el mensaje');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    });
  }

  /* -------------------------- PARTICLES (canvas fallback) -------------------------- */
  function initParticlesCanvas() {
    const canvas = $('#particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let DPR = Math.max(1, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    let particles = [];
    let raf = null;

    function resize() {
      DPR = Math.max(1, window.devicePixelRatio || 1);
      w = Math.max(320, canvas.clientWidth || canvas.offsetWidth);
      h = Math.max(200, canvas.clientHeight || canvas.offsetHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = isMobile() ? Math.floor((w * h) / 14000) : Math.floor((w * h) / 8000);
      particles = new Array(count).fill(0).map(createParticle);
    }

    function createParticle() {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.6,
        vy: - (0.2 + Math.random() * 1.0),
        r: 0.6 + Math.random() * 3,
        life: 40 + Math.random() * 200,
        col: Math.random() > 0.5 ? 'rgba(75,227,255,0.12)' : 'rgba(255,45,149,0.12)'
      };
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let p of particles) {
        p.x += p.vx; p.y += p.vy; p.life -= 1;
        if (p.life < 0 || p.y < -20 || p.x < -80 || p.x > w + 80) Object.assign(p, createParticle());
        ctx.beginPath();
        ctx.fillStyle = p.col;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', () => { clearTimeout(window.__part_resize); window.__part_resize = setTimeout(resize, 120); });
    tick();

    // stop when page not visible to save battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });
  }

  /* -------------------------- THREE.JS HERO (lazy init + fallback) -------------------------- */
  function initThreeHero() {
    const canvas = $('#three-canvas');
    if (!canvas) return;

    // If WebGL not supported or mobile (optionally reduce 3D)
    const isWebGLAvailable = (function () {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })();

    if (!isWebGLAvailable) {
      // Fallback: show particles canvas if present, otherwise simple CSS background
      initParticlesCanvas();
      return;
    }

    // Lazy load heavy resources only when hero is visible
    let initialized = false;
    const hero = $('.hero-figure') || $('#inicio');
    if (!hero) { // init immediately if hero not found
      doInit();
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting && !initialized) {
          doInit();
          initialized = true;
          io.disconnect();
        }
      });
    }, { rootMargin: '200px 0px' });

    io.observe(hero);

    function doInit() {
      // local vars
      let renderer, scene, camera, mesh, particles, controls;
      const DPR = Math.max(1, window.devicePixelRatio || 1);

      // small performance adjustments on mobile
      const reduced = isMobile() || prefersReducedMotion();

      // setup renderer
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !reduced, alpha: true });
      renderer.setPixelRatio(Math.min(DPR, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(0x000000, 0); // transparent

      // scene + camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, Math.max(1, canvas.clientWidth / canvas.clientHeight), 0.1, 1000);
      camera.position.set(0, 0, 45);

      // lights
      scene.add(new THREE.HemisphereLight(0xffffff, 0x111122, 0.9));
      const rim = new THREE.DirectionalLight(0xff2d95, 0.6);
      rim.position.set(10, 10, 10);
      scene.add(rim);

      // geometry: torus-knot (abstract)
      const geo = new THREE.TorusKnotGeometry(8, 2.6, 128, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x06080b,
        metalness: 0.5,
        roughness: 0.35,
        emissive: 0x062034,
        emissiveIntensity: 0.05
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = 0.6; mesh.rotation.y = -0.4; mesh.scale.set(0.85, 0.85, 0.85);
      scene.add(mesh);

      // particles — points
      const COUNT = reduced ? 250 : 600;
      const pGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 120;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pMat = new THREE.PointsMaterial({ size: reduced ? 0.6 : 0.9, transparent: true, opacity: 0.12, color: 0x4be3ff });
      particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      // optional OrbitControls for debug (disabled)
      if (window.THREE && window.THREE.OrbitControls) {
        try {
          controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.enabled = false;
          controls.enableDamping = true;
        } catch (e) { /* ignore */ }
      }

      function onResize() {
        const w = Math.max(240, canvas.clientWidth || canvas.offsetWidth);
        const h = Math.max(200, canvas.clientHeight || canvas.offsetHeight);
        renderer.setSize(w, h, true);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      onResize();
      window.addEventListener('resize', () => { clearTimeout(window.__three_r); window.__three_r = setTimeout(onResize, 120); });

      // pointer-driven motion
      let px = 0, py = 0, tx = 0, ty = 0;
      const figure = document.querySelector('.hero-figure');
      if (figure) {
        function onPointer(e) {
          const r = figure.getBoundingClientRect();
          const cx = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
          const cy = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;
          px = (cx / r.width - 0.5);
          py = (cy / r.height - 0.5);
        }
        figure.addEventListener('pointermove', onPointer, { passive: true });
        figure.addEventListener('pointerleave', () => { px = 0; py = 0; });
      }

      // pause when not visible
      let running = true;
      document.addEventListener('visibilitychange', () => { running = !document.hidden; });

      // animation loop
      const clock = new THREE.Clock();
      (function animate() {
        if (!running) {
          requestAnimationFrame(animate);
          return;
        }
        const t = clock.getElapsedTime();
        tx += (px - tx) * 0.08; ty += (py - ty) * 0.08;
        if (mesh) {
          mesh.rotation.x += 0.002 + tx * 0.01;
          mesh.rotation.y += 0.003 + ty * 0.01;
          mesh.position.x = tx * 6;
          mesh.position.y = -ty * 4;
        }
        if (particles) particles.rotation.y = t * 0.02;
        if (renderer && camera) renderer.render(scene, camera);
        requestAnimationFrame(animate);
      })();

      // GSAP intro if available
      if (window.gsap && !prefersReducedMotion()) {
        try {
          gsap.from('.hero-title', { duration: 1, y: 30, opacity: 0, ease: 'power3.out' });
          gsap.from('.hero-sub', { duration: 1, y: 16, opacity: 0, delay: 0.12 });
          const sweep = document.querySelector('.light-sweep');
          if (sweep) gsap.fromTo(sweep, { x: -120, opacity: 0 }, { x: 140, opacity: 0.14, duration: 2.6, repeat: -1, ease: 'sine.inOut', yoyo: true });
        } catch (e) { /* ignore */ }
      }
    } // doInit
  } // initThreeHero

  /* -------------------------- IMAGE PRELOADER (light) -------------------------- */
  function preloadImages(selector = 'img[loading="lazy"]') {
    const imgs = Array.from(document.querySelectorAll(selector));
    if (!imgs.length) return;
    imgs.forEach(img => {
      if (!img.complete) {
        const src = img.dataset.src || img.src;
        const i = new Image();
        i.src = src;
      }
    });
  }

  /* -------------------------- INIT ALL -------------------------- */
  function ready() {
    initNavToggle();
    initLightbox();
    initStatsCounter();
    initContactForm();

    // Initialize three.js hero lazily (it will fallback to particles if WebGL missing)
    try { initThreeHero(); } catch (e) { console.warn('Three init failed:', e); initParticlesCanvas(); }

    // If a #particles canvas exists and three is not used, init particles
    if (!$('#three-canvas') && $('#particles')) initParticlesCanvas();

    // preload small images
    preloadImages();

    // Accessibility: announce page ready
    announce('a11y-live', 'Página cargada');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  /* -------------------------- Expose small API for debugging (optional) -------------------------- */
  window.__Carlitos = {
    toast: createToast,
    announce,
    initThreeHero,
    initParticlesCanvas
  };

})();
