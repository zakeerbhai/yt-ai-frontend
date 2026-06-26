import { Link } from "react-router-dom";
import { useChannelContext } from "../context/useChannelContext";
import { useVideos } from "../lib/hooks";
import { EmptyState } from "./Upload";

export default function Scheduled() {
  const { activeChannel } = useChannelContext();
  const { videos, loading } = useVideos(activeChannel?.id);

  if (!activeChannel) {
    return <EmptyState title="No channel connected" body="Connect a channel to see scheduled videos." cta={{ label: "Go to Settings", to: "/settings" }} />;
  }

  const scheduled = videos.filter((v) => v.status === "scheduled" && v.scheduled_publish_at);
  const sorted = [...scheduled].sort(
    (a, b) => new Date(a.scheduled_publish_at) - new Date(b.scheduled_publish_at)
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
        Scheduled
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-stone)" }}>
        Videos approved and queued to publish.
      </p>

      {!loading && sorted.length === 0 && (
        <EmptyState
          title="Nothing scheduled"
          body="Once you approve a video and choose a publish time, it'll show up here."
          cta={{ label: "Upload a video", to: "/upload" }}
        />
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((video) => (
          <Link
            key={video.id}
            to={`/videos/${video.id}`}
            className="block rounded-xl border p-5 hover:bg-white/[0.02] transition-colors"
            style={{ borderColor: "var(--color-ink-line)" }}
          >
            <p className="text-sm font-medium truncate mb-1" style={{ color: "var(--color-paper)" }}>
              {video.final_title || video.original_filename}
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--color-signal)" }}>
              {new Date(video.scheduled_publish_at).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
