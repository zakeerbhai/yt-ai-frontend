import { useState } from "react";
import { useChannelContext } from "../context/useChannelContext";
import { useAuth } from "../context/useAuth";
import api from "../lib/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const MODES = [
  {
    value: "manual_review",
    label: "Manual review",
    body: "The pipeline generates everything and waits for you to approve before anything is scheduled or published.",
  },
  {
    value: "auto_schedule",
    label: "Auto-schedule",
    body: "The pipeline picks a publish time and schedules automatically, but still waits for your approval before the video goes live.",
  },
  {
    value: "full_auto",
    label: "Full automatic",
    body: "The pipeline generates, schedules, and publishes with no review step. A wrong AI-generated title or description goes straight to your channel.",
  },
];

export default function Settings() {
  const { channels, refresh } = useChannelContext();
  const { user } = useAuth();

  async function connectYoutube() {
    try {
      // First ensure user exists in our database
      await api.get("/api/me");
      // Then get token and redirect
      const token = await user.getIdToken(true);
      window.location.href = `${API_BASE}/api/auth/youtube/connect?token=${token}`;
    } catch (err) {
      alert("Error: " + err.message + ". Please try again.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-stone)" }}>
        Manage connected channels and how much the pipeline is allowed to do without you.
      </p>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>
            Connected channels
          </h2>
          <button
            onClick={connectYoutube}
            className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
          >
            + Connect a channel
          </button>
        </div>

        {channels.length === 0 ? (
          <p
            className="text-sm rounded-xl border p-5"
            style={{ borderColor: "var(--color-ink-line)", color: "var(--color-stone)" }}
          >
            No channels connected yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onChanged={refresh} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChannelCard({ channel, onChanged }) {
  const [mode, setMode] = useState(channel.auto_publish_mode);
  const [saving, setSaving] = useState(false);
  const [confirmFullAuto, setConfirmFullAuto] = useState(false);

  async function applyMode(newMode) {
    setSaving(true);
    try {
      await api.patch(`/api/channels/${channel.id}`, { auto_publish_mode: newMode });
      setMode(newMode);
      onChanged();
    } finally {
      setSaving(false);
      setConfirmFullAuto(false);
    }
  }

  function handleSelect(newMode) {
    if (newMode === "full_auto" && mode !== "full_auto") {
      setConfirmFullAuto(true);
      return;
    }
    applyMode(newMode);
  }

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--color-ink-line)", background: "var(--color-ink-soft)" }}>
      <div className="flex items-center gap-3 mb-4">
        {channel.thumbnail_url && (
          <img src={channel.thumbnail_url} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
        )}
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>{channel.title}</p>
          <p className="text-xs font-mono" style={{ color: "var(--color-stone)" }}>{channel.youtube_channel_id}</p>
        </div>
      </div>

      <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: "var(--color-stone)" }}>
        Automation level
      </p>
      <div className="flex flex-col gap-2">
        {MODES.map((m) => (
          <label
            key={m.value}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer"
            style={{
              borderColor: mode === m.value ? "var(--color-signal)" : "var(--color-ink-line)",
              background: mode === m.value ? "var(--color-signal-soft)" : "transparent",
            }}
          >
            <input
              type="radio"
              name={`mode-${channel.id}`}
              checked={mode === m.value}
              onChange={() => handleSelect(m.value)}
              disabled={saving}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-stone)" }}>{m.body}</p>
            </div>
          </label>
        ))}
      </div>

      {confirmFullAuto && (
        <div
          className="mt-4 rounded-lg border p-4"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-soft)" }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-danger)" }}>
            Turn off review for this channel?
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--color-paper-dim)" }}>
            Every future upload will publish automatically with AI-generated title and description —
            nobody checks it first. You can switch back at any time.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => applyMode("full_auto")}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ background: "var(--color-danger)", color: "var(--color-paper)" }}
            >
              Yes, publish automatically
            </button>
            <button
              onClick={() => setConfirmFullAuto(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ color: "var(--color-stone)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
