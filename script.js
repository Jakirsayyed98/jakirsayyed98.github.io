/* ============================================================
   JAKIR SAYYED — PORTFOLIO SCRIPT
   Backend Pipeline Visual + All Interactions
   ============================================================ */

"use strict";

// ─── LOADER ─────────────────────────────────────────────────
const LOADER_MSGS = [
  "Booting kernel modules...",
  "Initializing Go runtime...",
  "Connecting to PostgreSQL...",
  "Mounting Redis cache layer...",
  "Starting microservice mesh...",
  "Pipeline ready. Welcome."
];

(function initLoader() {
  const loader = document.getElementById("loader");
  const status = document.getElementById("loader-status");
  let i = 0;
  const interval = setInterval(() => {
    i++;
    if (i < LOADER_MSGS.length) {
      status.textContent = LOADER_MSGS[i];
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add("hidden");
        startAllAnimations();
      }, 400);
    }
  }, 400);
})();

// ─── TYPED TEXT EFFECT ───────────────────────────────────────
function startTypingEffect() {
  const PHRASES = [
    "Backend Developer",
    "Golang Microservices Engineer",
    "Fintech Systems Architect",
    "REST API Designer",
    "Distributed Systems Builder"
  ];
  const el = document.getElementById("typed-text");
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const phrase = PHRASES[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        setTimeout(() => { deleting = true; tick(); }, 2200);
        return;
      }
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 80);
  }
  tick();
}

// ─── HERO CANVAS: PARTICLES ──────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, particles = [], animFrame;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function () {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? "#00c8ff" : "#a855f7";
    };
    this.reset();
    this.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    };
    this.draw = function () {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    };
  }

  function init() {
    particles = [];
    const N = Math.min(Math.floor(W * H / 8000), 120);
    for (let i = 0; i < N; i++) particles.push(new Particle());
  }

  const CONN_DIST = 100;
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONN_DIST) {
          const alpha = (1 - d / CONN_DIST) * 0.12;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = "#00c8ff";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(frame);
  }

  resize();
  init();
  frame();
  window.addEventListener("resize", () => { resize(); init(); });
}

// ─── PIPELINE CANVAS ANIMATION ───────────────────────────────
function initPipelineCanvas() {
  const canvas = document.getElementById("pipeline-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function getNodePositions() {
    const nodesEl = document.getElementById("arch-nodes");
    const nodeEls = nodesEl.querySelectorAll(".arch-node");
    const canvasRect = canvas.getBoundingClientRect();
    const positions = [];
    nodeEls.forEach(n => {
      const r = n.getBoundingClientRect();
      positions.push({
        x: r.left - canvasRect.left + r.width / 2,
        y: r.top - canvasRect.top + r.height / 2
      });
    });
    return positions;
  }

  function resize() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  // Data packets flowing along the path
  const packets = [];
  const MAX_PACKETS = 6;
  let pathProgress = 0;

  function makePacket(color, backward) {
    return {
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.003,
      color: color || "#00c8ff",
      backward: backward || false,
      size: 4,
      trail: []
    };
  }

  // Spawn packets
  setInterval(() => {
    if (packets.length < MAX_PACKETS) {
      packets.push(makePacket("#00c8ff", false));
    }
  }, 600);
  setInterval(() => {
    if (packets.length < MAX_PACKETS + 2) {
      packets.push(makePacket("#00ff88", true));
    }
  }, 900);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function getPointOnPath(positions, t, backward) {
    const pts = backward ? [...positions].reverse() : positions;
    const segments = pts.length - 1;
    const seg = Math.min(Math.floor(t * segments), segments - 1);
    const localT = (t * segments) - seg;
    return {
      x: lerp(pts[seg].x, pts[seg + 1].x, localT),
      y: lerp(pts[seg].y, pts[seg + 1].y, localT)
    };
  }

  function drawGlowLine(ctx, x1, y1, x2, y2, color, alpha, width) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  let animFrame;
  function frame() {
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const positions = getNodePositions();
    if (positions.length < 2) { animFrame = requestAnimationFrame(frame); return; }

    // Draw pipeline connections
    for (let i = 0; i < positions.length - 1; i++) {
      const { x: x1, y: y1 } = positions[i];
      const { x: x2, y: y2 } = positions[i + 1];
      drawGlowLine(ctx, x1, y1, x2, y2, "rgba(0,200,255,0.08)", 1, 1.5);
      drawGlowLine(ctx, x1, y1, x2, y2, "rgba(0,200,255,0.03)", 1, 6);
    }

    // Draw & move packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t > 1) { packets.splice(i, 1); continue; }

      const pos = getPointOnPath(positions, p.t, p.backward);

      // Trail
      p.trail.push({ ...pos });
      if (p.trail.length > 12) p.trail.shift();

      // Draw trail
      for (let j = 1; j < p.trail.length; j++) {
        const a = (j / p.trail.length) * 0.5;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(p.trail[j - 1].x, p.trail[j - 1].y);
        ctx.lineTo(p.trail[j].x, p.trail[j].y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw packet dot
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    animFrame = requestAnimationFrame(frame);
  }

  frame();
  window.addEventListener("resize", resize);
}

// ─── NODE TOOLTIPS ────────────────────────────────────────────
function initNodeTooltips() {
  const tooltip = document.getElementById("node-tooltip");
  document.querySelectorAll(".arch-node").forEach(node => {
    node.addEventListener("mouseenter", (e) => {
      tooltip.textContent = node.dataset.info;
      tooltip.style.display = "block";
      positionTooltip(e);
    });
    node.addEventListener("mousemove", positionTooltip);
    node.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });

  function positionTooltip(e) {
    let x = e.clientX + 16;
    let y = e.clientY + 16;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    if (x + tw > window.innerWidth - 10) x = e.clientX - tw - 16;
    if (y + th > window.innerHeight - 10) y = e.clientY - th - 16;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }
}

// ─── SCROLL ANIMATIONS (Intersection Observer) ───────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger delay for grid children
        const siblings = el.parentElement.querySelectorAll(".reveal");
        let idx = 0;
        siblings.forEach((s, i) => { if (s === el) idx = i; });
        el.style.transitionDelay = (idx * 80) + "ms";
        el.classList.add("in-view");

        // Animate skill bars
        const fill = el.querySelector(".skill-fill");
        if (fill) {
          const w = fill.dataset.width;
          setTimeout(() => { fill.style.width = w + "%"; }, idx * 80 + 200);
        }

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ─── COUNTER ANIMATION ────────────────────────────────────────
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat-num").forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + (target === 200 ? "+" : "");
  }
  requestAnimationFrame(step);
}

// ─── NAVBAR: ACTIVE SECTION TRACKING + SCROLL ────────────────
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");

  // Hamburger
  const ham = document.createElement("div");
  ham.className = "nav-hamburger";
  ham.innerHTML = "<span></span><span></span><span></span>";
  navbar.insertBefore(ham, navbar.querySelector(".nav-status"));
  const navLinks = navbar.querySelector(".nav-links");
  ham.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // Scroll state
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    // Active tracking
    let current = "";
    sections.forEach(s => {
      if (y >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle("active", l.dataset.section === current);
    });

    lastScroll = y;
  }, { passive: true });
}

// ─── CONTACT FORM ─────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById("contact-form");
  const msg = document.getElementById("form-msg");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.style.color = "var(--blue)";
    msg.textContent = "Sending request...";
    setTimeout(() => {
      msg.style.color = "var(--green)";
      msg.textContent = "✓ Message delivered. Response incoming.";
      form.reset();
    }, 1200);
  });
}

// ─── RESUME BUTTON ────────────────────────────────────────────
function initResumeBtn() {
  const btn = document.getElementById("resume-btn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    // e.preventDefault();
    const el = document.createElement("a");
    el.href = "#";
    const msg = document.createElement("div");
    msg.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem;
      background: var(--surface2); border: 1px solid var(--border);
      padding: 0.75rem 1.25rem; border-radius: 8px;
      font-family: var(--font-mono); font-size: 0.75rem;
      color: var(--green); z-index: 9999;
      backdrop-filter: blur(10px);
    `;
    msg.textContent = "📄 Resume link not connected — contact via email";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  });
}

// ─── SECTION ENTER ANIMATIONS (Observer for pipeline section) ─
function initArchitectureSection() {
  const section = document.getElementById("architecture");
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      section.querySelectorAll(".arch-node").forEach((node, i) => {
        node.style.opacity = "0";
        node.style.transform = "scale(0.8)";
        node.style.transition = `opacity 0.4s ease ${i * 80 + 200}ms, transform 0.4s ease ${i * 80 + 200}ms`;
        setTimeout(() => {
          node.style.opacity = "1";
          node.style.transform = "scale(1)";
        }, i * 80 + 200);
      });
      observer.unobserve(section);
    }
  }, { threshold: 0.2 });
  observer.observe(section);
}

// ─── PARALLAX SUBTLE EFFECT ───────────────────────────────────
function initParallax() {
  const hero = document.getElementById("hero");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      const canvas = document.getElementById("bg-canvas");
      if (canvas) canvas.style.transform = `translateY(${y * 0.25}px)`;
    }
  }, { passive: true });
}

// ─── CURSOR GLOW EFFECT ───────────────────────────────────────
function initCursorGlow() {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: fixed; width: 300px; height: 300px;
    border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(0,200,255,0.06), transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 0; transition: left 0.08s, top 0.08s;
  `;
  document.body.appendChild(glow);
  document.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

// ─── BOOT ALL ─────────────────────────────────────────────────
function startAllAnimations() {
  startTypingEffect();
  initHeroCanvas();
  initPipelineCanvas();
  initNodeTooltips();
  initScrollReveal();
  initCounters();
  initNavbar();
  initContactForm();
  initResumeBtn();
  initArchitectureSection();
  initParallax();
  initCursorGlow();
}
