document.addEventListener("DOMContentLoaded", () => {
  const cursorLight = document.querySelector(".cursor-light");
  const barFills = document.querySelectorAll(".bar-fill");
  const metricValues = document.querySelectorAll("[data-animate-number]");
  const sliders = document.querySelectorAll(".bar-slider");
  const barValueEls = document.querySelectorAll("[data-bar-value]");
  const barMap = {};
  const barValueMap = {};
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const contactForms = document.querySelectorAll(".contact-form");

  // Dynamic cursor light
  document.addEventListener("mousemove", (e) => {
    cursorLight.style.opacity = 1;
    cursorLight.style.left = `${e.clientX}px`;
    cursorLight.style.top = `${e.clientY}px`;
  });

  document.addEventListener("mouseleave", () => {
    cursorLight.style.opacity = 0;
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
      });
    });
  }

  // Animate bars based on data-bar attribute
  barFills.forEach((bar, index) => {
    const target = parseInt(bar.getAttribute("data-bar"), 10) || 80;
    const delay = 200 + index * 180;
    const key = bar.getAttribute("data-bar-key");

    if (key) {
      barMap[key] = bar;
    }

    setTimeout(() => {
      bar.style.transition = "transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1)";
      bar.style.transform = `scaleX(${target / 100})`;
    }, delay);
  });

  // Map value elements
  barValueEls.forEach((el) => {
    const key = el.getAttribute("data-bar-value");
    if (key) {
      barValueMap[key] = el;
    }
  });

  // Interactive sliders update bars and labels
  sliders.forEach((slider) => {
    const key = slider.getAttribute("data-target");
    slider.addEventListener("input", () => {
      const value = parseInt(slider.value, 10) || 0;
      const bar = key ? barMap[key] : null;
      if (bar) {
        bar.style.transition = "transform 0.35s ease";
        bar.style.transform = `scaleX(${value / 100})`;
        bar.setAttribute("data-bar", value);
      }
      if (key && barValueMap[key]) {
        barValueMap[key].textContent = `${value}%`;
      }
    });
  });

  // Animate metric numbers
  metricValues.forEach((el) => {
    const rawTarget = el.getAttribute("data-animate-number");
    if (!rawTarget) return;

    const target = parseFloat(rawTarget);
    const isRating = target <= 5;
    let suffix = el.textContent.trim().replace(/[0-9.]/g, "").trim();
    if (!suffix) {
      suffix = isRating ? "/5" : "";
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * progress;
      el.textContent = `${isRating ? current.toFixed(1) : Math.round(current)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });

  // Contact form async submit + status
  contactForms.forEach((form) => {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = "Sending...";
        status.className = "form-status pending";
      }

      const data = new FormData(form);
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Request failed");
        if (status) {
          status.textContent = "Thanks! We got your note.";
          status.className = "form-status success";
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.textContent = "Something went wrong. Try again or email us.";
          status.className = "form-status error";
        }
      }
    });

    // Add subtle focus glow on form container
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((field) => {
      field.addEventListener("focus", () => form.classList.add("active"));
      field.addEventListener("blur", () => {
        if (!form.querySelector("input:focus, textarea:focus")) {
          form.classList.remove("active");
        }
      });
    });
  });
});
