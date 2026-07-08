"use client";

import { useEffect, useMemo, useState } from "react";

export type Channel = "Instagram" | "WhatsApp" | "Website" | "Messenger";
export type FlowStatus = "Draft" | "Live" | "Paused";
export type BroadcastStatus = "Draft" | "Scheduled" | "Sent";

export type FlowNode = {
  id: string;
  kind: "trigger" | "message" | "condition" | "tag" | "handoff";
  title: string;
  body: string;
};

export type Flow = {
  id: string;
  name: string;
  trigger: string;
  status: FlowStatus;
  channel: Channel;
  starts: number;
  conversionRate: number;
  updatedAt: string;
  nodes: FlowNode[];
};

export type Contact = {
  id: string;
  name: string;
  channel: Channel;
  tags: string[];
  value: number;
  status: "New" | "Qualified" | "VIP" | "Needs reply";
  lastSeen: string;
  note: string;
};

export type ConversationMessage = {
  id: string;
  sender: "customer" | "team" | "automation";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  subject: string;
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  messages: ConversationMessage[];
};

export type Broadcast = {
  id: string;
  title: string;
  audience: string;
  channel: Channel;
  status: BroadcastStatus;
  scheduledFor: string;
  copy: string;
};

export type WorkspaceSettings = {
  businessName: string;
  timezone: string;
  defaultChannel: Channel;
  handoffEmail: string;
};

export type ReplyFlowState = {
  settings: WorkspaceSettings;
  flows: Flow[];
  contacts: Contact[];
  conversations: Conversation[];
  broadcasts: Broadcast[];
};

const STORAGE_KEY = "replyflow-local-workspace-v2";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export const seedReplyFlowState: ReplyFlowState = {
  settings: {
    businessName: "Nova Commerce",
    timezone: "Africa/Lagos",
    defaultChannel: "Instagram",
    handoffEmail: "sales@example.com",
  },
  flows: [
    {
      id: "flow_price_dm",
      name: "Price comment to DM",
      trigger: "Comment contains price",
      status: "Live",
      channel: "Instagram",
      starts: 2840,
      conversionRate: 18.6,
      updatedAt: "Today, 10:14",
      nodes: [
        {
          id: "node_price_trigger",
          kind: "trigger",
          title: "Comment trigger",
          body: "Starts when an Instagram comment includes price, cost, or how much.",
        },
        {
          id: "node_price_menu",
          kind: "message",
          title: "Send price menu",
          body: "Thanks for asking. Want the price list, available sizes, or delivery details?",
        },
        {
          id: "node_price_tag",
          kind: "tag",
          title: "Tag hot lead",
          body: "Adds high_intent, price_request, and source_instagram to the contact profile.",
        },
        {
          id: "node_price_handoff",
          kind: "handoff",
          title: "Notify sales",
          body: "Creates an inbox task if the buyer asks for payment, delivery, or stock.",
        },
      ],
    },
    {
      id: "flow_abandoned_checkout",
      name: "Abandoned checkout rescue",
      trigger: "Checkout started but unpaid",
      status: "Draft",
      channel: "WhatsApp",
      starts: 740,
      conversionRate: 11.2,
      updatedAt: "Yesterday, 18:30",
      nodes: [
        {
          id: "node_checkout_trigger",
          kind: "trigger",
          title: "Checkout trigger",
          body: "Starts 25 minutes after an unpaid checkout event.",
        },
        {
          id: "node_checkout_reply",
          kind: "message",
          title: "Send reminder",
          body: "Your cart is still reserved. Want me to help you complete payment?",
        },
      ],
    },
  ],
  contacts: [
    {
      id: "contact_amina",
      name: "Amina Bello",
      channel: "WhatsApp",
      tags: ["VIP", "repeat buyer"],
      value: 420000,
      status: "VIP",
      lastSeen: "2 min ago",
      note: "Wants early access to premium drops.",
    },
    {
      id: "contact_tunde",
      name: "Tunde Cole",
      channel: "Instagram",
      tags: ["hot lead", "price request"],
      value: 180000,
      status: "Needs reply",
      lastSeen: "11 min ago",
      note: "Asked for black set in medium.",
    },
    {
      id: "contact_adaeze",
      name: "Adaeze Okoro",
      channel: "Website",
      tags: ["returning", "jackets"],
      value: 95000,
      status: "Qualified",
      lastSeen: "1 hr ago",
      note: "Browsing outerwear.",
    },
    {
      id: "contact_musa",
      name: "Musa Danladi",
      channel: "Messenger",
      tags: ["wholesale", "callback"],
      value: 1200000,
      status: "Qualified",
      lastSeen: "Today",
      note: "Needs bulk order discussion.",
    },
  ],
  conversations: [
    {
      id: "conversation_tunde",
      contactId: "contact_tunde",
      subject: "Ready to buy black set",
      priority: "High",
      assignedTo: "Sales",
      messages: [
        {
          id: "msg_tunde_1",
          sender: "customer",
          text: "Hi, do you have the black set in medium?",
          time: "10:02",
        },
        {
          id: "msg_tunde_2",
          sender: "automation",
          text: "Yes — we can reserve it. Would you like pickup or delivery?",
          time: "10:02",
        },
        {
          id: "msg_tunde_3",
          sender: "customer",
          text: "Delivery. Send payment details please.",
          time: "10:04",
        },
      ],
    },
    {
      id: "conversation_amina",
      contactId: "contact_amina",
      subject: "VIP drop reminder",
      priority: "Medium",
      assignedTo: "Founder",
      messages: [
        {
          id: "msg_amina_1",
          sender: "automation",
          text: "Your private preview opens today. Want first look?",
          time: "09:14",
        },
        {
          id: "msg_amina_2",
          sender: "customer",
          text: "Yes, send the link.",
          time: "09:16",
        },
      ],
    },
  ],
  broadcasts: [
    {
      id: "broadcast_drop",
      title: "Friday drop reminder",
      audience: "VIP + waitlist",
      channel: "WhatsApp",
      status: "Scheduled",
      scheduledFor: "Fri, 10:00",
      copy: "Your private preview opens today. Reply YES for first access.",
    },
    {
      id: "broadcast_new_arrivals",
      title: "New arrivals",
      audience: "Instagram leads",
      channel: "Instagram",
      status: "Draft",
      scheduledFor: "Needs schedule",
      copy: "New pieces just landed. Want the lookbook?",
    },
  ],
};

function safeParseState(value: string | null): ReplyFlowState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as ReplyFlowState;
    if (!parsed.flows || !parsed.contacts || !parsed.conversations || !parsed.broadcasts) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useReplyFlowStore() {
  const [state, setState] = useState<ReplyFlowState>(seedReplyFlowState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = safeParseState(window.localStorage.getItem(STORAGE_KEY));
    if (saved) {
      setState(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const actions = useMemo(
    () => ({
      createFlow(name: string, channel: Channel, trigger: string) {
        const flow: Flow = {
          id: makeId("flow"),
          name,
          trigger,
          channel,
          status: "Draft",
          starts: 0,
          conversionRate: 0,
          updatedAt: "Just now",
          nodes: [
            {
              id: makeId("node"),
              kind: "trigger",
              title: "New trigger",
              body: trigger || "Define the event that starts this automation.",
            },
            {
              id: makeId("node"),
              kind: "message",
              title: "First reply",
              body: "Write the first message your customer receives.",
            },
          ],
        };

        setState((current) => ({ ...current, flows: [flow, ...current.flows] }));
        return flow.id;
      },
      updateFlow(id: string, patch: Partial<Pick<Flow, "name" | "trigger" | "channel" | "status">>) {
        setState((current) => ({
          ...current,
          flows: current.flows.map((flow) =>
            flow.id === id ? { ...flow, ...patch, updatedAt: "Just now" } : flow,
          ),
        }));
      },
      addNode(flowId: string, kind: FlowNode["kind"]) {
        const titles: Record<FlowNode["kind"], string> = {
          trigger: "New trigger",
          message: "Send message",
          condition: "Add condition",
          tag: "Apply tag",
          handoff: "Human handoff",
        };
        const bodies: Record<FlowNode["kind"], string> = {
          trigger: "Define the event that starts this flow.",
          message: "Write the message customers should receive.",
          condition: "Branch the path based on customer behavior.",
          tag: "Add or remove CRM tags for segmentation.",
          handoff: "Notify a team member and move the chat to the inbox.",
        };
        const node: FlowNode = { id: makeId("node"), kind, title: titles[kind], body: bodies[kind] };

        setState((current) => ({
          ...current,
          flows: current.flows.map((flow) =>
            flow.id === flowId ? { ...flow, nodes: [...flow.nodes, node], updatedAt: "Just now" } : flow,
          ),
        }));
      },
      updateNode(flowId: string, nodeId: string, patch: Partial<Pick<FlowNode, "title" | "body">>) {
        setState((current) => ({
          ...current,
          flows: current.flows.map((flow) =>
            flow.id === flowId
              ? {
                  ...flow,
                  updatedAt: "Just now",
                  nodes: flow.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
                }
              : flow,
          ),
        }));
      },
      removeNode(flowId: string, nodeId: string) {
        setState((current) => ({
          ...current,
          flows: current.flows.map((flow) =>
            flow.id === flowId
              ? { ...flow, nodes: flow.nodes.filter((node) => node.id !== nodeId), updatedAt: "Just now" }
              : flow,
          ),
        }));
      },
      addContact(contact: Omit<Contact, "id" | "lastSeen" | "tags"> & { tags: string }) {
        const tags = contact.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        setState((current) => ({
          ...current,
          contacts: [
            {
              ...contact,
              id: makeId("contact"),
              tags,
              lastSeen: "Just now",
            },
            ...current.contacts,
          ],
        }));
      },
      sendMessage(conversationId: string, text: string) {
        if (!text.trim()) return;
        setState((current) => ({
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: [
                    ...conversation.messages,
                    { id: makeId("msg"), sender: "team", text: text.trim(), time: "Now" },
                  ],
                }
              : conversation,
          ),
        }));
      },
      createBroadcast(broadcast: Omit<Broadcast, "id" | "status">) {
        setState((current) => ({
          ...current,
          broadcasts: [{ ...broadcast, id: makeId("broadcast"), status: "Draft" }, ...current.broadcasts],
        }));
      },
      updateBroadcastStatus(id: string, status: BroadcastStatus) {
        setState((current) => ({
          ...current,
          broadcasts: current.broadcasts.map((broadcast) =>
            broadcast.id === id ? { ...broadcast, status } : broadcast,
          ),
        }));
      },
      updateSettings(settings: WorkspaceSettings) {
        setState((current) => ({ ...current, settings }));
      },
      resetDemo() {
        setState(seedReplyFlowState);
      },
    }),
    [],
  );

  return { state, hydrated, actions };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}
