// softreset request relay.
// The booking form posts its JSON here. This Worker checks it, posts a summary to a
// private Discord channel, and pings the two roles. The Discord webhook URL is a
// secret: it lives in a Worker secret, never in the website files.

const JSON_HEADERS = { "Content-Type": "application/json" };

// Discord limits: embed title 256, field name 256, field value 1024.
const LIMIT = { name: 80, handle: 80, issue: 1000, service: 60, label: 120, reply: 40 };

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function corsFor(origin, env) {
  const allowed = allowedOrigins(env);
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function send(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } });
}

function money(amount, currency) {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(amount);
}

// Returns { error } for a bad request, or a cleaned copy of the fields.
function check(body) {
  const services = (Array.isArray(body.services) ? body.services : [])
    .slice(0, 6)
    .map((s) => ({ name: clean(s && s.name, LIMIT.service), price: Number(s && s.price), includedIn: clean(s && s.includedIn, LIMIT.service) }))
    .filter((s) => s.name && Number.isFinite(s.price) && s.price >= 0 && s.price <= 10000);
  if (!services.length) return { error: "Choose a service first." };

  const customer = body.customer || {};
  const name = clean(customer.name, LIMIT.name);
  const issue = clean(body.issue, LIMIT.issue);
  if (!name) return { error: "Name is missing." };
  if (issue.length < 10) return { error: "Tell us what's going on." };

  const total = Number(body.total);
  const when = body.preferredTime && typeof body.preferredTime === "object"
    ? clean(body.preferredTime.label, LIMIT.label)
    : "";

  return {
    services,
    total: Number.isFinite(total) && total >= 0 && total <= 10000
      ? total
      : services.reduce((sum, s) => sum + s.price, 0),
    currency: clean(body.currency, 3).toUpperCase(),
    when: when || "No preference",
    name,
    replyOn: clean(customer.replyOn, LIMIT.reply) || "Not given",
    handle: clean(customer.handle, LIMIT.handle) || "Not given",
    issue,
  };
}

function embed(d) {
  const names = d.services.map((s) => s.name).join(", ");
  const lines = d.services
    .map((s) => s.name + ": " + (s.includedIn ? "included in " + s.includedIn : money(s.price, d.currency)))
    .join("\n");
  return {
    title: clean("New request: " + names, 250),
    color: 0x1d6bff,
    fields: [
      { name: "Services", value: clean(lines, 1000), inline: false },
      { name: "Total", value: money(d.total, d.currency), inline: true },
      { name: "Preferred time", value: d.when, inline: true },
      { name: "Name", value: d.name, inline: true },
      { name: "Reply on", value: d.replyOn, inline: true },
      { name: "Username there", value: d.handle, inline: true },
      { name: "What's going on", value: d.issue, inline: false },
    ],
    footer: {
      text: "Received " + new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) + " Central",
    },
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = allowedOrigins(env);
    const cors = corsFor(origin || "", env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    // Browsers always send Origin on cross-site posts. Other clients can fake it, so add a rate limit too (see README).
    if (origin && !allowed.includes(origin)) return send({ ok: false, error: "Origin not allowed." }, 403, cors);
    if (request.method !== "POST") return send({ ok: false, error: "Use POST." }, 405, cors);
    if (!env.DISCORD_WEBHOOK_URL) return send({ ok: false, error: "Relay is not set up yet." }, 503, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return send({ ok: false, error: "Could not read the request." }, 400, cors);
    }
    if (!body || typeof body !== "object") {
      return send({ ok: false, error: "Could not read the request." }, 400, cors);
    }

    const checked = check(body);
    if (checked.error) return send({ ok: false, error: checked.error }, 400, cors);

    const roles = [env.ROLE_ONE, env.ROLE_TWO].filter(Boolean);
    const pings = roles.map((id) => "<@&" + id + ">").join(" ");
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "softreset requests",
        content: pings ? pings + " New request" : "New request",
        allowed_mentions: { parse: [], roles },
        embeds: [embed(checked)],
      }),
    });
    if (!res.ok) return send({ ok: false, error: "Discord did not accept the request." }, 502, cors);
    return send({ ok: true }, 200, cors);
  },
};
