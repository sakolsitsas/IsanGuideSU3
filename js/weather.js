(() => {
  const cards = [...document.querySelectorAll(".trip-weather-card")];
  const refreshButton = document.getElementById("trip-weather-refresh");
  const statusElement = document.getElementById("trip-weather-status");

  if (!cards.length || !refreshButton || !statusElement) return;

  const weatherDescriptions = {
    0: ["ท้องฟ้าแจ่มใส", "☀️"],
    1: ["ส่วนใหญ่แจ่มใส", "🌤️"],
    2: ["มีเมฆบางส่วน", "⛅"],
    3: ["มีเมฆมาก", "☁️"],
    45: ["มีหมอก", "🌫️"],
    48: ["มีหมอก", "🌫️"],
    51: ["ฝนปรอยเล็กน้อย", "🌦️"],
    53: ["ฝนปรอย", "🌦️"],
    55: ["ฝนปรอยหนัก", "🌧️"],
    56: ["ฝนเยือกแข็งเล็กน้อย", "🌧️"],
    57: ["ฝนเยือกแข็ง", "🌧️"],
    61: ["ฝนตกเล็กน้อย", "🌧️"],
    63: ["ฝนตกปานกลาง", "🌧️"],
    65: ["ฝนตกหนัก", "🌧️"],
    66: ["ฝนเยือกแข็งเล็กน้อย", "🌧️"],
    67: ["ฝนเยือกแข็งหนัก", "🌧️"],
    71: ["หิมะตกเล็กน้อย", "🌨️"],
    73: ["หิมะตกปานกลาง", "🌨️"],
    75: ["หิมะตกหนัก", "❄️"],
    77: ["เกล็ดหิมะ", "❄️"],
    80: ["ฝนซู่เล็กน้อย", "🌦️"],
    81: ["ฝนซู่ปานกลาง", "🌧️"],
    82: ["ฝนซู่หนัก", "⛈️"],
    85: ["หิมะตกเป็นระยะ", "🌨️"],
    86: ["หิมะตกหนักเป็นระยะ", "❄️"],
    95: ["พายุฝนฟ้าคะนอง", "⛈️"],
    96: ["พายุฝนฟ้าคะนองและลูกเห็บ", "⛈️"],
    99: ["พายุฝนฟ้าคะนองและลูกเห็บหนัก", "⛈️"],
  };

  function formatValue(value, unit) {
    return typeof value === "number" && Number.isFinite(value)
      ? `${Math.round(value)}${unit}`
      : "—";
  }

  async function loadCard(card) {
    const { latitude, longitude, location } = card.dataset;
    const forecastRows = [...card.querySelectorAll(".trip-weather-forecast")];
    const parameters = new URLSearchParams({
      latitude,
      longitude,
      daily:
        "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max",
      forecast_days: "16",
      timezone: "Asia/Bangkok",
    });

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${parameters}`,
      );
      if (!response.ok) {
        throw new Error(`Weather request failed: ${response.status}`);
      }

      const data = await response.json();
      const forecast = data.daily;
      if (!forecast || !Array.isArray(forecast.time)) {
        throw new Error("Weather response is missing daily forecast");
      }

      let availableForecasts = 0;
      forecastRows.forEach((row) => {
        const dateIndex = forecast.time.indexOf(row.dataset.forecastDate);
        const iconElement = row.querySelector(".trip-weather-icon");
        const conditionElement = row.querySelector(".trip-weather-condition");
        const temperatureElement = row.querySelector(
          ".trip-weather-temperature",
        );
        const rainElement = row.querySelector(".trip-weather-rain");

        if (dateIndex < 0) {
          iconElement.textContent = "⌛";
          conditionElement.textContent = "พยากรณ์ยังไม่พร้อม";
          temperatureElement.textContent = "—";
          rainElement.textContent = "รอข้อมูลพยากรณ์";
          return;
        }

        const [description, icon] =
          weatherDescriptions[forecast.weather_code[dateIndex]] ||
          ["ไม่ทราบสภาพอากาศ", "🌡️"];
        iconElement.textContent = icon;
        conditionElement.textContent = description;
        temperatureElement.textContent =
          `${formatValue(forecast.temperature_2m_min[dateIndex], "°")}–${formatValue(forecast.temperature_2m_max[dateIndex], "°C")}`;
        rainElement.textContent =
          `โอกาสฝน ${formatValue(forecast.precipitation_probability_max[dateIndex], "%")}`;
        availableForecasts += 1;
      });

      card.setAttribute("aria-busy", "false");
      return { success: true, availableForecasts };
    } catch (error) {
      console.error(`โหลดสภาพอากาศ${location}ไม่สำเร็จ`, error);
      forecastRows.forEach((row) => {
        row.querySelector(".trip-weather-icon").textContent = "⌛";
        row.querySelector(".trip-weather-condition").textContent =
          "ยังไม่มีข้อมูล";
        row.querySelector(".trip-weather-temperature").textContent = "—";
        row.querySelector(".trip-weather-rain").textContent =
          "รอข้อมูลพยากรณ์";
      });
      card.setAttribute("aria-busy", "false");
      return { success: false, availableForecasts: 0 };
    }
  }

  async function updateWeather() {
    refreshButton.disabled = true;
    statusElement.textContent = "กำลังอัปเดตสภาพอากาศ...";
    cards.forEach((card) => card.setAttribute("aria-busy", "true"));

    const results = await Promise.all(cards.map(loadCard));
    const failedCount = results.filter((result) => !result.success).length;
    const availableForecasts = results.reduce(
      (total, result) => total + result.availableForecasts,
      0,
    );

    if (failedCount) {
      statusElement.textContent =
        failedCount === cards.length
          ? "ยังไม่มีข้อมูลพยากรณ์ในขณะนี้ · ข้อมูลจาก Open-Meteo"
          : `ยังไม่มีข้อมูลพยากรณ์ ${failedCount} จุด · ข้อมูลจาก Open-Meteo`;
    } else {
      statusElement.textContent = availableForecasts
        ? `พยากรณ์อัปเดตแล้ว · แสดงเฉพาะวันที่อยู่ในช่วงพยากรณ์ล่วงหน้าสูงสุด 16 วัน · Open-Meteo`
        : "พยากรณ์วันที่ 5–7 ธ.ค. ยังไม่พร้อม จะอัปเดตเมื่อเข้าใกล้วันเดินทาง · Open-Meteo";
    }

    refreshButton.disabled = false;
  }

  refreshButton.addEventListener("click", updateWeather);
  updateWeather();
  window.setInterval(updateWeather, 30 * 60 * 1000);
})();
