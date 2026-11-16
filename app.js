/**
 * Detector de Scroll (IntersectionObserver)
 * Vigila cada sección y activa la clase '.es-visible' únicamente 
 * cuando el usuario baja y la sección entra en pantalla.
 */
document.addEventListener('DOMContentLoaded', () => {
  const secciones = document.querySelectorAll('.revelar-scroll');

  const opcionesObservador = {
    root: null,       // Usa el viewport (la pantalla del usuario) como referencia
    threshold: 0.20   // Se dispara cuando el 20% de la sección ya es visible
  };

  const detectorScroll = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('es-visible');
      } else {
        // Quita la clase al salir para que vuelva a animarse si el usuario sube y baja
        entrada.target.classList.remove('es-visible');
      }
    });
  }, opcionesObservador);

  secciones.forEach((seccion) => detectorScroll.observe(seccion));
});