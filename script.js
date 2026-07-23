/* Centro Espacial Mexicano — script.js
   Starfield · reveals on scroll · trayectoria Meta 2050 · header · menú móvil */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ Starfield ============ */
  const canvas = document.getElementById("starfield");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    let shooting = null;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),                       // profundidad → parallax
        r: 0.4 + Math.random() * 1.3,
        tw: Math.random() * Math.PI * 2,
        ts: 0.4 + Math.random() * 1.4,
      }));
    };

    const spawnShooting = () => {
      shooting = {
        x: Math.random() * w * 0.7,
        y: Math.random() * h * 0.35,
        vx: 7 + Math.random() * 5,
        vy: 2.4 + Math.random() * 2,
        life: 1,
      };
    };

    let scrollY = 0;
    let t = 0;

    const frame = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.ts + s.tw);
        const y = (s.y - scrollY * s.z * 0.18 + h * 4) % h;
        ctx.globalAlpha = twinkle * (0.35 + s.z * 0.6);
        ctx.fillStyle = s.z > 0.85 ? "#bfffe0" : "#eef5f1";
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shooting) {
        const s = shooting;
        ctx.globalAlpha = s.life;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
        grad.addColorStop(0, "rgba(191,255,224,0.95)");
        grad.addColorStop(1, "rgba(191,255,224,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.stroke();
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.02;
        if (s.life <= 0 || s.x > w + 120) shooting = null;
      } else if (Math.random() < 0.0025) {
        spawnShooting();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Un solo cuadro estático
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + s.z * 0.5;
        ctx.fillStyle = "#eef5f1";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
      requestAnimationFrame(frame);
    }
  }

  /* ============ Header compacto + progreso ============ */
  const header = document.getElementById("header");
  const progress = document.querySelector(".scroll-progress span");

  const onScroll = () => {
    if (header) header.classList.toggle("compact", window.scrollY > 40);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============ Menú móvil ============ */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    header.querySelectorAll(".site-nav a").forEach((a) =>
      a.addEventListener("click", () => {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ============ Reveals ============ */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ============ Trayectoria Meta 2050 ============ */
  const trajectory = document.querySelector(".trajectory");
  if (trajectory && "IntersectionObserver" in window && !reduceMotion) {
    const io2 = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            trajectory.classList.add("drawn");
            io2.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );
    io2.observe(trajectory);
  } else if (trajectory) {
    trajectory.classList.add("drawn");
  }
})();
