import crypto from "node:crypto";

export type InstagramAutomationReply = {
  label: string;
  text: string;
  tags: string[];
  handoff: boolean;
};

export type InstagramIncomingEvent = {
  senderId: string;
  recipientId?: string;
  text: string;
  source: "message" | "postback" | "comment" | "unknown";
  timestamp?: number;
};

export type InstagramSendResult = {
  ok: boolean;
  dryRun?: boolean;
  skipped?: boolean;
  status?: number;
  response?: unknown;
  error?: string;
};

export function getMetaConfigStatus() {
  return {
    verifyTokenConfigured: Boolean(process.env.META_VERIFY_TOKEN),
    pageAccessTokenConfigured: Boolean(process.env.META_PAGE_ACCESS_TOKEN),
    appSecretConfigured: Boolean(process.env.META_APP_SECRET),
    autoSendEnabled: process.env.REPLYFLOW_AUTO_SEND === "true",
    graphVersion: process.env.META_GRAPH_API_VERSION || "v21.0",
    webhookPath: "/api/meta/webhook",
  };
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return true;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expectedSignature =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const actual = Buffer.from(signatureHeader);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function extractInstagramEvents(payload: unknown): InstagramIncomingEvent[] {
  const root = asRecord(payload);
  const entries = asArray(root.entry);
  const events: InstagramIncomingEvent[] = [];

  for (const entryValue of entries) {
    const entry = asRecord(entryValue);

    for (const itemValue of asArray(entry.messaging)) {
      const item = asRecord(itemValue);
      const sender = asRecord(item.sender);
      const recipient = asRecord(item.recipient);
      const message = asRecord(item.message);
      const postback = asRecord(item.postback);
      const text = asString(message.text) || asString(postback.payload);

      if (asString(sender.id) && text) {
        events.push({
          senderId: asString(sender.id),
          recipientId: asString(recipient.id),
          text,
          source: asString(message.text) ? "message" : "postback",
          timestamp: typeof item.timestamp === "number" ? item.timestamp : undefined,
        });
      }
    }

    for (const changeValue of asArray(entry.changes)) {
      const change = asRecord(changeValue);
      const value = asRecord(change.value);
      const from = asRecord(value.from);
      const text =
        asString(value.text) ||
        asString(value.message) ||
        asString(value.comment_text) ||
        asString(value.caption);

      if (asString(from.id) && text) {
        events.push({
          senderId: asString(from.id),
          text,
          source: asString(change.field).includes("comment") ? "comment" : "unknown",
          timestamp: typeof value.created_time === "number" ? value.created_time : undefined,
        });
      }
    }
  }

  return events;
}

export function chooseInstagramReply(text: string): InstagramAutomationReply {
  const normalized = text.toLowerCase();

  if (/(price|cost|how much|amount|rate|₦|\$)/i.test(normalized)) {
    return {
      label: "Price request",
      text:
        "Thanks for asking. I can send price, size availability, and delivery options. What size are you looking for?",
      tags: ["price_request", "hot_lead"],
      handoff: false,
    };
  }

  if (/(size|sizes|medium|large|small|xl|measurement)/i.test(normalized)) {
    return {
      label: "Size guide",
      text:
        "Absolutely. Tell me your waist/chest size and preferred fit, and I’ll confirm the best option for you.",
      tags: ["size_request"],
      handoff: false,
    };
  }

  if (/(order|buy|purchase|checkout|pay|payment|bank|transfer)/i.test(normalized)) {
    return {
      label: "Order intent",
      text:
        "Perfect. To place your order, send your name, size, location, and preferred payment method. A team member can help you finish it.",
      tags: ["ready_to_buy", "needs_handoff"],
      handoff: true,
    };
  }

  if (/(delivery|ship|shipping|location|lagos|abuja)/i.test(normalized)) {
    return {
      label: "Delivery question",
      text:
        "Yes, delivery is available. Send your city and I’ll confirm delivery timing and cost.",
      tags: ["delivery_request"],
      handoff: false,
    };
  }

  if (/(link|website|catalog|catalogue|lookbook)/i.test(normalized)) {
    return {
      label: "Link request",
      text:
        "Here’s the next step: tell me the item you want and I’ll send the right product/order link.",
      tags: ["link_request"],
      handoff: false,
    };
  }

  return {
    label: "General reply",
    text:
      "Thanks for reaching out. Are you looking for price, size, delivery, or help placing an order?",
    tags: ["new_instagram_lead"],
    handoff: false,
  };
}

export async function sendInstagramMessage(recipientId: string, text: string): Promise<InstagramSendResult> {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v21.0";

  if (!pageAccessToken) {
    return {
      ok: false,
      skipped: true,
      error: "META_PAGE_ACCESS_TOKEN is not configured.",
    };
  }

  if (process.env.REPLYFLOW_AUTO_SEND !== "true") {
    return {
      ok: true,
      dryRun: true,
      response: {
        recipientId,
        text,
        note: "Auto-send is disabled. Set REPLYFLOW_AUTO_SEND=true to send real Instagram messages.",
      },
    };
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/me/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });

  const responseText = await response.text();
  let parsed: unknown = responseText;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    // Keep raw text when Meta does not return JSON.
  }

  return {
    ok: response.ok,
    status: response.status,
    response: parsed,
    error: response.ok ? undefined : "Meta Graph API returned an error.",
  };
}
