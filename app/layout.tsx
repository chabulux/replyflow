import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplyFlow — Conversation Automation Platform",
  description:
    "A polished automation MVP for building chat flows, broadcasts, contacts, inboxes, and web chat experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
