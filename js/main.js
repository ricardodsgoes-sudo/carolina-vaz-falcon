/* =================================================================
   Carolina Vaz Falcon — main.js
   GSAP + ScrollTrigger (reveals) · Lenis (scroll suave)
   Micro-interações nos ícones · navbar flutuante · menu · FAQ
   Degradação graciosa + prefers-reduced-motion respeitado
   ================================================================= */
(function () {
  "use strict";

  const doc = document;
  const html = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* -------------------- Ano no rodapé -------------------- */
  const yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- Header: estado ao rolar -------------------- */
  const header = doc.getElementById("header");
  function updateHeader(y) {
    if (!header) return;
    header.classList.toggle("is-scrolled", y > 24);
  }
  updateHeader(window.scrollY);

  /* -------------------- Menu mobile -------------------- */
  const toggle = doc.getElementById("navToggle");
  const mobileMenu = doc.getElementById("mobileMenu");

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.hidden ? openMenu() : closeMenu();
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    doc.addEventListener("click", function (e) {
      if (!mobileMenu.hidden && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  /* -------------------- FAQ: altura animada (Web Animations API) --------------------
     Anima a altura do <details> inteiro (summary + painel + paddings), com overflow
     escondido durante a transição. Cliques rápidos cancelam a animação em curso para
     não travar no meio. */
  doc.querySelectorAll(".acc-item").forEach(function (item) {
    const summary = item.querySelector("summary");
    const panel = item.querySelector(".acc-item__a");
    if (!summary || !panel || reduceMotion) return;

    const EASE = "cubic-bezier(.16,1,.3,1)";
    let animation = null;
    let isExpanding = false;
    let isClosing = false;

    summary.addEventListener("click", function (e) {
      e.preventDefault();
      item.style.overflow = "hidden";
      if (isClosing || !item.open) expand();
      else if (isExpanding || item.open) shrink();
    });

    function expand() {
      isClosing = false;
      isExpanding = true;
      const startHeight = item.offsetHeight + "px";
      item.open = true; // precisa estar aberto para medir o conteúdo
      const endHeight = item.offsetHeight + "px";
      if (animation) animation.cancel();
      animation = item.animate(
        { height: [startHeight, endHeight] },
        { duration: 320, easing: EASE }
      );
      animation.onfinish = function () { finish(true); };
      animation.oncancel = function () { isExpanding = false; };
    }

    function shrink() {
      isExpanding = false;
      isClosing = true;
      const startHeight = item.offsetHeight + "px";
      const endHeight = summary.offsetHeight + "px";
      if (animation) animation.cancel();
      animation = item.animate(
        { height: [startHeight, endHeight] },
        { duration: 280, easing: EASE }
      );
      animation.onfinish = function () { finish(false); };
      animation.oncancel = function () { isClosing = false; };
    }

    function finish(open) {
      item.open = open;
      animation = null;
      isExpanding = false;
      isClosing = false;
      item.style.height = "";
      item.style.overflow = "";
    }
  });

  /* -------------------- Caminho REDUZIDO ou sem GSAP -------------------- */
  if (reduceMotion || !hasGSAP) {
    // Revela tudo via IntersectionObserver (usa a transição do CSS)
    const items = doc.querySelectorAll("[data-animate]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      const io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
      items.forEach(function (el) { io.observe(el); });
    }
    window.addEventListener("scroll", function () { updateHeader(window.scrollY); }, { passive: true });
    return; // encerra aqui no caminho reduzido
  }

  /* ================================================================
     Caminho PREMIUM — GSAP + ScrollTrigger + Lenis
     ================================================================ */
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // GSAP assume o controle: desliga a transição do CSS e neutraliza o estado
  // inicial oculto (CSS deixa [data-animate] com opacity:0 para o fallback sem JS).
  // Tornamos visível por padrão; cada gsap.from() volta a esconder até o gatilho.
  doc.querySelectorAll("[data-animate]").forEach(function (el) {
    el.style.transition = "none";
    el.style.willChange = "auto";
  });
  gsap.set("[data-animate]", { opacity: 1, y: 0 });

  /* -------------------- Lenis: scroll suave -------------------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on("scroll", function (e) {
      window.ScrollTrigger.update();
      updateHeader(e.animatedScroll != null ? e.animatedScroll : window.scrollY);
    });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener("scroll", function () { updateHeader(window.scrollY); }, { passive: true });
  }

  /* -------------------- Âncoras: scroll com offset do header -------------------- */
  const headerH = parseInt(getComputedStyle(html).getPropertyValue("--header-h")) || 90;
  doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
      if (lenis) lenis.scrollTo(top, { duration: 1.2 });
      else window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* -------------------- Hero: entrada sequencial -------------------- */
  const heroMedia = doc.querySelector(".hero__media");
  // exclui a mídia do stagger (ela tem tween próprio de clip/scale logo abaixo)
  const heroEls = gsap.utils.toArray(".hero [data-animate]").filter(function (el) {
    return el !== heroMedia;
  });
  const heroBadge = doc.querySelector(".hero__badge");

  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
  tl.from(heroEls, { y: 30, opacity: 0, stagger: 0.12 });
  if (heroMedia) {
    tl.from(heroMedia, {
      opacity: 0, scale: 0.94, y: 24,
      clipPath: "inset(8% 0% 0% 0% round 40px)", duration: 1.1, ease: "power3.out"
    }, 0.25);
  }
  if (heroBadge) tl.from(heroBadge, { opacity: 0, x: -16, duration: 0.7 }, "-=0.4");

  // float sutil dos ramalhetes do hero (foto + decorativo da esquerda)
  gsap.to(".hero__ramalhete", { y: -10, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hero__deco", { y: -8, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });

  /* -------------------- Reveals por seção (fade-up + stagger) -------------------- */
  const revealEls = gsap.utils.toArray("[data-animate]").filter(function (el) {
    return !el.closest(".hero");
  });
  revealEls.forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      y: 30, opacity: 0, duration: 0.85, ease: "power3.out",
      clearProps: "transform" // remove o transform inline ao fim → libera o hover (CSS) dos cards
    });
  });

  /* -------------------- Micro-interações nos ícones -------------------- */
  // 1) "pop" na entrada de cada grupo de ícones
  const iconGroups = [
    ".fase__icon", ".pilar__icon", ".modalidade-card__icon", ".hero-feature__icon", ".local-card__icon"
  ];
  iconGroups.forEach(function (sel) {
    gsap.utils.toArray(sel).forEach(function (icon, i) {
      gsap.from(icon, {
        scrollTrigger: { trigger: icon, start: "top 92%" },
        scale: 0.4, rotation: -18, opacity: 0,
        duration: 0.7, ease: "back.out(1.9)", delay: (i % 6) * 0.06
      });
    });
  });

  // 2) float contínuo muito sutil nos ícones de seção (vida/respiro)
  gsap.utils.toArray(".fase__icon, .pilar__icon").forEach(function (icon, i) {
    gsap.to(icon, {
      y: -6, duration: 2.6 + (i % 4) * 0.3, ease: "sine.inOut",
      yoyo: true, repeat: -1, delay: i * 0.15
    });
  });

  // 3) parallax leve na foto do "Sobre mim" e do hero
  if (doc.querySelector(".sobre__img")) {
    gsap.to(".sobre__img", {
      yPercent: -6,
      scrollTrigger: { trigger: ".sobre", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  // Recalcula posições após carregar imagens
  window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
})();
