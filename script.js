const resp = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "Você é um assistente acolhedor para quem sofre com vício em slots. Em crise, 188 (CVV)." },
      { role: "user", content: text } // 'text' é o que veio do input
    ]
  })
});
const data = await resp.json();
addMsg(data.reply || "…", "bot");
