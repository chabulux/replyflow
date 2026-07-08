# ReplyFlow — Conversation Automation MVP

ReplyFlow is an original ManyChat-style automation MVP for businesses that sell through Instagram DMs, WhatsApp, Messenger, and website chat.

It now includes a working local dashboard plus a ready-to-connect Meta/Instagram backend scaffold.

## What is built

- Premium SaaS landing page
- Dashboard at `/dashboard`
- Local saved flows, contacts, inbox replies, broadcasts, and workspace settings
- Flow builder with editable steps
- Instagram setup tab in the dashboard
- Meta webhook verification route
- Instagram event receiver route
- Instagram automation simulator
- Safe-mode message sender route

## Run locally

1. Install Node.js 20+.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open:

   ```text
   http://localhost:3000/dashboard
   ```

For a production check:

```bash
npm run build
npm start
```

## Instagram / Meta connector

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```text
META_VERIFY_TOKEN=your_private_verify_token
META_APP_SECRET=your_meta_app_secret
META_PAGE_ACCESS_TOKEN=your_page_access_token
META_GRAPH_API_VERSION=v21.0
REPLYFLOW_AUTO_SEND=false
```

Keep `REPLYFLOW_AUTO_SEND=false` while testing. Set it to `true` only when your Meta app is approved and you are ready to send real Instagram messages.

### API routes

- `GET /api/meta/status` — checks whether required env values exist
- `GET /api/meta/webhook` — Meta webhook verification
- `POST /api/meta/webhook` — receives Instagram messaging/comment events
- `POST /api/meta/simulate` — tests keyword automation without credentials
- `POST /api/meta/send` — sends a real message when token + auto-send are configured

### Meta requirements

You will need:

- Instagram professional account
- Facebook Page connected to that Instagram account
- Meta Developer app
- Instagram Messaging API / Messenger API for Instagram permissions
- Public webhook URL when deployed

Official Meta docs: https://developers.facebook.com/docs/messenger-platform/instagram/

## Customize

- Landing page: `app/page.tsx`
- Dashboard: `app/dashboard/page.tsx`
- Local browser data store: `lib/replyflowStore.ts`
- Instagram connector logic: `lib/metaInstagram.ts`
- Styles: `app/globals.css`

## Next production steps

- Add auth and workspaces
- Move local storage to a real database
- Persist webhook events and conversations
- Connect real Instagram contacts to ReplyFlow contacts
- Add permissions/app review flow
- Deploy with HTTPS so Meta can reach the webhook

Note: this MVP is legally distinct. It recreates the automation workflow category without copying ManyChat branding, proprietary UI, or protected content.
