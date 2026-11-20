/**
 * NATBIO e-ENERGY — Interacciones
 * 1. Navbar con scroll + barra de progreso + botón volver arriba
 * 2. Menú móvil
 * 3. Animaciones de entrada (IntersectionObserver)
 * 4. Contadores animados
 * 5. Enlace activo según la sección visible
 * 6. Carrusel de testimonios (auto, flechas, puntos, swipe, teclado)
 */
document.addEventListener('DOMContentLoaded', () => {
  window.natbioListo = true;
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Scroll: navbar, progreso, volver arriba ---------- */
  const navbar = document.getElementById('navbar');
  const barra = document.querySelector('.barra-progreso');
  const btnArriba = document.querySelector('.volver-arriba');
  let ticking = false;

  const alHacerScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle('con-scroll', y > 40);
    barra.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    btnArriba.classList.toggle('visible', y > window.innerHeight * 0.8);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(alHacerScroll); ticking = true; }
  }, { passive: true });
  alHacerScroll();

  btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 2. Menú móvil ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-principal');

  const cerrarMenu = () => {
    navbar.classList.remove('menu-abierto');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };
  toggle.addEventListener('click', () => {
    const abierto = navbar.classList.toggle('menu-abierto');
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

  /* ---------- 3. Animaciones de entrada ---------- */
  const animables = document.querySelectorAll('.revelar');
  animables.forEach((el) => el.style.setProperty('--d', el.dataset.delay || 0));

  if ('IntersectionObserver' in window && !reducirMovimiento) {
    const obsRevelar = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('es-visible');
          obs.unobserve(entrada.target); // anima una sola vez: más limpio y profesional
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    animables.forEach((el) => obsRevelar.observe(el));
  } else {
    animables.forEach((el) => el.classList.add('es-visible'));
  }

  /* ---------- 4. Contadores ---------- */
  const contadores = document.querySelectorAll('[data-contador]');
  const animarContador = (el) => {
    const meta = parseInt(el.dataset.contador, 10);
    const sufijo = el.dataset.sufijo || '';
    if (reducirMovimiento) { el.textContent = meta + sufijo; return; }
    const duracion = 1600;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suavizado = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(meta * suavizado) + sufijo;
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  if ('IntersectionObserver' in window) {
    const obsContador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { animarContador(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    contadores.forEach((c) => obsContador.observe(c));
  } else {
    contadores.forEach(animarContador);
  }

  /* ---------- 5. Enlace activo en navbar ---------- */
  const enlaces = [...menu.querySelectorAll('a[href^="#"]')];
  const secciones = enlaces
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const obsActivo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        enlaces.forEach((a) => a.classList.toggle('activo', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach((s) => obsActivo.observe(s));
  }

  /* ---------- 6. Carrusel de testimonios ---------- */
  const carrusel = document.querySelector('.carrusel');
  if (carrusel) {
    const pista = carrusel.querySelector('.carrusel-pista');
    const tarjetas = [...pista.children];
    const contPuntos = carrusel.querySelector('.carrusel-puntos');
    const btnPrev = carrusel.querySelector('[data-dir="-1"]');
    const btnNext = carrusel.querySelector('[data-dir="1"]');
    let indice = 0;
    let temporizador = null;

    const porVista = () => {
      const w = window.innerWidth;
      return w <= 900 ? 1 : w <= 1024 ? 2 : 3;
    };
    const totalPaginas = () => Math.max(tarjetas.length - porVista() + 1, 1);

    const crearPuntos = () => {
      contPuntos.innerHTML = '';
      for (let i = 0; i < totalPaginas(); i++) {
        const p = document.createElement('button');
        p.type = 'button';
        p.setAttribute('role', 'tab');
        p.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        p.addEventListener('click', () => { irA(i); reiniciarAuto(); });
        contPuntos.appendChild(p);
      }
    };

    const irA = (i) => {
      const total = totalPaginas();
      indice = (i + total) % total;
      const gap = parseFloat(getComputedStyle(pista).gap) || 0;
      const ancho = tarjetas[0].getBoundingClientRect().width + gap;
      pista.style.transform = `translateX(${-indice * ancho}px)`;
      [...contPuntos.children].forEach((p, n) => p.setAttribute('aria-selected', String(n === indice)));
      tarjetas.forEach((t, n) => {
        const visible = n >= indice && n < indice + porVista();
        t.setAttribute('aria-hidden', String(!visible));
      });
    };

    const iniciarAuto = () => {
      if (reducirMovimiento) return;
      detenerAuto();
      temporizador = setInterval(() => irA(indice + 1), 5500);
    };
    const detenerAuto = () => { clearInterval(temporizador); temporizador = null; };
    const reiniciarAuto = () => { detenerAuto(); iniciarAuto(); };

    btnPrev.addEventListener('click', () => { irA(indice - 1); reiniciarAuto(); });
    btnNext.addEventListener('click', () => { irA(indice + 1); reiniciarAuto(); });

    carrusel.addEventListener('mouseenter', detenerAuto);
    carrusel.addEventListener('mouseleave', iniciarAuto);
    carrusel.addEventListener('focusin', detenerAuto);
    carrusel.addEventListener('focusout', iniciarAuto);
    carrusel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { irA(indice - 1); reiniciarAuto(); }
      if (e.key === 'ArrowRight') { irA(indice + 1); reiniciarAuto(); }
    });

    // Swipe táctil
    let xInicio = null;
    pista.addEventListener('touchstart', (e) => { xInicio = e.touches[0].clientX; detenerAuto(); }, { passive: true });
    pista.addEventListener('touchend', (e) => {
      if (xInicio === null) return;
      const dx = e.changedTouches[0].clientX - xInicio;
      if (Math.abs(dx) > 40) irA(indice + (dx < 0 ? 1 : -1));
      xInicio = null;
      iniciarAuto();
    });

    // Recalcular al cambiar tamaño
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { crearPuntos(); irA(Math.min(indice, totalPaginas() - 1)); }, 150);
    });

    crearPuntos();
    irA(0);
    iniciarAuto();
  }

  /* ---------- Año actual en el footer ---------- */
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
});
