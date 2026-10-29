const SUPABASE_URL = "https://noodiehkzklwacfdzytw.supabase.co";
const SUPABASE_KEY = "sb_publishable_8wxViIzC-xjoEX6xMJXDhA_enwdWF1x";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const messageForm = document.getElementById("messageForm");
const messageText = document.getElementById("messageText");
const messageList = document.getElementById("messageList");
const messageCount = document.getElementById("messageCount");
const submitButton = messageForm.querySelector('button[type="submit"]');

const client = supabaseClient;
const VOTER_KEY = "isan-tour-voter-id";

function getVoterId() {
  const storage = getStorage();

  let id = storage ? storage.getItem(VOTER_KEY) : null;

  if (!id) {
    id = generateVoterId();

    if (storage) {
      storage.setItem(VOTER_KEY, id);
    }
  }

  return id;
}

const voterId = getVoterId();

function getStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function generateVoterId() {
  const cryptoRef = window.crypto;

  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }

  if (cryptoRef && typeof cryptoRef.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoRef.getRandomValues(bytes);
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

  return `guest-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getLikeCount(item) {
  return item.message_likes?.length ?? 0;
}

function makeLikeButton(item) {
  const likes = getLikeCount(item);
  const liked =
    item.message_likes?.some((like) => like.voter_id === voterId) ?? false;
  const heart = makeElement(
    "button",
    `heart-button${liked ? " liked" : ""}`,
    `${liked ? "❤️" : "🤍"} ${likes}`,
  );

  heart.type = "button";
  heart.disabled = liked;
  heart.setAttribute("aria-label", `กดหัวใจข้อความของ ${item.name}`);
  heart.addEventListener("click", async () => {
    if (liked) return;

    heart.disabled = true;

    try {
      const { error } = await client.from("message_likes").insert({
        message_id: item.id,
        voter_id: voterId,
      });

      if (error && error.code !== "23505") {
        console.error(error);
        alert("กดหัวใจไม่สำเร็จ กรุณาลองใหม่");
        heart.disabled = false;
        return;
      }

      await loadMessages();
    } catch (error) {
      console.error(error);
      alert("กดหัวใจไม่สำเร็จ กรุณาลองใหม่");
      heart.disabled = false;
    }
  });

  return heart;
}

async function loadMessages() {
  const { data, error } = await client
    .from("messages")
    .select("id, name, message, created_at, message_likes(id, voter_id)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    messageList.replaceChildren(
      makeElement(
        "p",
        "message-empty",
        "โหลดข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      ),
    );
    return;
  }

  renderTopLiked(data);

  const sortedMessages = [...data].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );

  messageCount.textContent = `${sortedMessages.length} ข้อความ`;
  messageList.replaceChildren();

  if (!sortedMessages.length) {
    messageList.appendChild(
      makeElement(
        "p",
        "message-empty",
        "🌷 ยังไม่มีข้อความ มาเป็นคนแรกกันเลย!",
      ),
    );
    return;
  }

  sortedMessages.forEach((item) => {
    const note = makeElement("article", "sticky-note");
    note.style.backgroundColor = getStickyColor(item.id);
    const tape = makeElement("div", "sticky-tape");
    const name = makeElement("p", "sticky-name", "ข้อความจากผู้ร่วมทริป");
    const content = makeElement("p", "sticky-text", item.message);
    const footer = makeElement("div", "sticky-footer");

    const date = makeElement(
      "span",
      "sticky-date",
      new Date(item.created_at).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      }),
    );

    const heart = makeLikeButton(item);

    footer.append(date, heart);
    note.append(tape, name, content, footer);
    messageList.appendChild(note);
  });
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageText.value.trim();

  if (!message) return;

  submitButton.disabled = true;

  try {
    const { error } = await client
      .from("messages")
      .insert({ name: "ไม่ระบุชื่อ", message });

    if (error) {
      console.error(error);
      alert("ฝากข้อความไม่สำเร็จ กรุณาลองใหม่");
      return;
    }

    messageForm.reset();
    await loadMessages();
  } catch (error) {
    console.error(error);
    alert("ฝากข้อความไม่สำเร็จ กรุณาลองใหม่");
  } finally {
    submitButton.disabled = false;
  }
});

loadMessages();

// ตรวจข้อความใหม่จากผู้ใช้คนอื่นทุก 10 วินาที
setInterval(loadMessages, 10000);

function getStickyColor(id) {
  const colors = [
    "#FFF3A3", // เหลือง
    "#FFDDE1", // ชมพู
    "#D9F4D0", // เขียว
    "#DCEBFF", // ฟ้า
    "#E9DEFF", // ม่วง
    "#FFE4C7", // ส้ม
  ];

  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }

  return colors[Math.abs(hash) % colors.length];
}

function renderTopLiked(data) {
  const container = document.getElementById("topLikedList");
  if (!container) return;

  const topThree = [...data]
    .sort(
      (a, b) =>
        getLikeCount(b) - getLikeCount(a) ||
        Date.parse(a.created_at) - Date.parse(b.created_at),
    )
    .slice(0, 3);

  container.replaceChildren();

  if (!topThree.length) {
    container.appendChild(
      makeElement("p", "top-liked-empty", "💌 ยังไม่มีข้อความ"),
    );
    return;
  }

  const ranks = ["🥇 อันดับ 1", "🥈 อันดับ 2", "🥉 อันดับ 3"];

  topThree.forEach((item, index) => {
    const card = makeElement("article", "top-liked-card");
    card.style.backgroundColor = getStickyColor(item.id);

    const rank = makeElement("p", "top-liked-rank", ranks[index]);
    const message = makeElement("p", "top-liked-message", item.message);
    const footer = makeElement("div", "top-liked-footer");
    const date = makeElement(
      "span",
      "",
      new Date(item.created_at).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      }),
    );
    const likes = makeLikeButton(item);

    footer.append(date, likes);
    card.append(rank, message, footer);
    container.appendChild(card);
  });
}
