import { json } from "@remix-run/node";
import nodemailer from "nodemailer";
import { integrationCompanyId, integrationDatabase, methodNotAllowed } from "./integrations.server";
import { cleanLeadText, parseLead } from "./leadCore";
import { isSameOrigin } from "./trackCore";

export async function handleLead(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!isSameOrigin((name) => request.headers.get(name))) {
    return json({ ok: false, reason: "invalid" }, { status: 403 });
  }
  try {
    const raw = await request.text();
    if (raw.length > 24_000) return json({ ok: false, reason: "invalid" }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      if (request.headers.get("content-type")?.includes("application/json")) {
        body = JSON.parse(raw);
      } else {
        const form = new URLSearchParams(raw);
        body = Object.fromEntries(form);
        body.name = body.name ?? form.get("nombre");
        body.message = body.message ?? form.get("mensaje");
        body.company_id = body.company_id ?? integrationCompanyId();
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
    } catch {
      return json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    if (cleanLeadText(body.company_website, 200)) return json({ ok: true }, { status: 200 });
    const lead = parseLead(body);
    if (!lead || lead.company_id !== integrationCompanyId() || (body.privacy !== true && body.privacy !== "on")) {
      return json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const db = integrationDatabase();
    if (!db) return json({ ok: false, reason: "server" }, { status: 503 });
    const { error } = await db.from("lead").insert(lead);
    if (error) {
      console.error("[lead] insert failed", error.code);
      return json({ ok: false, reason: "server" }, { status: 500 });
    }
    // Mail failure must not turn a saved request into a failed submission.
    await notifyByEmail(lead);
    return json({ ok: true }, { status: 201 });
  } catch {
    console.error("[lead] submission unavailable");
    return json({ ok: false, reason: "server" }, { status: 500 });
  }
}

async function notifyByEmail(lead: NonNullable<ReturnType<typeof parseLead>>) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 3000, greetingTimeout: 3000, socketTimeout: 5000,
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER, to: "hola@fredericmartinez.com", replyTo: lead.email ?? undefined,
      subject: "Nueva solicitud desde la web",
      text: `Nombre: ${lead.name}\nEmail: ${lead.email ?? ""}\nTeléfono: ${lead.phone ?? ""}\n\n${lead.message ?? ""}`,
    });
  } catch {
    console.error("[lead] email notification unavailable; lead saved");
  }
}
