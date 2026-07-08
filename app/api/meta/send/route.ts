import { NextRequest, NextResponse } from "next/server";
import { sendInstagramMessage } from "@/lib/metaInstagram";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    recipientId?: string;
    text?: string;
  };

  const recipientId = body.recipientId?.trim();
  const text = body.text?.trim();

  if (!recipientId || !text) {
    return NextResponse.json(
      { ok: false, error: "recipientId and text are required." },
      { status: 400 },
    );
  }

  const result = await sendInstagramMessage(recipientId, text);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
