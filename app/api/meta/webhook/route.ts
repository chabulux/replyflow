import { NextRequest, NextResponse } from "next/server";
import {
  chooseInstagramReply,
  extractInstagramEvents,
  getMetaConfigStatus,
  sendInstagramMessage,
  verifyMetaSignature,
} from "@/lib/metaInstagram";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Webhook verification failed. Check META_VERIFY_TOKEN.",
      config: getMetaConfigStatus(),
    },
    { status: 403 },
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid Meta signature." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const events = extractInstagramEvents(payload);
  const deliveries = [];

  for (const event of events) {
    const reply = chooseInstagramReply(event.text);
    const delivery = await sendInstagramMessage(event.senderId, reply.text);
    deliveries.push({ event, reply, delivery });
  }

  return NextResponse.json({
    ok: true,
    received: events.length,
    autoSendEnabled: process.env.REPLYFLOW_AUTO_SEND === "true",
    deliveries,
  });
}
