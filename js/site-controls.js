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

const sectionOrderToggle = document.getElementById("sectionOrderToggle");
const sectionOrderReset = document.getElementById("sectionOrderReset");
const sectionOrderStatus = document.getElementById("sectionOrderStatus");
const mainContent = document.querySelector("main");
const sectionOrderStorageKey = "isan-guide-section-order";
const reorderableSectionDefinitions = [
  ["countdown", ".countdown-panel"],
  ["trip-overview", ".trip-header"],
  ["itinerary", "#itineraryPanel"],
  ["map", "#isan-map-section"],
  ["weather", ".trip-weather"],
  ["top-messages", ".top-liked-section"],
  ["message-board", "#messageBoard"],
];
const reorderableSections = reorderableSectionDefinitions
  .map(([key, selector]) => {
    const section = document.querySelector(selector);
    if (!section) return null;

    section.dataset.sectionOrderKey = key;
    return section;
  })
  .filter(Boolean);

function getSectionOrder() {
  try {
    const storedOrder = window.localStorage.getItem(sectionOrderStorageKey);
    if (!storedOrder) return [];

    const parsedOrder = JSON.parse(storedOrder);
    if (!Array.isArray(parsedOrder)) {
      throw new TypeError("Saved section order must be an array");
    }

    return parsedOrder.filter(
      (key, index) =>
        reorderableSectionDefinitions.some(([sectionKey]) => sectionKey === key) &&
        parsedOrder.indexOf(key) === index,
    );
  } catch (error) {
    console.error("โหลดลำดับ Section ที่บันทึกไว้ไม่สำเร็จ", error);
    if (sectionOrderStatus) {
      sectionOrderStatus.textContent = "โหลดลำดับที่บันทึกไว้ไม่สำเร็จ";
      sectionOrderStatus.hidden = false;
    }
    return [];
  }
}

function saveSectionOrder() {
  const order = reorderableSections.map(
    (section) => section.dataset.sectionOrderKey,
  );

  try {
    window.localStorage.setItem(sectionOrderStorageKey, JSON.stringify(order));
    if (sectionOrderStatus) {
      sectionOrderStatus.textContent = "บันทึกลำดับส่วนนี้ไว้ในเครื่องแล้ว";
    }
  } catch (error) {
    console.error("บันทึกลำดับ Section ไม่สำเร็จ", error);
    if (sectionOrderStatus) {
      sectionOrderStatus.textContent =
        "บันทึกลำดับไม่สำเร็จ เบราว์เซอร์อาจไม่อนุญาตให้ใช้พื้นที่จัดเก็บ";
    }
  }
}

function updateSectionMoveButtons() {
  reorderableSections.forEach((section, index) => {
    const upButton = section.querySelector(".section-order-up");
    const downButton = section.querySelector(".section-order-down");
    upButton.disabled = index === 0;
    downButton.disabled = index === reorderableSections.length - 1;
    upButton.setAttribute("aria-label", `ย้าย ${getSectionLabel(section)} ขึ้น`);
    downButton.setAttribute(
      "aria-label",
      `ย้าย ${getSectionLabel(section)} ลง`,
    );
  });
}

function syncSectionOrderFromDOM() {
  const sectionsInDOMOrder = [...mainContent.children].filter((child) =>
    reorderableSections.includes(child),
  );
  reorderableSections.splice(
    0,
    reorderableSections.length,
    ...sectionsInDOMOrder,
  );
}

function getSectionLabel(section) {
  const heading = section.querySelector("h1, h2, h3");
  return heading?.textContent.trim() || section.dataset.sectionOrderKey;
}

function moveSection(section, direction) {
  const index = reorderableSections.indexOf(section);
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= reorderableSections.length) return;

  const target = reorderableSections[targetIndex];
  if (direction < 0) {
    mainContent.insertBefore(section, target);
  } else {
    mainContent.insertBefore(target, section);
  }

  reorderableSections.splice(index, 1);
  reorderableSections.splice(targetIndex, 0, section);
  updateSectionMoveButtons();
  saveSectionOrder();
}

function resetSectionOrder() {
  try {
    window.localStorage.removeItem(sectionOrderStorageKey);
  } catch (error) {
    console.error("รีเซ็ตลำดับ Section ไม่สำเร็จ", error);
    sectionOrderStatus.textContent =
      "รีเซ็ตไม่สำเร็จ เบราว์เซอร์อาจไม่อนุญาตให้ใช้พื้นที่จัดเก็บ";
    return;
  }

  const defaultOrder = reorderableSectionDefinitions
    .map(([key]) =>
      reorderableSections.find((section) => section.dataset.sectionOrderKey === key),
    )
    .filter(Boolean);
  const siteStatsFooter = mainContent.querySelector(".site-stats");

  defaultOrder.forEach((section) =>
    mainContent.insertBefore(section, siteStatsFooter),
  );
  reorderableSections.splice(0, reorderableSections.length, ...defaultOrder);
  updateSectionMoveButtons();
  sectionOrderStatus.textContent = "เรียง Section กลับเป็นลำดับเริ่มต้นแล้ว";
}

function addSectionOrderControls(section) {
  const controls = document.createElement("div");
  controls.className = "section-order-controls";

  const dragHandle = document.createElement("button");
  dragHandle.type = "button";
  dragHandle.className = "section-order-drag";
  dragHandle.draggable = true;
  dragHandle.textContent = "↕ ลาก";
  dragHandle.setAttribute(
    "aria-label",
    `ลากเพื่อย้าย ${getSectionLabel(section)}`,
  );

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.className = "section-order-up";
  upButton.textContent = "↑";
  upButton.addEventListener("click", () => moveSection(section, -1));

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.className = "section-order-down";
  downButton.textContent = "↓";
  downButton.addEventListener("click", () => moveSection(section, 1));

  controls.append(dragHandle, upButton, downButton);
  section.prepend(controls);

  dragHandle.addEventListener("dragstart", (event) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", section.dataset.sectionOrderKey);
    section.classList.add("section-order-dragging");
  });

  dragHandle.addEventListener("dragend", () => {
    section.classList.remove("section-order-dragging");
    reorderableSections.forEach((item) =>
      item.classList.remove("section-order-target"),
    );
    syncSectionOrderFromDOM();
    updateSectionMoveButtons();
    saveSectionOrder();
  });

  section.addEventListener("dragover", (event) => {
    const draggedSection = mainContent.querySelector(
      ".section-order-dragging",
    )?.closest("[data-section-order-key]");
    if (!draggedSection || draggedSection === section) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const { top, height } = section.getBoundingClientRect();
    const insertAfter = event.clientY > top + height / 2;
    mainContent.insertBefore(
      draggedSection,
      insertAfter ? section.nextElementSibling : section,
    );
    section.classList.add("section-order-target");
  });

  section.addEventListener("dragleave", (event) => {
    if (!section.contains(event.relatedTarget)) {
      section.classList.remove("section-order-target");
    }
  });
}

if (mainContent && sectionOrderToggle && sectionOrderStatus) {
  const storedOrder = getSectionOrder();
  const orderedSections = [
    ...storedOrder
      .map((key) =>
        reorderableSections.find(
          (section) => section.dataset.sectionOrderKey === key,
        ),
      )
      .filter(Boolean),
    ...reorderableSections.filter(
      (section) =>
        !storedOrder.includes(section.dataset.sectionOrderKey),
    ),
  ];

  const siteStatsFooter = mainContent.querySelector(".site-stats");
  orderedSections.forEach((section) =>
    mainContent.insertBefore(section, siteStatsFooter),
  );
  reorderableSections.splice(0, reorderableSections.length, ...orderedSections);
  reorderableSections.forEach(addSectionOrderControls);
  updateSectionMoveButtons();

  sectionOrderToggle.addEventListener("click", () => {
    const isReordering =
      sectionOrderToggle.getAttribute("aria-pressed") === "true";
    const enableReordering = !isReordering;
    mainContent.classList.toggle("is-reordering-sections", enableReordering);
    sectionOrderToggle.setAttribute("aria-pressed", String(enableReordering));
    sectionOrderToggle.textContent = enableReordering
      ? "เสร็จสิ้น"
      : "จัดเรียงส่วน";
    sectionOrderStatus.hidden = !enableReordering;
    sectionOrderStatus.textContent = enableReordering
      ? "ใช้ปุ่มขึ้น/ลง หรือกดค้างที่ “ลาก” เพื่อย้ายส่วน"
      : "";
    if (sectionOrderReset) {
      sectionOrderReset.hidden = !enableReordering;
    }
  });

  sectionOrderReset?.addEventListener("click", resetSectionOrder);
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
