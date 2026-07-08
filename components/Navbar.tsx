"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Product", "#product"],
  ["Flow builder", "#builder"],
  ["Inbox", "#inbox"],
  ["Dashboard", "/dashboard"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 26);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-shell ${scrolled ? "nav-scrolled" : ""}`}>
      <a href="#top" className="wordmark" aria-label="ReplyFlow home">
        <span className="wordmark-icon"><Bot size={18} /></span>
        ReplyFlow
      </a>
      <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <a key={href} href={href} className="nav-link">
            {label}
          </a>
        ))}
      </nav>
      <div className="hidden items-center gap-3 lg:flex">
        <a href="#builder" className="nav-secondary">View demo</a>
        <a href="/dashboard" className="nav-cta">
          Start MVP <Sparkles size={14} />
        </a>
      </div>
      <button className="mobile-menu-button lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu-panel"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
          >
            <p className="eyebrow mb-8">Navigation</p>
            {links.map(([label, href], index) => (
              <motion.a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="mobile-link"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                {label}
              </motion.a>
            ))}
            <a href="/dashboard" onClick={() => setOpen(false)} className="button-primary mt-10 w-fit">
              Start MVP
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
