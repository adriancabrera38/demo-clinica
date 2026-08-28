(function () {
  document.addEventListener('DOMContentLoaded', () => {

    // Reveal on scroll
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));

    // Carrusel de fotos del hero (100% automático)
    document.querySelectorAll('.carousel').forEach((carousel) => {
      const track = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dotsWrap = carousel.querySelector('.carousel-dots');
      let index = 0;

      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dotsWrap?.appendChild(dot);
      });

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dotsWrap?.querySelectorAll('button').forEach((d, di) => d.classList.toggle('active', di === index));
      }
      function next() { goTo(index + 1); }
      setInterval(next, 4500);
    });

    // Dropdown de especialidades
    document.querySelectorAll('.dropdown').forEach((dd) => {
      const btn = dd.querySelector('.dropdown-btn');
      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dd.classList.contains('open');
        document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open'));
        if (!isOpen) dd.classList.add('open');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open'));
    });

    // FAQ accordion
    document.querySelectorAll('.faq-item').forEach((item) => {
      item.querySelector('.faq-q')?.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });

    // Selector de día y hora (solo en páginas con window.CLINIC_SCHEDULE)
    function initBooking(root) {
      const schedule = window.CLINIC_SCHEDULE;
      if (!schedule) return;
      const dayPicker = root.querySelector('.day-picker');
      const timeGrid = root.querySelector('.time-grid');
      const summary = root.querySelector('.booking-summary');
      if (!dayPicker || !timeGrid) return;
      const form = root.closest('form');
      const fechaInput = form?.querySelector('[name="cita_fecha"]');
      const horaInput = form?.querySelector('[name="cita_hora"]');

      const dowNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dowShort = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const today = new Date();

      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay();
        const slots = schedule[dow];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-btn';
        btn.innerHTML = `<span class="dow">${dowShort[dow]}</span><span class="num">${d.getDate()}</span>`;

        if (!slots || slots.length === 0) {
          btn.disabled = true;
          btn.style.opacity = '0.35';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.addEventListener('click', () => {
            dayPicker.querySelectorAll('.day-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            renderTimes(slots, d);
          });
        }
        dayPicker.appendChild(btn);
      }

      function renderTimes(slots, d) {
        timeGrid.innerHTML = '';
        summary.classList.remove('show');
        slots.forEach((hora) => {
          const tb = document.createElement('button');
          tb.type = 'button';
          tb.className = 'time-btn';
          tb.textContent = hora;
          tb.addEventListener('click', () => {
            timeGrid.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('active'));
            tb.classList.add('active');
            const fechaTxt = `${dowNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
            summary.textContent = `Has elegido: ${fechaTxt}, a las ${hora}`;
            summary.classList.add('show');
            if (fechaInput) fechaInput.value = fechaTxt;
            if (horaInput) horaInput.value = hora;
          });
          timeGrid.appendChild(tb);
        });
      }
    }
    document.querySelectorAll('.booking-widget').forEach(initBooking);

    // Formularios de contacto / reserva (demo, sin envío real)
    document.querySelectorAll('.contact-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const scope = form.parentElement;
        const privacidad = form.querySelector('[name="privacidad"]');
        const error = form.querySelector('.form-error');
        const success = scope.querySelector('.form-success');
        const fechaInput = form.querySelector('[name="cita_fecha"]');
        const horaInput = form.querySelector('[name="cita_hora"]');

        if (!privacidad || !privacidad.checked) {
          if (error) {
            error.textContent = 'Debes aceptar la Política de Privacidad para continuar.';
            error.classList.add('show');
          }
          return;
        }
        if (fechaInput && !fechaInput.value) {
          if (error) {
            error.textContent = 'Elige un día y una hora para tu cita antes de enviar.';
            error.classList.add('show');
          }
          return;
        }
        if (error) error.classList.remove('show');

        if (success && fechaInput && fechaInput.value) {
          const p = success.querySelector('.cita-elegida');
          if (p) p.textContent = `Te esperamos el ${fechaInput.value}, a las ${horaInput.value}.`;
        }

        form.style.display = 'none';
        success?.classList.add('show');
      });
    });

    // Banner de cookies
    const COOKIE_KEY = 'clinica-aura-demo-cookies';
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      if (!localStorage.getItem(COOKIE_KEY)) {
        setTimeout(() => banner.classList.add('show'), 400);
      }
      document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'aceptadas');
        banner.classList.remove('show');
      });
      document.getElementById('cookie-reject')?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'rechazadas');
        banner.classList.remove('show');
      });
    }
  });
})();
