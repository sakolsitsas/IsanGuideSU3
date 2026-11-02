const themeToggle = document.getElementById("themeToggle");

function getStoredTheme() {
  try {
    return window.localStorage.getItem("theme") === "dark";
  } catch (error) {
    return false;
  }
}

function setStoredTheme(isDark) {
  try {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (error) {
    // Ignore storage failures in restricted browser contexts.
  }
}

function updateThemeButton() {
  if (!themeToggle) return;

  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? " มืดมองไม่เห็น" : " แสบตาไม่ไหว";
}

// โหลดค่าที่บันทึกไว้
if (getStoredTheme()) {
  document.body.classList.add("dark-mode");
}

updateThemeButton();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    setStoredTheme(isDark);
    updateThemeButton();
  });
}

const itineraryToggle = document.getElementById("itineraryToggle");
const itineraryContent = document.getElementById("itineraryContent");

if (itineraryToggle && itineraryContent) {
  itineraryToggle.addEventListener("click", () => {
    const isExpanded = itineraryToggle.getAttribute("aria-expanded") === "true";

    itineraryToggle.setAttribute("aria-expanded", String(!isExpanded));
    itineraryContent.hidden = isExpanded;
    itineraryToggle.textContent = isExpanded ? "ขยาย ▼" : "ย่อ ▲";
  });
}

const targetDate = new Date("2026-12-05T06:00:00+07:00").getTime();

function updateCountdown() {
  const dayEl = document.getElementById("cdDays");
  const hourEl = document.getElementById("cdHours");
  const minuteEl = document.getElementById("cdMinutes");
  const secondEl = document.getElementById("cdSeconds");
  const messageEl = document.getElementById("countdownMessage");

  if (!dayEl || !hourEl || !minuteEl || !secondEl || !messageEl) {
    return;
  }

  const now = Date.now();
  const distance = targetDate - now;

  if (distance <= 0) {
    dayEl.textContent = "00";
    hourEl.textContent = "00";
    minuteEl.textContent = "00";
    secondEl.textContent = "00";
    messageEl.textContent = "🎉 ถึงเวลาออกเดินทางแล้ว!";
    return;
  }

  dayEl.textContent = String(Math.floor(distance / 86400000)).padStart(2, "0");
  hourEl.textContent = String(
    Math.floor((distance % 86400000) / 3600000),
  ).padStart(2, "0");
  minuteEl.textContent = String(
    Math.floor((distance % 3600000) / 60000),
  ).padStart(2, "0");
  secondEl.textContent = String(
    Math.floor((distance % 60000) / 1000),
  ).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

const slideshow = document.getElementById("tourSlideshow");

if (slideshow) {
  const slides = [...slideshow.querySelectorAll(".tour-slide")];
  const dots = [...slideshow.querySelectorAll(".tour-dot")];

  let current = 0;
  let timer;
  let pointerStart = null;
  let suppressSlideClick = false;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-current", i === current ? "true" : "false");
    });
  }

  function startSlideshow() {
    clearInterval(timer);

    const mediaQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    if (mediaQuery && mediaQuery.matches) {
      return;
    }

    timer = setInterval(() => {
      showSlide(current + 1);
    }, 6000);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startSlideshow();
    });
  });

  slideshow.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      !event.target.closest(".tour-slide")
    ) {
      return;
    }

    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  });

  slideshow.addEventListener("pointerup", (event) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    showSlide(current + (deltaX < 0 ? 1 : -1));
    startSlideshow();
    suppressSlideClick = true;
    window.setTimeout(() => {
      suppressSlideClick = false;
    }, 0);
  });

  slideshow.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  slideshow.addEventListener("click", (event) => {
    if (!event.target.closest(".tour-slide")) {
      return;
    }

    if (suppressSlideClick) {
      event.preventDefault();
      return;
    }

    showSlide(current + 1);
    startSlideshow();
  });

  showSlide(0);
  startSlideshow();
}

const authorToggle = document.getElementById("authorToggle");
const authorContent = document.getElementById("authorContent");

if (authorToggle && authorContent) {
  authorToggle.addEventListener("click", () => {
    const expanded = authorToggle.getAttribute("aria-expanded") === "true";

    authorToggle.setAttribute("aria-expanded", String(!expanded));
    authorContent.hidden = expanded;

    authorToggle.textContent = expanded ? "ดูข้อมูล ▼" : "ซ่อนข้อมูล ▲";
  });
}
