/* ==========================================================================
   5HM Telecom — main.js
   Preloader · Header · Reveal · Globo (canvas) · Carrossel · Contadores · UI
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  /* ---------- Mapa de continentes (144x72, RLE) ---------- */
  const LAND_MASK = "0144|0144|0144|036.9.2.20.77|027.1.2.2.2.8.2.20.13.3.32.2.30|023.1.2.1.1.1.2.2.2.1.8.20.32.3.12.6.27|022.4.8.2.1.1.12.14.29.2.10.12.11.1.15|11.8.1.13.1.1.5.3.2.1.7.8.40.2.2.4.3.1.21.1.8.11|179.8.6.1.1.4.1.1.1.42|04.73.9.1.1.2.54|08.28.1.1.1.1.3.3.5.5.8.1.11.4.1.62.1|06.28.7.2.9.3.19.5.2.54.1.5.3|07.4.6.18.6.4.1.1.27.5.2.48.7.1.7|08.1.10.18.4.6.23.1.4.1.1.1.2.47.7.3.7|020.19.1.9.19.2.1.1.3.53.6.2.8|021.29.20.58.16|022.22.1.1.2.3.19.58.16|022.24.25.13.1.1.1.5.1.34.17|022.22.27.4.1.1.1.5.5.3.1.34.3.1.14|022.21.25.5.4.2.1.4.1.2.1.4.2.30.4.1.15|023.19.26.4.6.1.1.1.2.9.2.25.3.1.5.1.15|023.19.30.4.9.35.3.1.2.2.16|025.16.28.7.10.34.5.1.18|025.1.1.12.29.11.1.3.1.1.1.35.23|026.8.5.1.28.23.1.29.23|028.5.6.1.26.20.1.5.2.26.24|029.4.33.20.1.8.4.20.1.1.23|030.3.3.1.28.22.1.8.4.7.2.6.29|030.4.1.2.6.2.21.21.1.7.6.5.4.4.1.1.28|033.4.28.23.1.4.8.4.6.4.5.1.23|036.3.26.26.11.2.7.5.4.2.22|042.1.1.1.21.23.2.1.10.2.7.1.1.2.29|039.1.1.7.19.25.19.1.10.1.21|041.8.19.5.1.18.12.1.7.1.31|041.11.24.15.20.2.4.2.25|040.12.24.14.22.2.2.3.25|040.14.22.13.23.2.2.3.1.1.3.2.18|040.17.19.12.25.1.6.1.5.4.14|040.18.19.11.26.1.12.4.13|040.18.19.11.31.2.1.1.5.1.15|041.16.20.11.56|041.15.21.11.3.1.32.2.18|188.2.2.29.6.2.1.14|044.12.21.9.4.2.29.10.13|044.12.21.9.3.2.27.14.12|044.10.24.8.3.2.26.15.12|044.9.25.7.32.16.11|043.9.27.6.33.15.11|043.9.27.5.34.15.11|043.8.28.3.36.4.4.7.11|043.6.79.4.12|043.5.82.1.11.1.1|042.4.84.1.10.1.2|043.3.94.1.3|042.3.94.1.4|042.3.99|042.2.4.1.95|043.2.99|0144|0144|0144|048.1.95|046.1.46.2.18.1.3.1.26|045.1.39.1.3.11.3.30.11|042.5.22.1.1.28.2.39.4|023.1.7.10.1.6.17.74.5|014.30.18.75.7|07.1.2.31.11.3.3.81.5|010.35.12.79.8|011.129.4|0144|0144";

  /* ======================================================================
     1. Preloader
     ====================================================================== */
  const preloader = $("#preloader");
  const plBar = $("#plBar");
  const plCount = $("#plCount");
  const MIN_MS = reduceMotion ? 200 : 2000;

  let pageReady = false;
  let shown = 0;
  let finished = false;
  const t0 = performance.now();

  const finish = () => {
    if (finished) return;
    finished = true;
    preloader.classList.add("is-done");
    body.classList.remove("is-loading");
    setTimeout(() => {
      body.classList.add("is-loaded");
      startReveal();
      globe && globe.start();
    }, 450);
    setTimeout(() => preloader.remove(), 1500);
  };

  const tick = (now) => {
    if (finished) return;
    const elapsed = now - t0;
    const cap = pageReady && elapsed >= MIN_MS ? 100 : 88;
    const timeTarget = Math.min(100, (elapsed / MIN_MS) * 100);
    const target = Math.min(cap, timeTarget);
    shown += (target - shown) * 0.09;
    if (cap === 100 && shown > 99.4) shown = 100;
    plBar.style.width = shown + "%";
    plCount.textContent = Math.round(shown);
    if (shown >= 100) return finish();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const markReady = () => { pageReady = true; };
  if (document.readyState === "complete") markReady();
  else window.addEventListener("load", markReady, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (document.readyState === "complete") markReady(); });
  setTimeout(() => { pageReady = true; }, 4500); // rede lenta: não trava o site
  setTimeout(finish, 8000);

  /* ======================================================================
     2. Reveal on scroll
     ====================================================================== */
  function startReveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ======================================================================
     3. Header, menu mobile e rail
     ====================================================================== */
  const header = $("#siteHeader");
  const onScroll = () => header.classList.toggle("is-stuck", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Seção ativa (rail + nav)
  const sectionIds = ["top", "planos", "disponibilidade", "vantagens", "app", "contato"];
  const railLinks = $$(".rail__link");
  const navLinks = $$(".nav__link");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id || "top";
      const railId = id === "disponibilidade" ? "planos" : id; // o rail não tem item próprio para disponibilidade
      railLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.target === railId));
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sectionIds.forEach((id) => {
    const el = id === "top" ? $(".hero") : document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ======================================================================
     4. Globo terrestre (canvas, sem dependências)
     ====================================================================== */
  const globe = (() => {
    const canvas = $("#globe");
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");

    // Decodifica o mapa RLE para pontos (lat/lon em radianos)
    const W = 144, H = 72, STEP = 360 / W;
    const land = [];
    LAND_MASK.split("|").forEach((row, j) => {
      let bit = row[0] === "1";
      let x = 0;
      row.slice(1).split(".").forEach((n) => {
        const len = +n;
        if (bit) {
          for (let i = x; i < x + len; i++) {
            const lon = (-180 + (i + 0.5) * STEP) * Math.PI / 180;
            const lat = (90 - (j + 0.5) * STEP) * Math.PI / 180;
            land.push([lat, lon]);
          }
        }
        x += len; bit = !bit;
      });
    });
    // Grade discreta de "oceano" para o toque tecnológico
    const sea = [];
    for (let la = -80; la <= 80; la += 5) {
      const n = Math.max(6, Math.round(72 * Math.cos(la * Math.PI / 180)));
      for (let k = 0; k < n; k++) sea.push([la * Math.PI / 180, (k / n) * Math.PI * 2 - Math.PI]);
    }

    const nodes = [ // cidades-nó: Curitiba em destaque
      { lat: -25.43, lon: -49.27, main: true },
      { lat: 38.7, lon: -9.14 }, { lat: 40.7, lon: -74 }, { lat: 51.5, lon: -0.12 },
      { lat: -33.9, lon: 151.2 }, { lat: 35.7, lon: 139.7 }, { lat: -26.2, lon: 28 }, { lat: 25.2, lon: 55.3 },
    ].map((n) => ({ ...n, lat: n.lat * Math.PI / 180, lon: n.lon * Math.PI / 180 }));

    const TILT = 0.38;               // inclinação do eixo (rad)
    const ST = Math.sin(TILT), CT = Math.cos(TILT);
    let size = 0, dpr = 1, R = 0, running = false, visible = true, raf = 0;
    let lon0 = -49 * Math.PI / 180 - 0.9; // começa levemente a oeste do Brasil e gira até ele
    let last = 0;
    let mx = 0, my = 0, tx = 0, ty = 0; // parallax do ponteiro

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      size = r.width;
      canvas.width = canvas.height = Math.round(size * dpr);
      R = size * 0.335;
      draw(0);
    };

    // projeta lat/lon → {x,y,z} (z>0 = face visível)
    const project = (lat, lon) => {
      const a = lon - lon0;
      const cl = Math.cos(lat);
      const px = cl * Math.sin(a);
      const pz0 = cl * Math.cos(a);
      const py0 = Math.sin(lat);
      return { x: px, y: py0 * CT - pz0 * ST, z: py0 * ST + pz0 * CT };
    };

    // anel orbital (plano inclinado, fixo)
    const ORB = { r: 1.36, rotX: 0.5, rotZ: -0.38 };
    const ringPoint = (u) => {
      let x = Math.cos(u) * ORB.r, z = Math.sin(u) * ORB.r, y = 0;
      const cx = Math.cos(ORB.rotX), sx = Math.sin(ORB.rotX);
      const y1 = y * cx - z * sx, z1 = y * sx + z * cx;
      const cz = Math.cos(ORB.rotZ), sz = Math.sin(ORB.rotZ);
      return { x: x * cz - y1 * sz, y: x * sz + y1 * cz, z: z1 };
    };

    function drawRing(front, time) {
      const N = 140;
      for (let i = 0; i < N; i++) {
        const u0 = (i / N) * Math.PI * 2, u1 = ((i + 1) / N) * Math.PI * 2;
        const a = ringPoint(u0), b = ringPoint(u1);
        const zm = (a.z + b.z) / 2;
        if ((zm >= 0) !== front) continue;
        // atrás da esfera só é visível fora do disco
        ctx.beginPath();
        ctx.moveTo(cx + a.x * R, cy - a.y * R);
        ctx.lineTo(cx + b.x * R, cy - b.y * R);
        const depth = (zm / ORB.r + 1) / 2;
        ctx.lineWidth = (2 + depth * 5.5) * (size / 520);
        ctx.strokeStyle = front
          ? `rgba(255,${170 + depth * 30 | 0},${20 + depth * 20 | 0},${0.7 + depth * 0.3})`
          : `rgba(247,147,30,${0.18 + depth * 0.25})`;
        ctx.stroke();
      }
      // satélite
      const u = time * 0.0006;
      const s = ringPoint(u);
      if ((s.z >= 0) === front) {
        const depth = (s.z / ORB.r + 1) / 2;
        const sx = cx + s.x * R, sy = cy - s.y * R, rr = (5 + depth * 4) * (size / 520);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr * 4);
        g.addColorStop(0, "rgba(255,194,26,.9)"); g.addColorStop(1, "rgba(255,194,26,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, rr * 4, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff3c4"; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, 7); ctx.fill();
      }
    }

    let cx = 0, cy = 0;
    function draw(time) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      cx = size / 2 + mx * 6; cy = size / 2 + my * 6;

      // halo
      let g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.55);
      g.addColorStop(0, "rgba(45,130,230,.32)"); g.addColorStop(1, "rgba(45,130,230,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.55, 0, 7); ctx.fill();

      drawRing(false, time);

      // esfera
      g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, "#5fb0ff"); g.addColorStop(0.45, "#1f74c2"); g.addColorStop(1, "#0a2c63");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      // pontos: oceano e terra em faixas de opacidade (poucos fills = rápido)
      const dotR = R * 0.0125 * (STEP / 2.5) + 0.9;
      const buckets = [[], [], [], []];
      const seaPts = [];
      for (const [la, lo] of sea) {
        const p = project(la, lo);
        if (p.z > 0.05) seaPts.push(cx + p.x * R, cy - p.y * R, p.z);
      }
      ctx.fillStyle = "rgba(191,224,255,.16)";
      ctx.beginPath();
      for (let i = 0; i < seaPts.length; i += 3) {
        ctx.moveTo(seaPts[i] + 1, seaPts[i + 1]); ctx.arc(seaPts[i], seaPts[i + 1], dotR * 0.5, 0, 7);
      }
      ctx.fill();

      for (const [la, lo] of land) {
        const p = project(la, lo);
        if (p.z <= 0) continue;
        const b = p.z > 0.75 ? 3 : p.z > 0.5 ? 2 : p.z > 0.22 ? 1 : 0;
        buckets[b].push(cx + p.x * R, cy - p.y * R, p.z);
      }
      const alphas = [0.3, 0.55, 0.8, 1];
      buckets.forEach((arr, bi) => {
        ctx.fillStyle = `rgba(214,236,255,${alphas[bi]})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 3) {
          const r = dotR * (0.55 + arr[i + 2] * 0.55);
          ctx.moveTo(arr[i] + r, arr[i + 1]); ctx.arc(arr[i], arr[i + 1], r, 0, 7);
        }
        ctx.fill();
      });

      // brilho de borda
      g = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
      g.addColorStop(0, "rgba(140,196,255,0)"); g.addColorStop(1, "rgba(140,196,255,.55)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

      // nós de rede
      nodes.forEach((n, i) => {
        const p = project(n.lat, n.lon);
        if (p.z <= 0.08) return;
        const x = cx + p.x * R, y = cy - p.y * R;
        const k = (time / 1000 + i * 0.7) % 2.4 / 2.4;
        const rr = n.main ? 5.5 : 3.2;
        ctx.strokeStyle = `rgba(255,194,26,${(1 - k) * 0.85})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(x, y, rr + k * (n.main ? 24 : 14), 0, 7); ctx.stroke();
        ctx.fillStyle = "#ffc21a"; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
        if (n.main) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
      });

      drawRing(true, time);
    }

    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) { last = t; return; }
      const dt = Math.min(64, t - (last || t)); last = t;
      lon0 += dt * 0.00011;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      draw(t);
    };

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    resize();

    return {
      start() {
        if (running) return; running = true;
        if (reduceMotion) { lon0 = -49 * Math.PI / 180; draw(0); return; }
        raf = requestAnimationFrame(loop);
      },
      setPointer(x, y) { tx = x; ty = y; },
    };
  })();

  /* ======================================================================
     5. Carrossel do hero
     ====================================================================== */
  (() => {
    const hero = $(".hero");
    const slides = $$(".slide");
    const dots = $$(".dot");
    const speedCard = $(".stage__card--speed");
    const gameCard = $(".stage__card--game");
    const SLIDE_MS = 7000;
    hero.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    let i = 0, timer = null;

    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle("is-active", k === i);
        s.setAttribute("aria-hidden", k !== i);
      });
      dots.forEach((d, k) => {
        d.classList.remove("is-active"); void d.offsetWidth; // reinicia a barra de progresso
        d.classList.toggle("is-active", k === i);
        d.setAttribute("aria-selected", k === i);
      });
      speedCard.classList.toggle("is-active", i === 0);
      gameCard.classList.toggle("is-active", i === 1);
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      if (!reduceMotion && !hero.classList.contains("is-paused")) timer = setTimeout(() => go(i + 1), SLIDE_MS);
    };
    $("#nextSlide").addEventListener("click", () => go(i + 1));
    $("#prevSlide").addEventListener("click", () => go(i - 1));
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    hero.addEventListener("pointerenter", () => { hero.classList.add("is-paused"); clearTimeout(timer); });
    hero.addEventListener("pointerleave", () => { hero.classList.remove("is-paused"); go(i); });

    // swipe
    let sx = 0;
    hero.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
    }, { passive: true });

    slides.forEach((s, k) => s.setAttribute("aria-hidden", k !== 0));
    // só começa a contar depois do preloader
    const wait = setInterval(() => { if (body.classList.contains("is-loaded")) { clearInterval(wait); go(0); } }, 120);
  })();

  /* ======================================================================
     6. Parallax do ponteiro (hero) e spotlight nos cards
     ====================================================================== */
  (() => {
    const stage = $("#stage");
    const depthEls = $$("[data-depth]", stage);
    if (!reduceMotion && matchMedia("(hover:hover)").matches) {
      addEventListener("pointermove", (e) => {
        const nx = (e.clientX / innerWidth - 0.5) * 2;
        const ny = (e.clientY / innerHeight - 0.5) * 2;
        depthEls.forEach((el) => {
          const d = +el.dataset.depth;
          el.style.setProperty("--px", (nx * d).toFixed(1) + "px");
          el.style.setProperty("--py", (ny * d * 0.7).toFixed(1) + "px");
        });
        globe && globe.setPointer(nx, ny);
      }, { passive: true });
    }
    $$(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  })();

  /* ======================================================================
     7. Contadores
     ====================================================================== */
  (() => {
    const els = $$("[data-count]");
    const fmt = (v, d) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
    const run = (el) => {
      const to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
      if (reduceMotion) return (el.textContent = fmt(to, dec));
      const dur = 1600, t = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(to * e, dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.6 });
    els.forEach((e) => io.observe(e));
  })();

  /* ======================================================================
     8. Setas do carrossel de planos (mobile)
     ====================================================================== */
  (() => {
    const track = $("#plansTrack");
    const step = () => { const c = track.children[0]; return c ? c.getBoundingClientRect().width + 16 : 320; };
    $("#plansNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    $("#plansPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  })();

  /* ======================================================================
     9. Disponibilidade por CEP → WhatsApp
     ====================================================================== */
  (() => {
    const form = $("#availForm");
    if (!form) return;
    const cep = $("#cep"), num = $("#num"), err = $("#availErr");
    cep.addEventListener("input", () => {
      const d = cep.value.replace(/\D/g, "").slice(0, 8);
      cep.value = d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
      cep.removeAttribute("aria-invalid");
      err.hidden = true;
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (cep.value.replace(/\D/g, "").length !== 8) {
        cep.setAttribute("aria-invalid", "true");
        err.hidden = false;
        cep.focus();
        return;
      }
      const n = num.value.trim();
      const msg = "Olá! Quero consultar a disponibilidade de internet no CEP " + cep.value + (n ? ", número " + n : "") + ".";
      window.open("https://api.whatsapp.com/send?phone=5541992806732&text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  })();

  /* ======================================================================
     10. FAQ (acordeão)
     ====================================================================== */
  (() => {
    const items = $$(".qa");
    items.forEach((qa) => {
      $(".qa__q", qa).addEventListener("click", () => {
        const open = !qa.classList.contains("is-open");
        items.forEach((o) => { o.classList.remove("is-open"); $(".qa__q", o).setAttribute("aria-expanded", "false"); });
        if (open) { qa.classList.add("is-open"); $(".qa__q", qa).setAttribute("aria-expanded", "true"); }
      });
    });
  })();

  /* ======================================================================
     11. Extras
     ====================================================================== */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
