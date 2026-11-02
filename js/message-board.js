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
const expandedCommentCards = new Set();

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
  heart.setAttribute("aria-label", `กดหัวใจความคิดเห็นของ ${item.name}`);
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
        "โหลดความคิดเห็นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      ),
    );
    return;
  }

  const commentsByMessage = new Map();
  let commentsError = null;
  if (data.length) {
    const { data: comments, error: loadCommentsError } = await client
      .from("message_comments")
      .select("id, message_id, name, comment, created_at")
      .in(
        "message_id",
        data.map((item) => item.id),
      )
      .order("created_at", { ascending: true });

    if (loadCommentsError) {
      console.error("โหลดคอมเมนต์ไม่สำเร็จ", loadCommentsError);
      commentsError = loadCommentsError;
    } else {
      comments.forEach((comment) => {
        const messageComments = commentsByMessage.get(comment.message_id) ?? [];
        messageComments.push(comment);
        commentsByMessage.set(comment.message_id, messageComments);
      });
    }
  }

  renderTopLiked(data);

  const sortedMessages = [...data].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );

  messageCount.textContent = `${sortedMessages.length} ความคิดเห็น`;
  messageList.replaceChildren();

  if (!sortedMessages.length) {
    messageList.appendChild(
      makeElement(
        "p",
        "message-empty",
        "🌷 ยังไม่มีความคิดเห็น มาเริ่มพูดคุยกันได้เลย!",
      ),
    );
    return;
  }

  sortedMessages.forEach((item) => {
    item.message_comments = commentsByMessage.get(item.id) ?? [];
    const note = makeElement("article", "sticky-note");
    note.style.backgroundColor = getStickyColor(item.id);
    const tape = makeElement("div", "sticky-tape");
    const name = makeElement("p", "sticky-name", "ความคิดเห็นจากผู้ร่วมทริป");
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
    note.append(tape, name, content, footer, makeCommentsSection(item, commentsError));
    messageList.appendChild(note);
  });
}

function makeCommentsSection(item, commentsError) {
  const section = document.createElement("details");
  section.className = "message-comments";
  section.open = expandedCommentCards.has(item.id);
  section.addEventListener("toggle", () => {
    if (section.open) {
      expandedCommentCards.add(item.id);
    } else {
      expandedCommentCards.delete(item.id);
    }
  });
  const title = makeElement("summary", "message-comments-title");
  const label = makeElement("span", "", "คอมเมนต์");
  const count = makeElement(
    "span",
    "message-comments-count",
    String(item.message_comments?.length ?? 0),
  );
  title.append(label, count);
  const list = makeElement("div", "message-comments-list");
  const comments = [...(item.message_comments ?? [])].sort(
    (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
  );

  if (commentsError) {
    list.appendChild(
      makeElement(
        "p",
        "message-comments-empty",
        commentsError.code === "42P01" || commentsError.code === "PGRST205"
          ? "ระบบคอมเมนต์ยังไม่พร้อมใช้งาน กรุณาแจ้งผู้ดูแลระบบ"
          : "โหลดคอมเมนต์ไม่สำเร็จ กรุณารีเฟรชหน้า",
      ),
    );
  } else if (!comments.length) {
    list.appendChild(
      makeElement("p", "message-comments-empty", "ยังไม่มีคอมเมนต์"),
    );
  } else {
    comments.forEach((comment) => {
      const entry = makeElement("article", "message-comment");
      const author = makeElement(
        "strong",
        "message-comment-author",
        comment.name,
      );
      const text = makeElement("p", "message-comment-text", comment.comment);
      const date = makeElement(
        "time",
        "message-comment-date",
        new Date(comment.created_at).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
      );

      entry.append(author, text, date);
      list.appendChild(entry);
    });
  }

  const form = document.createElement("form");
  form.className = "message-comment-form";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 300;
  input.required = true;
  input.placeholder = "เขียนคอมเมนต์...";
  input.setAttribute("aria-label", `เขียนคอมเมนต์บนความคิดเห็น: ${item.message}`);
  const submit = makeElement("button", "message-comment-submit", "ส่ง");
  submit.type = "submit";
  input.disabled = Boolean(commentsError);
  submit.disabled = Boolean(commentsError);
  form.append(input, submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const comment = input.value.trim();
    if (!comment) return;

    submit.disabled = true;
    try {
      const { error } = await client.from("message_comments").insert({
        message_id: item.id,
        name: "ผู้ร่วมทริป",
        comment,
      });

      if (error) {
        console.error(error);
        alert("ส่งคอมเมนต์ไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      await loadMessages();
    } catch (error) {
      console.error(error);
      alert("ส่งคอมเมนต์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      submit.disabled = false;
    }
  });

  section.append(title, list, form);
  return section;
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
      alert("ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่");
      return;
    }

    messageForm.reset();
    await loadMessages();
  } catch (error) {
    console.error(error);
    alert("ส่งความคิดเห็นไม่สำเร็จ กรุณาลองใหม่");
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
      makeElement("p", "top-liked-empty", "💌 ยังไม่มีความคิดเห็น"),
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
