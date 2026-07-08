"use client";

import {
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Command,
  Layers3,
  MessageCircle,
  MessageSquareText,
  MousePointer2,
  Play,
  Plus,
  RadioTower,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wand2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FormEvent, useMemo, useRef, useState } from "react";
import AutomationCanvas from "@/components/AutomationCanvas";
import Navbar from "@/components/Navbar";
import Reveal from "@/components/Reveal";

const metrics = [
  { label: "Automated conversations", value: "18,420", change: "+31%", icon: MessageCircle },
  { label: "Qualified leads", value: "4,910", change: "+22%", icon: UsersRound },
  { label: "Avg. reply time", value: "0.8s", change: "-76%", icon: Clock3 },
];

const channels = ["Instagram", "WhatsApp", "Website", "Messenger"];

const sidebarItems: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Flows", icon: Command },
  { label: "Inbox", icon: MessageCircle },
  { label: "Contacts", icon: UsersRound },
  { label: "Broadcasts", icon: RadioTower },
  { label: "Settings", icon: Settings2 },
];

const featureCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: "Flow builder",
    text: "Design branching automations visually with triggers, messages, tags, and human handoffs.",
    icon: Command,
  },
  {
    title: "Contact CRM",
    text: "Track leads, segments, channel source, order intent, and high-value customers.",
    icon: UsersRound,
  },
  {
    title: "Broadcasts",
    text: "Draft campaign messages for product drops, reminders, retargeting, and updates.",
    icon: RadioTower,
  },
  {
    title: "Smart inbox",
    text: "Let automation handle repetitive work, then hand serious buyers to your team.",
    icon: MessageCircle,
  },
];

const flowNodes = [
  {
    id: "trigger",
    type: "Trigger",
    title: "Comment contains “price”",
    description: "Starts when a shopper comments a buying keyword.",
    preview: "Thanks for asking — want the price list and available sizes?",
    stat: "2,840 starts",
    icon: MousePointer2,
  },
  {
    id: "reply",
    type: "Message",
    title: "Send product menu",
    description: "Shows three quick choices with rich buttons.",
    preview: "Choose what you want to see: new arrivals, best sellers, or talk to sales.",
    stat: "68% click rate",
    icon: MessageSquareText,
  },
  {
    id: "segment",
    type: "CRM",
    title: "Tag as hot lead",
    description: "Adds profile data for future broadcasts.",
    preview: "Tagged: interested_in_denim, source_instagram, high_intent.",
    stat: "4 tags added",
    icon: Layers3,
  },
  {
    id: "handoff",
    type: "Team",
    title: "Notify sales rep",
    description: "Moves serious buyers into the human inbox.",
    preview: "New handoff: customer asked for payment and delivery details.",
    stat: "12 open tasks",
    icon: BellRing,
  },
];

const contacts = [
  ["Amina Bello", "WhatsApp", "VIP buyer", "₦420k", "Ready to order"],
  ["Tunde Cole", "Instagram", "Hot lead", "₦180k", "Asked for sizes"],
  ["Adaeze Okoro", "Website", "Returning", "₦95k", "Browsing jackets"],
  ["Musa Danladi", "Messenger", "Wholesale", "₦1.2m", "Needs callback"],
];

const broadcasts = [
  { title: "Drop reminder", audience: "VIP + waitlist", status: "Scheduled", time: "Fri 10:00" },
  { title: "Abandoned checkout", audience: "Warm shoppers", status: "Live", time: "Always on" },
  { title: "New arrivals", audience: "Instagram leads", status: "Draft", time: "Needs copy" },
];

const builderTools = [
  "Keyword triggers",
  "Quick replies",
  "Contact tags",
  "Human handoff",
  "Broadcast scheduler",
  "Analytics events",
];

function DashboardPreview() {
  return (
    <motion.div
      className="dashboard-preview"
      initial={{ opacity: 0, y: 34, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="app-window-bar">
        <div className="window-dots"><span /><span /><span /></div>
        <div className="window-search"><Search size={13} /> Search contacts, flows, campaigns</div>
        <div className="window-status"><span /> Live</div>
      </div>
      <div className="dashboard-grid">
        <aside className="demo-sidebar">
          <div className="sidebar-logo"><Bot size={18} /> RF</div>
          {sidebarItems.map(({ label, icon: Icon }, index) => (
            <div key={label} className={`sidebar-item ${index === 0 ? "active" : ""}`}>
              <Icon size={16} />
              <span>{label}</span>
            </div>
          ))}
        </aside>
        <div className="demo-main">
          <div className="demo-main-top">
            <div>
              <p className="mini-label">Automation</p>
              <h3>Instagram sales assistant</h3>
            </div>
            <button className="pill-button"><Play size={13} /> Publish</button>
          </div>
          <div className="mini-flow">
            <div className="mini-node trigger"><Zap size={15} /> Comment trigger</div>
            <div className="mini-line" />
            <div className="mini-node"><MessageSquareText size={15} /> Product menu</div>
            <div className="mini-line" />
            <div className="mini-node success"><UsersRound size={15} /> Create lead</div>
          </div>
          <div className="metric-row">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <metric.icon size={17} />
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.change}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlowBuilder() {
  const [selectedId, setSelectedId] = useState(flowNodes[1].id);
  const selected = useMemo(() => flowNodes.find((node) => node.id === selectedId) ?? flowNodes[0], [selectedId]);
  const SelectedIcon = selected.icon;

  return (
    <div className="builder-shell">
      <div className="builder-toolbar">
        <div>
          <p className="mini-label">Visual builder</p>
          <h3>Launch a sales flow in minutes</h3>
        </div>
        <div className="tool-actions">
          <button><Plus size={14} /> Add step</button>
          <button><Wand2 size={14} /> AI draft</button>
        </div>
      </div>

      <div className="builder-workspace">
        <div className="node-canvas">
          <svg className="connector-svg" viewBox="0 0 900 520" preserveAspectRatio="none">
            <path d="M145 112 C260 112 275 240 390 240" />
            <path d="M505 240 C625 240 635 108 760 108" />
            <path d="M505 240 C630 240 625 390 760 390" />
          </svg>
          {flowNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <button
                key={node.id}
                className={`flow-node flow-node-${index} ${selectedId === node.id ? "selected" : ""}`}
                onClick={() => setSelectedId(node.id)}
              >
                <span className="node-type">{node.type}</span>
                <span className="node-title"><Icon size={17} /> {node.title}</span>
                <small>{node.description}</small>
                <em>{node.stat}</em>
              </button>
            );
          })}
        </div>

        <aside className="properties-panel">
          <div className="panel-icon"><SelectedIcon size={20} /></div>
          <p className="mini-label">Selected step</p>
          <h4>{selected.title}</h4>
          <p>{selected.description}</p>
          <div className="preview-bubble">{selected.preview}</div>
          <button className="button-dark">Edit step <ChevronRight size={15} /></button>
        </aside>
      </div>
    </div>
  );
}

function InboxPreview() {
  return (
    <div className="inbox-card">
      <div className="inbox-header">
        <div>
          <p className="mini-label">Unified inbox</p>
          <h3>Every conversation, one place</h3>
        </div>
        <span className="status-badge">12 need reply</span>
      </div>
      <div className="inbox-layout">
        <div className="thread-list">
          {contacts.slice(0, 3).map(([name, channel, tag], index) => (
            <button key={name} className={index === 0 ? "active" : ""}>
              <span className="avatar">{name.split(" ").map((word) => word[0]).join("")}</span>
              <span><strong>{name}</strong><small>{channel} · {tag}</small></span>
            </button>
          ))}
        </div>
        <div className="chat-pane">
          <div className="message incoming">Hi, do you have the black set in medium?</div>
          <div className="message outgoing">Yes — I can reserve it. Do you want pickup or delivery?</div>
          <div className="message incoming">Delivery. Send payment details please.</div>
          <div className="reply-box"><Sparkles size={15} /> AI suggested reply ready <Send size={15} /></div>
        </div>
      </div>
    </div>
  );
}

function LaunchForm() {
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="launch-success" role="status">
        <Check size={30} />
        <h3>Workspace request captured.</h3>
        <p>This demo is front-end only for now. The next step is wiring auth, database, and real channel APIs.</p>
        <button onClick={() => setSent(false)} className="text-link">Create another demo request</button>
      </div>
    );
  }

  return (
    <form className="launch-form" onSubmit={submit}>
      {/* CUSTOMIZE: connect this form to your backend, CRM, or email service. */}
      <label><span>Business name</span><input required name="business" placeholder="Example: Nova Denim" /></label>
      <label><span>Main channel</span><select name="channel" defaultValue="Instagram"><option>Instagram</option><option>WhatsApp</option><option>Website chat</option><option>Messenger</option></select></label>
      <label><span>Automation goal</span><textarea name="goal" rows={4} placeholder="Example: reply to price comments, qualify buyers, and notify sales." /></label>
      <button type="submit" className="button-primary">Create workspace <ArrowRight size={16} /></button>
    </form>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 84]);
  const previewY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -42]);
  const [activeChannel, setActiveChannel] = useState(channels[0]);

  return (
    <main id="top">
      <Navbar />

      <section ref={heroRef} className="hero-section">
        <AutomationCanvas />
        <motion.div className="hero-copy" style={{ y: heroY }}>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            Conversation automation · CRM · Broadcasts
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
            Turn chats into customers on autopilot.
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.7 }}>
            ReplyFlow is a ManyChat-style automation MVP for brands that sell through DMs, WhatsApp, and web chat — built with an original premium interface.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.7 }}>
            <a href="/dashboard" className="button-primary">Open dashboard <ArrowRight size={16} /></a>
            <a href="#builder" className="button-ghost">View builder demo</a>
          </motion.div>
          <motion.div className="trust-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.7 }}>
            <span><ShieldCheck size={15} /> Original UI</span>
            <span><Zap size={15} /> Fast MVP</span>
            <span><Bot size={15} /> Automation-ready</span>
          </motion.div>
        </motion.div>

        <motion.div className="hero-preview" style={{ y: previewY }}>
          <DashboardPreview />
        </motion.div>
      </section>

      <section className="ticker" aria-label="Supported automation features">
        <div>
          <span>Instagram triggers</span><i />
          <span>WhatsApp flows</span><i />
          <span>Broadcast campaigns</span><i />
          <span>Contact CRM</span><i />
          <span>Unified inbox</span><i />
          <span>Web chat widget</span><i />
        </div>
      </section>

      <section id="product" className="section-wrap product-section">
        <Reveal className="section-heading">
          <p className="eyebrow">Product foundation</p>
          <h2>Everything a chat-first business needs to sell faster.</h2>
          <p>
            This first build is structured like a real SaaS product: dashboard, automation builder, contacts, campaigns, inbox, and launch-ready widget areas.
          </p>
        </Reveal>

        <div className="feature-grid">
          {featureCards.map(({ title, text, icon: Icon }, index) => (
            <Reveal key={title} className="feature-card" delay={index * 0.06}>
              <Icon size={23} />
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="builder" className="builder-section">
        <Reveal className="builder-heading">
          <p className="eyebrow">Interactive prototype</p>
          <h2>Build flows without feeling like you’re using a spreadsheet.</h2>
          <p>Click each node to preview how the properties panel updates. This is front-end logic today, ready to connect to a real database next.</p>
        </Reveal>
        <Reveal delay={0.08}>
          <FlowBuilder />
        </Reveal>
      </section>

      <section className="section-wrap channels-section">
        <Reveal className="channels-copy">
          <p className="eyebrow">Multi-channel engine</p>
          <h2>Start where your customers already talk.</h2>
          <p>
            The MVP is designed for channel adapters, so Instagram, WhatsApp, Messenger, and website chat can share one automation brain later.
          </p>
          <div className="channel-tabs" role="tablist" aria-label="Channel preview">
            {channels.map((channel) => (
              <button
                key={channel}
                className={activeChannel === channel ? "active" : ""}
                onClick={() => setActiveChannel(channel)}
                type="button"
              >
                {channel}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal className="phone-preview" delay={0.1}>
          <div className="phone-top"><span />{activeChannel}</div>
          <div className="phone-chat">
            <div className="bubble bot">Welcome back. Want to see today’s best sellers?</div>
            <div className="bubble user">Yes, show me</div>
            <div className="bubble bot">Perfect. Choose a category below.</div>
            <div className="quick-replies">
              <button>New arrivals</button>
              <button>Talk to sales</button>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="inbox" className="workspace-section">
        <div className="workspace-grid">
          <Reveal>
            <InboxPreview />
          </Reveal>

          <Reveal className="contacts-card" delay={0.08}>
            <div className="card-header">
              <div>
                <p className="mini-label">Contacts</p>
                <h3>Lead table with segments</h3>
              </div>
              <button className="small-action">Export</button>
            </div>
            <div className="contact-table">
              {contacts.map(([name, channel, tag, value, note]) => (
                <div key={name} className="contact-row">
                  <span className="avatar">{name.split(" ").map((word) => word[0]).join("")}</span>
                  <span><strong>{name}</strong><small>{channel}</small></span>
                  <em>{tag}</em>
                  <b>{value}</b>
                  <small>{note}</small>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-wrap broadcast-section">
        <Reveal className="section-heading narrow">
          <p className="eyebrow">Campaigns</p>
          <h2>Broadcasts that feel personal, not spammy.</h2>
          <p>Segment customers by intent, channel, tags, and purchase stage before sending product drops or reminders.</p>
        </Reveal>
        <div className="broadcast-grid">
          {broadcasts.map((broadcast, index) => (
            <Reveal key={broadcast.title} className="broadcast-card" delay={index * 0.06}>
              <div className="broadcast-top">
                <RadioTower size={19} />
                <span>{broadcast.status}</span>
              </div>
              <h3>{broadcast.title}</h3>
              <p>{broadcast.audience}</p>
              <div><Clock3 size={14} /> {broadcast.time}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="tools-section">
        <Reveal className="tools-copy">
          <p className="eyebrow">Builder blocks</p>
          <h2>The pieces are already mapped.</h2>
        </Reveal>
        <div className="tools-list">
          {builderTools.map((tool, index) => (
            <Reveal key={tool} delay={index * 0.04}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{tool}</p>
              <Check size={17} />
            </Reveal>
          ))}
        </div>
      </section>

      <section id="launch" className="launch-section">
        <div className="launch-glow" />
        <Reveal className="launch-copy">
          <p className="eyebrow">Next build step</p>
          <h2>Make it real with auth, data, and channel APIs.</h2>
          <p>
            The interface is ready for the next layer: user workspaces, saved automation flows, contacts database, webhooks, billing, and Meta/WhatsApp integrations.
          </p>
          <div className="launch-points">
            <span><Check size={15} /> Responsive MVP shell</span>
            <span><Check size={15} /> Interactive builder demo</span>
            <span><Check size={15} /> CRM + inbox screens</span>
          </div>
        </Reveal>
        <Reveal className="launch-form-wrap" delay={0.1}>
          <LaunchForm />
        </Reveal>
      </section>

      <footer>
        <div className="footer-brand">
          <span><Bot size={19} /></span>
          ReplyFlow
        </div>
        <p>Original ManyChat-style automation MVP. Built to extend into a production SaaS.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
