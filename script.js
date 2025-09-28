// LOG para saber se o JS carregou
console.log("[app] script.js carregado");

// ===== Navegação entre telas =====
(function () {
  const views = document.querySelectorAll(".view");
  const navBtns = document.querySelectorAll(".nav .nav-link");

  function switchView(targetId) {
    views.forEach(v => v.classList.remove("is-visible"));
    const target = document.getElementById(targetId);
    if (target) target.classList.add("is-visible");

    navBtns.forEach(b => {
      const t = b.getAttribute("data-target");
      b.classList.toggle("is-active", t === targetId);
      if (t === targetId) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }
  // precisa ser global por causa do footer (onclick="switchView('home')")
  window.switchView = switchView;

  // botões do header
  navBtns.forEach(b => b.addEventListener("click", () => {
    const t = b.getAttribute("data-target");
    if (t) switchView(t);
  }));

  document.querySelectorAll(".to-ajuda").forEach(b =>
    b.addEventListener("click", () => switchView("ajuda"))
  );
  document.querySelectorAll(".to-comunidade").forEach(b =>
    b.addEventListener("click", () => switchView("comunidade"))
  );
  document.querySelectorAll(".to-profissionais").forEach(b =>
    b.addEventListener("click", () => switchView("profissionais"))
  );

  // garante que a HOME esteja visível no primeiro load
  if (!document.querySelector(".view.is-visible")) switchView("home");
})();

// ===== Chat (Ajuda Imediata) =====
(function () {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("msg");
  const chat = document.querySelector(".chat-window");

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

  if (!form) {
    console.warn("[app] chat-form não encontrado");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input?.value || "").trim();
    if (!text) return;

    addMsg(text, "user");
    input.value = "";

    // indicador de “digitando…”
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
            { role: "system", content: "Você é um assistente acolhedor para quem sofre com vício em slots. Em crise, 188 (CVV)." },
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
      console.error(err);
      addMsg("Erro de rede: Failed to fetch", "bot");
    }
  });

  // chips de atalho
  document.querySelectorAll(".chip.qa").forEach(btn => {
    btn.addEventListener("click", () => {
      if (input) {
        input.value = btn.dataset.text || btn.textContent || "";
        input.focus();
      }
    });
  });

  // sair rápido
  document.querySelectorAll(".exit-btn").forEach(b =>
    b.addEventListener("click", () => {
      if (input) input.value = "";
      window.switchView?.("home");
    })
  );
})();
