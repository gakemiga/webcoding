// Simple view router
function switchView(id){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-visible'));
  const el = document.getElementById(id);
  if(el){ el.classList.add('is-visible'); }
  document.querySelectorAll('.nav-link').forEach(b => {
    b.classList.toggle('is-active', b.dataset.target === id);
    if(b.dataset.target === id){ b.setAttribute('aria-current', 'page'); } else { b.removeAttribute('aria-current'); }
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if(t.matches('.nav-link')){ switchView(t.dataset.target); }
  if(t.matches('.to-ajuda')){ switchView('ajuda'); }
  if(t.matches('.to-comunidade')){ switchView('comunidade'); }
  if(t.matches('.to-profissionais')){ switchView('profissionais'); }
  if(t.matches('.exit-btn')){ window.location.href = 'https://www.google.com'; }
  if(t.matches('.qa')){
    const text = t.dataset.text || t.textContent;
    document.getElementById('msg').value = text;
    document.getElementById('chat-form').dispatchEvent(new Event('submit', {cancelable:true}));
  }
});

// ===== Chat streaming to local backend (Node server) =====
const chatWindow = document.querySelector('.chat-window');
const form = document.getElementById('chat-form');
const msgInput = document.getElementById('msg');
const history = [];

function addMsg(role, text){
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  wrap.innerHTML = `
    <div class="avatar" aria-hidden="true">${role === 'user' ? '🙂' : '🫶'}</div>
    <div class="bubble"></div>
  `;
  wrap.querySelector('.bubble').textContent = text;
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrap.querySelector('.bubble');
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if(!text) return;

  addMsg('user', text);
  msgInput.value = '';

  const botBubble = addMsg('assistant', ''); // placeholder

  try {
    const resp = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history })
    });

    if(!resp.ok || !resp.body){
      botBubble.textContent = 'Desculpe, não consegui conectar ao servidor. Verifique se o backend está rodando em http://localhost:3001';
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let acc = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      acc += chunk;
      botBubble.textContent = acc;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: acc });

  } catch (err) {
    botBubble.textContent = 'Erro de rede: ' + (err?.message || err);
  }
});
// ==== Seletores da sua página ====
const form = document.getElementById("chat-form");
const input = document.getElementById("msg");
const chat = document.querySelector(".chat-window");

// Adiciona uma mensagem na janela
function addMsg(text, who = "user") {
  const wrap = document.createElement("div");
  wrap.className = `msg ${who === "user" ? "user" : "bot"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = who === "user" ? "🙂" : "🫶";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

// Envio do formulário
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = (input?.value || "").trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";

  // placeholder de "digitando..."
  const thinking = document.createElement("div");
  thinking.className = "msg bot";
  thinking.innerHTML = `<div class="avatar" aria-hidden="true">🫶</div><div class="bubble">Digitando…</div>`;
  chat.appendChild(thinking);
  chat.scrollTop = chat.scrollHeight;

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente acolhedor para quem sofre com vício em slots. Seja empático, objetivo e lembre: em crise ligar 188 (CVV)."
          },
          { role: "user", content: text }
        ]
      })
    });

    const data = await resp.json();
    thinking.remove();

    if (!resp.ok) {
      addMsg(data.error || "Erro ao responder. Tente novamente.", "bot");
      return;
    }
    addMsg(data.reply || "…", "bot");
  } catch (err) {
    thinking.remove();
    addMsg("Erro de rede: Failed to fetch", "bot");
  }
});

// Botões de atalho (chips)
document.querySelectorAll(".chip.qa").forEach((btn) => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.text || btn.textContent;
    input.focus();
  });
});

// Navegação já existente no seu HTML (se a função existir)
document.querySelectorAll(".to-ajuda").forEach((b) =>
  b.addEventListener("click", () => window.switchView?.("ajuda"))
);
document.querySelectorAll(".to-comunidade").forEach((b) =>
  b.addEventListener("click", () => window.switchView?.("comunidade"))
);
document.querySelectorAll(".to-profissionais").forEach((b) =>
  b.addEventListener("click", () => window.switchView?.("profissionais"))
);
