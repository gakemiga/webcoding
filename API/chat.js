// /api/chat.js — usando Groq (compatível com schema da OpenAI)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages inválido" });
    }

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // modelos bons e gratuitos da Groq (troque se quiser):
        // "llama-3.1-8b-instant" = rápido e barato
        // "llama-3.1-70b-versatile" = melhor qualidade (limites maiores de latência/uso)
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("Groq error:", data);
      return res.status(r.status).json({ error: data.error?.message || "Erro na Groq" });
    }

    const content = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply: content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
}
