import { NextResponse } from "next/server";
import { getMetaConfigStatus } from "@/lib/metaInstagram";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    config: getMetaConfigStatus(),
    checklist: [
      "Set META_VERIFY_TOKEN in .env.local",
      "Create a Meta Developer app",
      "Connect an Instagram professional account to a Facebook Page",
      "Add your webhook URL in Meta dashboard",
      "Add META_PAGE_ACCESS_TOKEN after generating a Page access token",
      "Set REPLYFLOW_AUTO_SEND=true only when ready to send real messages",
    ],
  });
}
