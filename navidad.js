/**
 * BIOFLEX — Tema navideño (temporal)
 * 1. Nieve ligera en <canvas> (se pausa si la pestaña no está visible)
 * 2. Luces de guirnalda con colores y retrasos aleatorios
 * 3. Cuenta regresiva a Navidad
 */
document.addEventListener('DOMContentLoaded', () => {
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 2. Guirnaldas ---------- */
  const colores = ['#ef4444', '#fbbf24', '#22c55e', '#60a5fa', '#c084fc'];
  document.querySelectorAll('.guirnalda').forEach((g) => {
    const cantidad = Math.max(8, Math.round(g.offsetWidth / 70));
    for (let i = 0; i < cantidad; i++) {
      const foco = document.createElement('span');
      foco.style.setProperty('--c', colores[i % colores.length]);
      foco.style.setProperty('--retraso', `${(Math.random() * 1.6).toFixed(2)}s`);
      g.appendChild(foco);
    }
  });

  /* ---------- 3. Cuenta regresiva ---------- */
  const cuenta = document.querySelector('[data-cuenta-navidad]');
  if (cuenta) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const navidad = new Date(hoy.getFullYear(), 11, 25);
    const dias = Math.round((navidad - hoy) / 86400000);
    if (dias > 0) {
      cuenta.innerHTML = `Faltan <strong>${dias}</strong> ${dias === 1 ? 'día' : 'días'} para Navidad`;
    } else if (dias === 0) {
      cuenta.innerHTML = '<strong>🎄</strong> ¡Hoy es Navidad!';
    } else {
      cuenta.innerHTML = '<strong>✨</strong> ¡Felices fiestas!';
    }
  }


  /* ---------- 4. Luces en los márgenes ---------- */
  ['izq', 'der'].forEach((lado) => {
    const tira = document.createElement('div');
    tira.className = `luces-margen ${lado}`;
    tira.setAttribute('aria-hidden', 'true');
    const cantidad = Math.max(6, Math.round(window.innerHeight / 72));
    for (let i = 0; i < cantidad; i++) {
      const foco = document.createElement('span');
      foco.style.setProperty('--c', colores[(i + (lado === 'der' ? 2 : 0)) % colores.length]);
      foco.style.setProperty('--retraso', `${(Math.random() * 1.8).toFixed(2)}s`);
      tira.appendChild(foco);
    }
    document.body.appendChild(tira);
  });

  /* ---------- 5. Regalitos en cada sección ---------- */
  const regalo = (caja, liston, w) => `
    <svg viewBox="0 0 60 60" width="${w}" height="${w}" aria-hidden="true">
      <rect x="6" y="24" width="48" height="33" rx="3" fill="${caja}"/>
      <rect x="3" y="16" width="54" height="11" rx="3" fill="${caja}"/>
      <rect x="3" y="16" width="54" height="11" rx="3" fill="#fff" opacity=".18"/>
      <rect x="26" y="16" width="8" height="41" fill="${liston}"/>
      <path d="M30 16 C22 2 8 5 14 13 C18 18 26 16 30 16 Z M30 16 C38 2 52 5 46 13 C42 18 34 16 30 16 Z" fill="${liston}"/>
    </svg>`;
  const grupos = [
    [['#dc2626', '#fbbf24', 46], ['#16a34a', '#fff', 32]],
    [['#5b21b6', '#fbbf24', 40], ['#1626b5', '#f472b6', 30], ['#dc2626', '#fff', 24]],
    [['#16a34a', '#dc2626', 44], ['#fbbf24', '#dc2626', 30]],
  ];
  const destinos = [
    ...document.querySelectorAll('.bloque-fondo'),
    document.querySelector('.testimonios'),
    document.querySelector('.cta-tarjeta'),
  ].filter(Boolean);
  destinos.forEach((el, i) => {
    const caja = document.createElement('div');
    // En bloques con imagen, los regalos van del lado de la imagen para no tapar el texto
    const lado = el.classList.contains('bloque-fondo')
      ? (el.classList.contains('invertido') ? 'der' : 'izq')
      : (i % 2 ? 'izq' : 'der');
    caja.className = `regalitos ${lado}`;
    caja.setAttribute('aria-hidden', 'true');
    caja.innerHTML = grupos[i % grupos.length].map(([c, l, w]) => regalo(c, l, w)).join('');
    el.appendChild(caja);
  });

  /* ---------- 6. Duende que se asoma ---------- */
  const duendeOriginal = document.querySelector('.promo-escena .duende');
  if (duendeOriginal) {
    const asoma = document.createElement('a');
    asoma.href = '#navidad';
    asoma.className = 'duende-asoma';
    asoma.setAttribute('aria-label', 'Ver la promoción de Navidad');
    const copia = duendeOriginal.cloneNode(true);
    copia.removeAttribute('class');
    asoma.appendChild(copia);
    const burbuja = document.createElement('span');
    burbuja.className = 'duende-burbuja';
    burbuja.textContent = '¡Reclama tu regalo! 🎁';
    asoma.appendChild(burbuja);
    document.body.appendChild(asoma);

    if (reducirMovimiento) {
      asoma.classList.add('asomado');
    } else {
      const ciclo = () => {
        asoma.classList.add('asomado');
        setTimeout(() => asoma.classList.remove('asomado'), 5000);
      };
      setTimeout(ciclo, 3500);
      setInterval(ciclo, 16000);
      asoma.addEventListener('mouseenter', () => asoma.classList.add('asomado'));
    }
  }

  /* ---------- 1. Nieve ---------- */
  if (reducirMovimiento) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'nieve';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let ancho, alto, copos = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const crearCopo = (enCualquierAltura) => ({
    x: Math.random() * ancho,
    y: enCualquierAltura ? Math.random() * alto : -10,
    r: 1 + Math.random() * 2.6,
    vy: 0.35 + Math.random() * 0.9,
    vx: -0.3 + Math.random() * 0.6,
    fase: Math.random() * Math.PI * 2,
    alfa: 0.45 + Math.random() * 0.5,
  });

  const redimensionar = () => {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho * dpr;
    canvas.height = alto * dpr;
    canvas.style.width = `${ancho}px`;
    canvas.style.height = `${alto}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const total = Math.round(Math.min(90, ancho / 14));
    copos = Array.from({ length: total }, () => crearCopo(true));
  };

  let animando = true;
  const dibujar = () => {
    if (!animando) return;
    ctx.clearRect(0, 0, ancho, alto);
    for (const c of copos) {
      c.fase += 0.01;
      c.y += c.vy;
      c.x += c.vx + Math.sin(c.fase) * 0.35;
      if (c.y > alto + 10 || c.x < -10 || c.x > ancho + 10) Object.assign(c, crearCopo(false));
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      // Copos azulados sobre fondo claro, blancos sobre fondo oscuro: un color intermedio funciona en ambos
      ctx.fillStyle = `rgba(200, 210, 255, ${c.alfa})`;
      ctx.shadowColor = 'rgba(91, 33, 182, 0.35)';
      ctx.shadowBlur = 3;
      ctx.fill();
    }
    requestAnimationFrame(dibujar);
  };

  redimensionar();
  dibujar();

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(redimensionar, 200); });
  document.addEventListener('visibilitychange', () => {
    animando = !document.hidden;
    if (animando) dibujar();
  });
});
