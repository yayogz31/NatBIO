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
