/* =====================================================
   Denax — Personal Website Scripts
   ===================================================== */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Reveal on Scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );

      revealItems.forEach((item) => observer.observe(item));
    }
  }

  /* ---------- 2. Current Year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 3. Mobile Menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  const closeMenu = () => {
    navLinks?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  menuBtn?.addEventListener("click", () => {
    const open = navLinks?.classList.toggle("open") ?? false;
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (!navLinks || !menuBtn) return;
    if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- 4. Cursor Glow (smooth lerp, desktop only) ---------- */
  const glow = document.querySelector(".cursor-glow");

  if (glow && hasFinePointer && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let rafId = null;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      currentX = lerp(currentX, mouseX, 0.15);
      currentY = lerp(currentY, mouseY, 0.15);

      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

      if (
        Math.abs(currentX - mouseX) > 0.1 ||
        Math.abs(currentY - mouseY) > 0.1
      ) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!rafId) rafId = requestAnimationFrame(animate);
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
      glow.style.opacity = "";
    });
  }

  /* ---------- 5. Scroll Progress Bar + Nav Scrolled State ---------- */
  const progressBar = document.getElementById("scrollProgress");
  const navWrap = document.querySelector(".nav-wrap");

  if ((progressBar || navWrap) && !prefersReducedMotion) {
    let ticking = false;

    const updateScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const progress = h > 0 ? y / h : 0;

      if (progressBar) {
        progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
      }
      if (navWrap) {
        navWrap.classList.toggle("scrolled", y > 20);
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateScroll();
  }

  /* ---------- 6. Active Nav Link Highlight ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  if (sections.length && navAnchors.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navAnchors.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  /* ---------- 7. Smooth Anchor Scroll (fallback for reduced motion) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#" || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      if (prefersReducedMotion) {
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 78) -
          20;
        window.scrollTo({ top, behavior: "auto" });
      }
    });
  });

  /* ---------- 8. Subtle Parallax on Floating Words (desktop) ---------- */
  const floatingWords = document.querySelectorAll(".floating-word");

  if (floatingWords.length && hasFinePointer && !prefersReducedMotion) {
    let wordTicking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (wordTicking) return;
        wordTicking = true;

        requestAnimationFrame(() => {
          const y = window.scrollY;
          floatingWords.forEach((word, i) => {
            const speed = i === 0 ? 0.06 : -0.05;
            word.style.transform = `translateY(${y * speed}px)`;
          });
          wordTicking = false;
        });
      },
      { passive: true }
    );
  }
})();
