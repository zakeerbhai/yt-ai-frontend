import { useCallback, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useChannelContext } from "../context/useChannelContext";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/x-msvideo"];
const MAX_BYTES = 5 * 1024 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function Upload() {
  const { activeChannel } = useChannelContext();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateAndSet = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError(`"${f.type || "Unknown format"}" isn't supported. Use MP4, MOV, MKV, WebM, or AVI.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`That file is ${formatBytes(f.size)} — the limit is 5 GB.`);
      return;
    }
    setFile(f);
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  async function handleUpload() {
    if (!file || !activeChannel) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("channel_id", activeChannel.id);
    formData.append("file", file);

    try {
      const { data } = await api.post("/api/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      navigate(`/videos/${data.id}`);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setUploading(false);
    }
  }

  if (!activeChannel) {
    return (
      <EmptyState
        title="Connect a channel first"
        body="You'll need a connected YouTube channel before you can upload — the pipeline needs somewhere to eventually publish to."
        cta={{ label: "Go to Settings", to: "/settings" }}
      />
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
        Upload a video
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-stone)" }}>
        Publishing to <span style={{ color: "var(--color-paper)" }}>{activeChannel.title}</span>. Everything
        after this — transcript, title, description, tags, thumbnail — is generated automatically.
      </p>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-20 cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? "var(--color-signal)" : "var(--color-ink-line)",
            background: dragging ? "var(--color-signal-soft)" : "var(--color-ink-soft)",
          }}
        >
          <UploadIcon />
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--color-paper)" }}>
            Drop a video here, or click to browse
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-stone)" }}>
            MP4, MOV, MKV, WebM, or AVI — up to 5 GB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--color-ink-line)", background: "var(--color-ink-soft)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-paper)" }}>
                {file.name}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-stone)" }}>
                {formatBytes(file.size)}
              </p>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="text-xs shrink-0"
                style={{ color: "var(--color-stone)" }}
              >
                Remove
              </button>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-ink-line)" }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--color-signal)" }}
                />
              </div>
              <p className="mt-2 text-xs font-mono" style={{ color: "var(--color-stone)" }}>
                Uploading… {progress}%
              </p>
            </div>
          )}

          {!uploading && (
            <button
              onClick={handleUpload}
              className="mt-4 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--color-signal)", color: "var(--color-ink)" }}
            >
              Start processing
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-stone)" }}>
      <path d="M12 16V4M12 4L7 9M12 4l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({ title, body, cta }) {
  return (
    <div className="max-w-md py-20">
      <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
        {title}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-stone)" }}>
        {body}
      </p>
      {cta && (
        <Link
          to={cta.to}
          className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
