import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are RCC.Ai, the helpful customer assistant for RCC Colab Solutions Inc., a technology services company in Makati, Philippines.

Company facts:
- Services: application modernization, custom software development, staff augmentation, IT strategy and consulting, RPA, cloud solutions and migration, system integration, managed IT services, QA and software testing, POS and kiosk systems, and data analytics and business intelligence.
- Address: 7/F Ascott Makati Glorietta 4, Ayala Center San Lorenzo, Makati City, Philippines.
- Phone: +632 8651 6572.
- Email: info@rcccolabsolutions.com.
- Office hours: Monday-Friday, 8:00 AM-7:00 PM. Managed IT support is available 24/7.
- Pricing is customized according to scope. Offer to connect the visitor through the contact form for a quote.

Answer client questions clearly and warmly. Ask a short follow-up question when the request is unclear. Never invent company facts, prices, guarantees, legal advice, or technical commitments. If you do not know, say so and direct the client to info@rcccolabsolutions.com. Keep replies concise and use plain text.`;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return response.status(500).json({ error: "OPENAI_API_KEY is not configured" });

  const messages = Array.isArray(request.body?.messages) ? request.body.messages.slice(-12) : [];
  if (!messages.length) return response.status(400).json({ error: "A message is required" });

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.4, max_tokens: 500, messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages] }),
  });
  if (!aiResponse.ok) return response.status(502).json({ error: "AI provider request failed" });

  const result = await aiResponse.json();
  return response.status(200).json({ reply: result.choices?.[0]?.message?.content || "Please contact info@rcccolabsolutions.com for assistance." });
}