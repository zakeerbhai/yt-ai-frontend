import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useChannelContext } from "../context/useChannelContext";

export default function ChannelSwitcher() {
  const { channels, activeChannel, setActiveChannelId, loading } = useChannelContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (loading) {
    return <div className="h-9 w-48 rounded-md animate-pulse" style={{ background: "var(--color-ink-soft)" }} />;
  }

  if (channels.length === 0) {
    return (
      <Link
        to="/settings"
        className="text-sm font-medium px-3 py-1.5 rounded-md"
        style={{ background: "var(--color-signal-soft)", color: "var(--color-signal)" }}
      >
        Connect a YouTube channel →
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {activeChannel?.thumbnail_url && (
          <img src={activeChannel.thumbnail_url} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        )}
        <span className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>
          {activeChannel?.title || "Select a channel"}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--color-stone)" }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 mt-1 w-64 rounded-lg border shadow-xl py-1 z-10"
          style={{ background: "var(--color-ink-soft)", borderColor: "var(--color-ink-line)" }}
        >
          {channels.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  setActiveChannelId(c.id);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/5"
                style={{ color: "var(--color-paper)" }}
              >
                {c.thumbnail_url && (
                  <img src={c.thumbnail_url} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="truncate flex-1">{c.title}</span>
                {c.id === activeChannel?.id && (
                  <span style={{ color: "var(--color-signal)" }}>✓</span>
                )}
              </button>
            </li>
          ))}
          <li className="border-t mt-1 pt-1" style={{ borderColor: "var(--color-ink-line)" }}>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-white/5"
              style={{ color: "var(--color-stone)" }}
            >
              + Connect another channel
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
