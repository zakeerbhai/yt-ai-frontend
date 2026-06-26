import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVideoPolling } from "../lib/hooks";
import { STATUS_LABELS } from "../lib/pipeline";
import PipelineRail from "../components/PipelineRail";
import api from "../lib/api";

export default function VideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { video, loading, error } = useVideoPolling(videoId);

  if (loading && !video) {
    return <p className="text-sm" style={{ color: "var(--color-stone)" }}>Loading…</p>;
  }
  if (error) {
    return <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>;
  }
  if (!video) return null;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="text-xs mb-6 font-mono"
        style={{ color: "var(--color-stone)" }}
      >
        ← Back
      </button>

      <h1
        className="text-2xl mb-1 truncate"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}
      >
        {video.original_filename}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-stone)" }}>
        {STATUS_LABELS[video.status] || video.status}
      </p>

      <section
        className="rounded-xl border p-6 mb-8"
        style={{ borderColor: "var(--color-ink-line)", background: "var(--color-ink-soft)" }}
      >
        <PipelineRail status={video.status} />
      </section>

      {video.status === "failed" && video.error_message && (
        <section
          className="rounded-xl border p-5 mb-8"
          style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-soft)" }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-danger)" }}>
            Pipeline stopped
          </p>
          <p className="text-sm font-mono" style={{ color: "var(--color-paper)" }}>
            {video.error_message}
          </p>
        </section>
      )}

      {video.transcript_text && (
        <Collapsible title="Transcript" defaultOpen={false}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-paper-dim)" }}>
            {video.transcript_text}
          </p>
          {video.transcript_confidence != null && (
            <p className="mt-3 text-xs font-mono" style={{ color: "var(--color-stone)" }}>
              Confidence: {(video.transcript_confidence * 100).toFixed(0)}%
            </p>
          )}
        </Collapsible>
      )}

      {video.status === "ready_for_review" && <ReviewForm video={video} />}

      {(video.status === "scheduled" || video.status === "published" || video.status === "publishing") && (
        <ReadOnlySummary video={video} />
      )}
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className="rounded-xl border mb-6 overflow-hidden"
      style={{ borderColor: "var(--color-ink-line)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5"
        style={{ background: "var(--color-ink-soft)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>
          {title}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--color-stone)" }}>
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: "var(--color-stone)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--color-ink)",
  borderColor: "var(--color-ink-line)",
  color: "var(--color-paper)",
};

function ReviewForm({ video }) {
  const [title, setTitle] = useState(video.final_title || video.ai_title || "");
  const [description, setDescription] = useState(video.final_description || video.ai_description || "");
  const [tags, setTags] = useState((video.final_tags || video.ai_tags || []).join(", "));
  const [scheduleAt, setScheduleAt] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  async function handleApprove() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/api/videos/${video.id}/approve`, {
        final_title: title,
        final_description: description,
        final_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        scheduled_publish_at: publishNow ? null : (scheduleAt ? new Date(scheduleAt).toISOString() : null),
      });
      navigate(0); // refresh to show new status
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <section
      className="rounded-xl border p-6"
      style={{ borderColor: "var(--color-signal)", background: "var(--color-ink-soft)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-signal)" }} />
        <h2 className="text-sm font-medium" style={{ color: "var(--color-paper)" }}>
          Review before publishing
        </h2>
      </div>

      {video.ai_thumbnail_suggestions?.[0] && (
        <Field label="Thumbnail">
          <img
            src={video.ai_thumbnail_suggestions[0]}
            alt="Suggested thumbnail"
            className="rounded-lg w-full max-w-sm aspect-video object-cover border"
            style={{ borderColor: "var(--color-ink-line)" }}
          />
        </Field>
      )}

      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={inputStyle}
        />
        <p className="mt-1 text-xs font-mono" style={{ color: "var(--color-stone)" }}>
          {title.length}/100
        </p>
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-lg border text-sm leading-relaxed"
          style={inputStyle}
        />
      </Field>

      <Field label="Tags (comma separated)">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={inputStyle}
        />
      </Field>

      {video.ai_hashtags?.length > 0 && (
        <Field label="Hashtags">
          <div className="flex flex-wrap gap-1.5">
            {video.ai_hashtags.map((h) => (
              <span
                key={h}
                className="text-xs font-mono px-2 py-1 rounded-md"
                style={{ background: "var(--color-ink)", color: "var(--color-stone)" }}
              >
                {h}
              </span>
            ))}
          </div>
        </Field>
      )}

      {video.ai_pinned_comment && (
        <Field label="Pinned comment">
          <p className="text-sm px-3 py-2 rounded-lg border" style={{ ...inputStyle, color: "var(--color-paper-dim)" }}>
            {video.ai_pinned_comment}
          </p>
        </Field>
      )}

      {video.ai_community_post && (
        <Field label="Community post">
          <p className="text-sm px-3 py-2 rounded-lg border" style={{ ...inputStyle, color: "var(--color-paper-dim)" }}>
            {video.ai_community_post}
          </p>
        </Field>
      )}

      <Field label="Publish timing">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-paper)" }}>
            <input type="radio" checked={publishNow} onChange={() => setPublishNow(true)} />
            Publish as soon as I approve
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-paper)" }}>
            <input type="radio" checked={!publishNow} onChange={() => setPublishNow(false)} />
            Schedule for later
          </label>
          {!publishNow && (
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="mt-1 px-3 py-2 rounded-lg border text-sm w-full max-w-xs"
              style={inputStyle}
            />
          )}
        </div>
      </Field>

      {submitError && (
        <p className="mb-4 text-sm" style={{ color: "var(--color-danger)" }}>
          {submitError}
        </p>
      )}

      <button
        onClick={handleApprove}
        disabled={submitting || !title.trim()}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--color-signal)", color: "var(--color-ink)" }}
      >
        {submitting ? "Submitting…" : publishNow ? "Approve & publish" : "Approve & schedule"}
      </button>
    </section>
  );
}

function ReadOnlySummary({ video }) {
  return (
    <section
      className="rounded-xl border p-6"
      style={{ borderColor: "var(--color-ink-line)", background: "var(--color-ink-soft)" }}
    >
      <Field label="Title">
        <p className="text-sm" style={{ color: "var(--color-paper)" }}>{video.final_title}</p>
      </Field>
      <Field label="Description">
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-paper-dim)" }}>
          {video.final_description}
        </p>
      </Field>
      {video.scheduled_publish_at && (
        <Field label="Scheduled for">
          <p className="text-sm font-mono" style={{ color: "var(--color-paper)" }}>
            {new Date(video.scheduled_publish_at).toLocaleString()}
          </p>
        </Field>
      )}
      {video.youtube_video_id && (
        <a
          href={`https://youtube.com/watch?v=${video.youtube_video_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-sm font-medium"
          style={{ color: "var(--color-signal)" }}
        >
          View on YouTube →
        </a>
      )}
    </section>
  );
}
