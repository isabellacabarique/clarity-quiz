// Clarity Quiz – entrega tokens temporales de Azure Speech al quiz.
// La clave de Azure nunca sale de aquí: el navegador solo recibe un token que vence en 10 minutos.
//
// Configura en Cloudflare (Settings → Variables and Secrets):
//   AZURE_KEY        (Secret)  la "Key 1" de tu recurso de Speech en Azure
//   AZURE_REGION     (Text)    la región del recurso, por ejemplo: eastus
//   ALLOWED_ORIGINS  (Text)    https://isabellacabarique.github.io,https://quiz.immersa.com.co

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : (allowed[0] || ""),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!ok) return new Response("Forbidden", { status: 403, headers: cors });

    const res = await fetch(`https://${env.AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": env.AZURE_KEY, "Content-Length": "0" },
    });
    if (!res.ok) return new Response("Token error", { status: 502, headers: cors });
    const token = await res.text();
    return new Response(JSON.stringify({ token, region: env.AZURE_REGION }), {
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  },
};
