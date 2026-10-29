function showSecretHint(card) {
  if (!card) return;

  const message = document.getElementById("secret-message");
  if (!message) return;

  const hints = [
    "🔍 รู้มากไปแล้ว... แต่ยังไม่ถึงเวลาเปิดเผย!",
    "🤫 ภารกิจนี้จะไม่ง่ายอย่างที่คิด",
    "👀 จะกดทำไม ไม่มีอะไรร ยังไม่ได้คิดดด !",
  ];

  const parent = card.parentElement;
  const index = parent ? Array.from(parent.children).indexOf(card) : 0;
  message.textContent = hints[index] || hints[0];

  if (typeof card.animate === "function") {
    card.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(3px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 220 },
    );
  }
}
