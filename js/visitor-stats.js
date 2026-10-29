const SUPABASE_URL = "https://noodiehkzklwacfdzytw.supabase.co";
const SUPABASE_KEY = "sb_publishable_8wxViIzC-xjoEX6xMJXDhA_enwdWF1x";
const VISITOR_KEY = "isan-tour-visitor-id";
const SESSION_KEY = "isan-tour-visit-session-id";

const visitCountElement = document.getElementById("siteVisitCount");
const activeCountElement = document.getElementById("siteActiveCount");
const statusElement = document.getElementById("siteStatsStatus");

function createId() {
  const bytes = new Uint8Array(16);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function getOrCreateId(storageName, key) {
  let storage;

  try {
    storage = window[storageName];
    const storedId = storage.getItem(key);
    if (storedId) return storedId;

    const id = createId();
    storage.setItem(key, id);
    return id;
  } catch (error) {
    console.warn(`Visitor statistics could not access ${storageName}.`, error);
    return createId();
  }
}

function setStatus(message) {
  if (statusElement) statusElement.textContent = message;
}

if (visitCountElement && activeCountElement && statusElement) {
  if (!window.supabase?.createClient) {
    setStatus("ไม่สามารถเชื่อมต่อระบบสถิติได้");
    console.error("Supabase client is unavailable for visitor statistics.");
  } else {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const visitorId = getOrCreateId("localStorage", VISITOR_KEY);
    const sessionId = getOrCreateId("sessionStorage", SESSION_KEY);

    let requestInFlight = false;
    let queuedActivity = null;

    async function trackActivity(countVisit, isActive) {
      if (requestInFlight) {
        queuedActivity = {
          countVisit: countVisit || queuedActivity?.countVisit || false,
          isActive,
        };
        return;
      }

      requestInFlight = true;

      try {
        const { data, error } = await client.rpc("track_site_activity", {
          p_visitor_id: visitorId,
          p_session_id: sessionId,
          p_count_visit: countVisit,
          p_is_active: isActive,
        });

        if (error) throw error;

        const stats = Array.isArray(data) ? data[0] : data;
        const totalVisits = Number(stats?.total_visits);
        const activeUsers = Number(stats?.active_users);

        if (!Number.isFinite(totalVisits) || !Number.isFinite(activeUsers)) {
          throw new Error("Supabase returned invalid visitor statistics.");
        }

        visitCountElement.textContent = totalVisits.toLocaleString("th-TH");
        activeCountElement.textContent = activeUsers.toLocaleString("th-TH");
        setStatus("อัปเดตแบบเรียลไทม์");
      } catch (error) {
        console.error("Unable to load visitor statistics.", error);
        setStatus("โหลดสถิติไม่สำเร็จ");
      } finally {
        requestInFlight = false;

        if (queuedActivity) {
          const nextActivity = queuedActivity;
          queuedActivity = null;
          trackActivity(nextActivity.countVisit, nextActivity.isActive);
        }
      }
    }

    trackActivity(true, document.visibilityState === "visible");
    setInterval(() => {
      trackActivity(false, document.visibilityState === "visible");
    }, 30000);

    document.addEventListener("visibilitychange", () => {
      trackActivity(false, document.visibilityState === "visible");
    });
  }
}
