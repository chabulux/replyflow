"use client";

import {
  ArrowLeft,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  Database,
  Eye,
  Inbox,
  Layers3,
  MessageCircle,
  MessageSquareText,
  Pause,
  Play,
  Plus,
  RadioTower,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  UsersRound,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type BroadcastStatus,
  type Channel,
  type FlowNode,
  formatCurrency,
  useReplyFlowStore,
} from "@/lib/replyflowStore";

type DashboardTab = "overview" | "flows" | "contacts" | "inbox" | "broadcasts" | "instagram" | "settings";

const tabs: Array<{ id: DashboardTab; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "flows", label: "Flows", icon: Command },
  { id: "contacts", label: "Contacts", icon: UsersRound },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "broadcasts", label: "Broadcasts", icon: RadioTower },
  { id: "instagram", label: "Instagram", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const channels: Channel[] = ["Instagram", "WhatsApp", "Website", "Messenger"];
const nodeKinds: FlowNode["kind"][] = ["message", "condition", "tag", "handoff"];

type MetaStatus = {
  ok: boolean;
  config: {
    verifyTokenConfigured: boolean;
    pageAccessTokenConfigured: boolean;
    appSecretConfigured: boolean;
    autoSendEnabled: boolean;
    graphVersion: string;
    webhookPath: string;
  };
  checklist: string[];
};

type SimulationResult = {
  ok: boolean;
  input: { senderId: string; text: string };
  reply: { label: string; text: string; tags: string[]; handoff: boolean };
  config: MetaStatus["config"];
};

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function DashboardMetric({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rf-metric">
      <span><Icon size={18} /></span>
      <p>{label}</p>
      <strong>{value}</strong>
      <em>{change}</em>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`rf-status rf-status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export default function DashboardPage() {
  const { state, hydrated, actions } = useReplyFlowStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedFlowId, setSelectedFlowId] = useState(state.flows[0]?.id ?? "");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(state.conversations[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [metaStatus, setMetaStatus] = useState<MetaStatus | null>(null);
  const [simulationText, setSimulationText] = useState("price");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedFlow = state.flows.find((flow) => flow.id === selectedFlowId) ?? state.flows[0];
  const selectedNode = selectedFlow?.nodes.find((node) => node.id === selectedNodeId) ?? selectedFlow?.nodes[0];
  const selectedConversation =
    state.conversations.find((conversation) => conversation.id === selectedConversationId) ?? state.conversations[0];

  useEffect(() => {
    if (!selectedFlowId && state.flows[0]) setSelectedFlowId(state.flows[0].id);
    if (selectedFlowId && !state.flows.some((flow) => flow.id === selectedFlowId) && state.flows[0]) {
      setSelectedFlowId(state.flows[0].id);
    }
  }, [selectedFlowId, state.flows]);

  useEffect(() => {
    if (!selectedNodeId && selectedFlow?.nodes[0]) setSelectedNodeId(selectedFlow.nodes[0].id);
    if (selectedNodeId && selectedFlow && !selectedFlow.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(selectedFlow.nodes[0]?.id ?? "");
    }
  }, [selectedFlow, selectedNodeId]);

  useEffect(() => {
    if (!selectedConversationId && state.conversations[0]) setSelectedConversationId(state.conversations[0].id);
  }, [selectedConversationId, state.conversations]);

  useEffect(() => {
    fetch("/api/meta/status")
      .then((response) => response.json())
      .then((data: MetaStatus) => setMetaStatus(data))
      .catch(() => setMetaStatus(null));
  }, []);

  const totals = useMemo(() => {
    const totalValue = state.contacts.reduce((sum, contact) => sum + contact.value, 0);
    const liveFlows = state.flows.filter((flow) => flow.status === "Live").length;
    const needsReply = state.contacts.filter((contact) => contact.status === "Needs reply").length;
    const avgConversion = state.flows.length
      ? state.flows.reduce((sum, flow) => sum + flow.conversionRate, 0) / state.flows.length
      : 0;

    return { totalValue, liveFlows, needsReply, avgConversion };
  }, [state.contacts, state.flows]);

  const filteredContacts = useMemo(() => {
    const term = search.toLowerCase();
    return state.contacts.filter((contact) =>
      [contact.name, contact.channel, contact.status, contact.note, ...contact.tags].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [search, state.contacts]);

  function handleCreateFlow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = getFormString(formData, "name") || "Untitled automation";
    const trigger = getFormString(formData, "trigger") || "New customer message";
    const channel = (getFormString(formData, "channel") || state.settings.defaultChannel) as Channel;
    const id = actions.createFlow(name, channel, trigger);
    setSelectedFlowId(id);
    setActiveTab("flows");
    event.currentTarget.reset();
  }

  function handleAddContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    actions.addContact({
      name: getFormString(formData, "name") || "New contact",
      channel: (getFormString(formData, "channel") || "Instagram") as Channel,
      tags: getFormString(formData, "tags") || "new lead",
      value: Number(getFormString(formData, "value") || 0),
      status: (getFormString(formData, "status") || "New") as "New" | "Qualified" | "VIP" | "Needs reply",
      note: getFormString(formData, "note") || "Added manually from dashboard.",
    });
    event.currentTarget.reset();
  }

  function handleSendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation) return;
    actions.sendMessage(selectedConversation.id, replyDraft);
    setReplyDraft("");
  }

  function handleCreateBroadcast(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    actions.createBroadcast({
      title: getFormString(formData, "title") || "Untitled broadcast",
      audience: getFormString(formData, "audience") || "All contacts",
      channel: (getFormString(formData, "channel") || "WhatsApp") as Channel,
      scheduledFor: getFormString(formData, "scheduledFor") || "Needs schedule",
      copy: getFormString(formData, "copy") || "Write your message copy here.",
    });
    event.currentTarget.reset();
  }

  function handleSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    actions.updateSettings({
      businessName: getFormString(formData, "businessName") || state.settings.businessName,
      timezone: getFormString(formData, "timezone") || state.settings.timezone,
      defaultChannel: (getFormString(formData, "defaultChannel") || state.settings.defaultChannel) as Channel,
      handoffEmail: getFormString(formData, "handoffEmail") || state.settings.handoffEmail,
    });
  }

  async function handleSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSimulating(true);

    try {
      const response = await fetch("/api/meta/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: simulationText, senderId: "demo_instagram_user" }),
      });
      const data = (await response.json()) as SimulationResult;
      setSimulationResult(data);
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <main className="rf-app">
      <aside className="rf-sidebar">
        <a href="/" className="rf-back"><ArrowLeft size={16} /> Landing page</a>
        <div className="rf-brand">
          <span><Bot size={22} /></span>
          <div>
            <strong>ReplyFlow</strong>
            <small>{state.settings.businessName}</small>
          </div>
        </div>
        <nav className="rf-nav" aria-label="Dashboard">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="rf-sidebar-card">
          <Database size={18} />
          <strong>Local database</strong>
          <p>{hydrated ? "Saved in this browser." : "Loading workspace..."}</p>
        </div>
      </aside>

      <section className="rf-main">
        <header className="rf-topbar">
          <div>
            <p className="mini-label">Phase 2 workspace</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="rf-top-actions">
            <button className="rf-soft-button" onClick={actions.resetDemo} type="button">
              <RefreshCw size={15} /> Reset demo
            </button>
            <button className="rf-primary-button" onClick={() => setActiveTab("flows")} type="button">
              <Plus size={15} /> New automation
            </button>
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="rf-page-grid">
            <section className="rf-panel rf-wide">
              <div className="rf-panel-head">
                <div>
                  <p className="mini-label">Business pulse</p>
                  <h2>Automation command center</h2>
                </div>
                <StatusPill status={hydrated ? "Saved" : "Loading"} />
              </div>
              <div className="rf-metrics-grid">
                <DashboardMetric label="Pipeline value" value={formatCurrency(totals.totalValue)} change="+24% this week" icon={BarChart3} />
                <DashboardMetric label="Live automations" value={String(totals.liveFlows)} change={`${state.flows.length} total flows`} icon={Zap} />
                <DashboardMetric label="Need reply" value={String(totals.needsReply)} change="Human handoff queue" icon={Inbox} />
                <DashboardMetric label="Avg conversion" value={`${totals.avgConversion.toFixed(1)}%`} change="Across all flows" icon={CircleDot} />
              </div>
            </section>

            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Quick create</p>
                  <h2>New flow</h2>
                </div>
                <Sparkles size={19} />
              </div>
              <form className="rf-form" onSubmit={handleCreateFlow}>
                <label><span>Name</span><input name="name" placeholder="Instagram price responder" /></label>
                <label><span>Channel</span><select name="channel" defaultValue={state.settings.defaultChannel}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label>
                <label><span>Trigger</span><input name="trigger" placeholder="Comment contains price" /></label>
                <button className="rf-primary-button" type="submit"><Plus size={15} /> Create flow</button>
              </form>
            </section>

            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Live flows</p>
                  <h2>Top automations</h2>
                </div>
                <Eye size={19} />
              </div>
              <div className="rf-list">
                {state.flows.map((flow) => (
                  <button key={flow.id} onClick={() => { setSelectedFlowId(flow.id); setActiveTab("flows"); }} type="button">
                    <span>
                      <strong>{flow.name}</strong>
                      <small>{flow.trigger}</small>
                    </span>
                    <StatusPill status={flow.status} />
                  </button>
                ))}
              </div>
            </section>

            <section className="rf-panel rf-wide">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Recent contacts</p>
                  <h2>CRM movement</h2>
                </div>
                <button className="rf-soft-button" onClick={() => setActiveTab("contacts")} type="button">
                  View CRM <ChevronRight size={15} />
                </button>
              </div>
              <div className="rf-contact-strip">
                {state.contacts.slice(0, 4).map((contact) => (
                  <div key={contact.id}>
                    <span>{contact.name.split(" ").map((word) => word[0]).join("")}</span>
                    <strong>{contact.name}</strong>
                    <small>{contact.channel} · {formatCurrency(contact.value)}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "flows" && selectedFlow && (
          <div className="rf-builder-layout">
            <section className="rf-panel rf-flow-list">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Automations</p>
                  <h2>Flows</h2>
                </div>
                <span>{state.flows.length}</span>
              </div>
              <div className="rf-list">
                {state.flows.map((flow) => (
                  <button
                    key={flow.id}
                    className={flow.id === selectedFlow.id ? "active" : ""}
                    onClick={() => setSelectedFlowId(flow.id)}
                    type="button"
                  >
                    <span>
                      <strong>{flow.name}</strong>
                      <small>{flow.channel} · {flow.nodes.length} steps</small>
                    </span>
                    <StatusPill status={flow.status} />
                  </button>
                ))}
              </div>
              <form className="rf-mini-create" onSubmit={handleCreateFlow}>
                <input name="name" placeholder="New flow name" />
                <input name="trigger" placeholder="Trigger keyword/event" />
                <select name="channel" defaultValue={state.settings.defaultChannel}>
                  {channels.map((channel) => <option key={channel}>{channel}</option>)}
                </select>
                <button className="rf-primary-button" type="submit"><Plus size={15} /> Add flow</button>
              </form>
            </section>

            <section className="rf-panel rf-flow-canvas-panel">
              <div className="rf-builder-top">
                <div>
                  <p className="mini-label">Flow editor</p>
                  <input
                    className="rf-title-input"
                    value={selectedFlow.name}
                    onChange={(event) => actions.updateFlow(selectedFlow.id, { name: event.target.value })}
                  />
                  <input
                    className="rf-subtitle-input"
                    value={selectedFlow.trigger}
                    onChange={(event) => actions.updateFlow(selectedFlow.id, { trigger: event.target.value })}
                  />
                </div>
                <div className="rf-builder-actions">
                  <select
                    value={selectedFlow.channel}
                    onChange={(event) => actions.updateFlow(selectedFlow.id, { channel: event.target.value as Channel })}
                  >
                    {channels.map((channel) => <option key={channel}>{channel}</option>)}
                  </select>
                  <button
                    className={selectedFlow.status === "Live" ? "rf-soft-button" : "rf-primary-button"}
                    onClick={() => actions.updateFlow(selectedFlow.id, { status: selectedFlow.status === "Live" ? "Paused" : "Live" })}
                    type="button"
                  >
                    {selectedFlow.status === "Live" ? <Pause size={15} /> : <Play size={15} />}
                    {selectedFlow.status === "Live" ? "Pause" : "Publish"}
                  </button>
                </div>
              </div>

              <div className="rf-flow-canvas">
                {selectedFlow.nodes.map((node, index) => (
                  <button
                    key={node.id}
                    className={`rf-canvas-node ${node.id === selectedNode?.id ? "selected" : ""}`}
                    onClick={() => setSelectedNodeId(node.id)}
                    type="button"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{node.title}</strong>
                    <small>{node.kind}</small>
                    {index < selectedFlow.nodes.length - 1 && <i />}
                  </button>
                ))}
                <div className="rf-node-actions">
                  {nodeKinds.map((kind) => (
                    <button key={kind} onClick={() => actions.addNode(selectedFlow.id, kind)} type="button">
                      <Plus size={14} /> {kind}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rf-panel rf-properties">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Step properties</p>
                  <h2>Edit node</h2>
                </div>
                <Save size={18} />
              </div>
              {selectedNode ? (
                <div className="rf-form">
                  <label>
                    <span>Title</span>
                    <input
                      value={selectedNode.title}
                      onChange={(event) => actions.updateNode(selectedFlow.id, selectedNode.id, { title: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Message / action</span>
                    <textarea
                      rows={7}
                      value={selectedNode.body}
                      onChange={(event) => actions.updateNode(selectedFlow.id, selectedNode.id, { body: event.target.value })}
                    />
                  </label>
                  <div className="rf-preview-bubble">
                    <MessageSquareText size={15} />
                    <p>{selectedNode.body}</p>
                  </div>
                  <button
                    className="rf-danger-button"
                    onClick={() => actions.removeNode(selectedFlow.id, selectedNode.id)}
                    type="button"
                    disabled={selectedFlow.nodes.length <= 1}
                  >
                    <Trash2 size={15} /> Remove step
                  </button>
                </div>
              ) : (
                <p className="rf-empty">Select a node to edit it.</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="rf-page-grid">
            <section className="rf-panel rf-wide">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">CRM</p>
                  <h2>Contacts</h2>
                </div>
                <div className="rf-search">
                  <Search size={15} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" />
                </div>
              </div>
              <div className="rf-table">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="rf-table-row">
                    <span className="rf-avatar">{contact.name.split(" ").map((word) => word[0]).join("")}</span>
                    <div><strong>{contact.name}</strong><small>{contact.note}</small></div>
                    <em>{contact.channel}</em>
                    <div className="rf-tags">{contact.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <b>{formatCurrency(contact.value)}</b>
                    <StatusPill status={contact.status} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Manual entry</p>
                  <h2>Add contact</h2>
                </div>
                <UsersRound size={19} />
              </div>
              <form className="rf-form" onSubmit={handleAddContact}>
                <label><span>Name</span><input name="name" placeholder="Customer name" /></label>
                <label><span>Channel</span><select name="channel" defaultValue="Instagram">{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label>
                <label><span>Status</span><select name="status" defaultValue="New"><option>New</option><option>Qualified</option><option>VIP</option><option>Needs reply</option></select></label>
                <label><span>Tags</span><input name="tags" placeholder="hot lead, price request" /></label>
                <label><span>Value</span><input name="value" type="number" placeholder="150000" /></label>
                <label><span>Note</span><textarea name="note" rows={3} placeholder="What should the team know?" /></label>
                <button className="rf-primary-button" type="submit"><Plus size={15} /> Save contact</button>
              </form>
            </section>
          </div>
        )}

        {activeTab === "inbox" && selectedConversation && (
          <div className="rf-inbox-layout">
            <section className="rf-panel rf-thread-list">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Handoffs</p>
                  <h2>Inbox</h2>
                </div>
                <StatusPill status={`${state.conversations.length} open`} />
              </div>
              <div className="rf-list">
                {state.conversations.map((conversation) => {
                  const contact = state.contacts.find((item) => item.id === conversation.contactId);
                  return (
                    <button
                      key={conversation.id}
                      className={conversation.id === selectedConversation.id ? "active" : ""}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      type="button"
                    >
                      <span>
                        <strong>{contact?.name ?? "Unknown contact"}</strong>
                        <small>{conversation.subject}</small>
                      </span>
                      <StatusPill status={conversation.priority} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rf-panel rf-chat-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Conversation</p>
                  <h2>{state.contacts.find((contact) => contact.id === selectedConversation.contactId)?.name}</h2>
                </div>
                <span className="rf-assignee">Assigned: {selectedConversation.assignedTo}</span>
              </div>
              <div className="rf-chat">
                {selectedConversation.messages.map((message) => (
                  <div key={message.id} className={`rf-message ${message.sender}`}>
                    <span>{message.sender}</span>
                    <p>{message.text}</p>
                    <small>{message.time}</small>
                  </div>
                ))}
              </div>
              <form className="rf-reply-box" onSubmit={handleSendReply}>
                <input
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Type a human reply..."
                />
                <button className="rf-primary-button" type="submit"><Send size={15} /> Send</button>
              </form>
            </section>

            <section className="rf-panel rf-ai-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Suggested reply</p>
                  <h2>AI assist</h2>
                </div>
                <Sparkles size={18} />
              </div>
              <div className="rf-suggestion">
                <p>Yes — I can reserve it for you. Delivery is available today. Would you like card transfer or payment link?</p>
                <button onClick={() => setReplyDraft("Yes — I can reserve it for you. Delivery is available today. Would you like card transfer or payment link?")} type="button">
                  Use reply <ChevronRight size={15} />
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "broadcasts" && (
          <div className="rf-page-grid">
            <section className="rf-panel rf-wide">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Campaigns</p>
                  <h2>Broadcasts</h2>
                </div>
                <RadioTower size={19} />
              </div>
              <div className="rf-broadcast-grid">
                {state.broadcasts.map((broadcast) => (
                  <article key={broadcast.id} className="rf-broadcast">
                    <div>
                      <StatusPill status={broadcast.status} />
                      <span>{broadcast.channel}</span>
                    </div>
                    <h3>{broadcast.title}</h3>
                    <p>{broadcast.copy}</p>
                    <small>{broadcast.audience} · {broadcast.scheduledFor}</small>
                    <select
                      value={broadcast.status}
                      onChange={(event) => actions.updateBroadcastStatus(broadcast.id, event.target.value as BroadcastStatus)}
                    >
                      <option>Draft</option>
                      <option>Scheduled</option>
                      <option>Sent</option>
                    </select>
                  </article>
                ))}
              </div>
            </section>

            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Composer</p>
                  <h2>New broadcast</h2>
                </div>
                <MessageCircle size={19} />
              </div>
              <form className="rf-form" onSubmit={handleCreateBroadcast}>
                <label><span>Title</span><input name="title" placeholder="Weekend drop" /></label>
                <label><span>Audience</span><input name="audience" placeholder="VIP + hot leads" /></label>
                <label><span>Channel</span><select name="channel" defaultValue="WhatsApp">{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label>
                <label><span>Schedule</span><input name="scheduledFor" placeholder="Friday, 10:00" /></label>
                <label><span>Copy</span><textarea name="copy" rows={4} placeholder="Write campaign copy..." /></label>
                <button className="rf-primary-button" type="submit"><Plus size={15} /> Save draft</button>
              </form>
            </section>
          </div>
        )}

        {activeTab === "instagram" && (
          <div className="rf-page-grid">
            <section className="rf-panel rf-wide">
              <div className="rf-panel-head">
                <div>
                  <p className="mini-label">Instagram connector</p>
                  <h2>Ready-to-connect Meta setup</h2>
                </div>
                <StatusPill status={metaStatus?.config.autoSendEnabled ? "Live" : "Safe mode"} />
              </div>
              <div className="rf-instagram-grid">
                {[
                  ["Verify token", metaStatus?.config.verifyTokenConfigured],
                  ["Page access token", metaStatus?.config.pageAccessTokenConfigured],
                  ["App secret", metaStatus?.config.appSecretConfigured],
                  ["Auto-send", metaStatus?.config.autoSendEnabled],
                ].map(([label, ready]) => (
                  <div key={String(label)} className="rf-setup-card">
                    <span className={ready ? "ready" : ""}>{ready ? <Check size={16} /> : <Clock3 size={16} />}</span>
                    <strong>{String(label)}</strong>
                    <small>{ready ? "Configured" : "Waiting for .env.local"}</small>
                  </div>
                ))}
              </div>
              <div className="rf-webhook-box">
                <div>
                  <p className="mini-label">Webhook path</p>
                  <code>/api/meta/webhook</code>
                  <small>
                    Use this path when your app is deployed. Localhost needs a public tunnel before Meta can reach it.
                  </small>
                </div>
                <a
                  href="https://developers.facebook.com/docs/messenger-platform/instagram/"
                  target="_blank"
                  rel="noreferrer"
                  className="rf-soft-button"
                >
                  Meta docs <ChevronRight size={15} />
                </a>
              </div>
              <div className="rf-checklist">
                {(metaStatus?.checklist ?? [
                  "Set META_VERIFY_TOKEN in .env.local",
                  "Create a Meta Developer app",
                  "Connect Instagram professional account to Facebook Page",
                  "Add webhook URL in Meta dashboard",
                ]).map((item) => (
                  <div key={item}>
                    <Check size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Test instantly</p>
                  <h2>Simulate a DM</h2>
                </div>
                <MessageCircle size={19} />
              </div>
              <form className="rf-form" onSubmit={handleSimulation}>
                <label>
                  <span>Incoming Instagram text</span>
                  <textarea
                    rows={4}
                    value={simulationText}
                    onChange={(event) => setSimulationText(event.target.value)}
                    placeholder="Example: price"
                  />
                </label>
                <button className="rf-primary-button" type="submit" disabled={isSimulating}>
                  <Sparkles size={15} /> {isSimulating ? "Testing..." : "Test automation"}
                </button>
              </form>
              {simulationResult && (
                <div className="rf-simulation-result">
                  <p className="mini-label">Reply selected</p>
                  <h3>{simulationResult.reply.label}</h3>
                  <p>{simulationResult.reply.text}</p>
                  <div className="rf-tags">
                    {simulationResult.reply.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    {simulationResult.reply.handoff && <span>human_handoff</span>}
                  </div>
                </div>
              )}
            </section>

            <section className="rf-panel rf-wide">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">What I built</p>
                  <h2>Backend routes now exist</h2>
                </div>
                <Database size={19} />
              </div>
              <div className="rf-route-list">
                <div><code>GET /api/meta/status</code><span>Checks connector configuration.</span></div>
                <div><code>GET /api/meta/webhook</code><span>Handles Meta webhook verification.</span></div>
                <div><code>POST /api/meta/webhook</code><span>Receives Instagram events and picks a reply.</span></div>
                <div><code>POST /api/meta/simulate</code><span>Tests keyword automation without Meta credentials.</span></div>
                <div><code>POST /api/meta/send</code><span>Sends real Instagram messages once credentials are added.</span></div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="rf-page-grid">
            <section className="rf-panel">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Workspace</p>
                  <h2>Settings</h2>
                </div>
                <Settings2 size={19} />
              </div>
              <form className="rf-form" onSubmit={handleSettings}>
                <label><span>Business name</span><input name="businessName" defaultValue={state.settings.businessName} /></label>
                <label><span>Timezone</span><input name="timezone" defaultValue={state.settings.timezone} /></label>
                <label><span>Default channel</span><select name="defaultChannel" defaultValue={state.settings.defaultChannel}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></label>
                <label><span>Handoff email</span><input name="handoffEmail" defaultValue={state.settings.handoffEmail} /></label>
                <button className="rf-primary-button" type="submit"><Check size={15} /> Save settings</button>
              </form>
            </section>

            <section className="rf-panel rf-wide">
              <div className="rf-panel-head compact">
                <div>
                  <p className="mini-label">Implementation map</p>
                  <h2>What this becomes next</h2>
                </div>
                <Layers3 size={19} />
              </div>
              <div className="rf-roadmap">
                {[
                  ["Auth", "Add user accounts, teams, and workspaces."],
                  ["Database", "Move local storage into Postgres/Supabase/Neon."],
                  ["Automation runner", "Execute flows from events and webhooks."],
                  ["Channels", "Connect Meta, WhatsApp, Messenger, and website chat."],
                ].map(([title, text]) => (
                  <div key={title}>
                    <Clock3 size={16} />
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
