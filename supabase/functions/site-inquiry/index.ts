const allowedOrigins = new Set([
  "https://beths-pet-store.vercel.app",
  "https://beths-pet-store-git-marketplace-foundation-ecohubngs-projects.vercel.app"
]);
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});

const json = (status: number, payload: Record<string, unknown>, origin: string) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" }
  });

const clean = (value: unknown, max: number) =>
  String(value ?? "").replace(/\0/g, "").replace(/\r\n?/g, "\n").trim().slice(0, max);

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) return new Response(JSON.stringify({ error: "This site origin is not allowed." }), { status: 403 });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." }, origin);

  const contentType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return json(415, { error: "Send the form as JSON." }, origin);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 8000) return json(413, { error: "The message is too large." }, origin);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(400, { error: "The form could not be read. Please try again." }, origin);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "The form could not be read. Please try again." }, origin);
  }

  if (clean(body.company_website, 200)) return json(202, { ok: true }, origin);

  const category = clean(body.category, 20);
  const name = clean(body.name, 100).replace(/\s+/g, " ");
  const email = clean(body.email, 254).toLowerCase();
  const subject = clean(body.subject, 120).replace(/\s+/g, " ");
  const message = clean(body.message, 3000);

  if (!["contact", "support", "feedback"].includes(category)) {
    return json(400, { error: "Choose a valid enquiry type." }, origin);
  }
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      subject.length < 3 || message.length < 20) {
    return json(400, { error: "Please complete each field with valid details. Messages must be at least 20 characters." }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(503, { error: "The enquiry service is not configured yet." }, origin);

  try {
    const submitResponse = await fetch(new URL("/rest/v1/rpc/submit_site_inquiry", supabaseUrl), {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_category: category,
        p_name: name,
        p_email: email,
        p_subject: subject,
        p_message: message
      })
    });

    if (submitResponse.status === 429) {
      return json(429, { error: "Too many messages from this email address. Please try again later." }, origin);
    }
    if (!submitResponse.ok) return json(503, { error: "We couldn't save your message just now. Please try again later." }, origin);

    return json(201, {
      ok: true,
      message: "Thank you. Your message has been securely recorded for the Beth's Pet Store team."
    }, origin);
  } catch {
    return json(503, { error: "The enquiry service is temporarily unavailable. Please try again later." }, origin);
  }
});
