import { NextRequest, NextResponse } from "next/server";
import { chooseInstagramReply, getMetaConfigStatus } from "@/lib/metaInstagram";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { text?: string; senderId?: string };
  const text = body.text?.trim() || "price";
  const reply = chooseInstagramReply(text);

  return NextResponse.json({
    ok: true,
    input: {
      senderId: body.senderId?.trim() || "demo_instagram_user",
      text,
    },
    reply,
    config: getMetaConfigStatus(),
  });
}
