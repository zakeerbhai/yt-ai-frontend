import { Link } from "react-router-dom";
import { useChannelContext } from "../context/useChannelContext";
import { useVideos } from "../lib/hooks";
import { STATUS_LABELS } from "../lib/pipeline";
import PipelineRail from "../components/PipelineRail";
import { EmptyState } from "./Upload";

export default function Home() {
  const { activeChannel, loading: channelLoading } = useChannelContext();
  const { videos, loading } = useVideos(activeChannel?.id);

  if (channelLoading) return null;

  if (!activeChannel) {
    return (
      <EmptyState
        title="Connect your first channel"
        body="Link a YouTube channel to start uploading. The pipeline handles transcription, metadata, and scheduling from there."
        cta={{ label: "Go to Settings", to: "/settings" }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
            {activeChannel.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-stone)" }}>
            {videos.length} video{videos.length === 1 ? "" : "s"} processed
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--color-signal)", color: "var(--color-ink)" }}
        >
          Upload video
        </Link>
      </div>

      {!loading && videos.length === 0 && (
        <EmptyState
          title="No videos yet"
          body="Upload your first video and the pipeline will transcribe it, write the title and description, and suggest a thumbnail automatically."
          cta={{ label: "Upload a video", to: "/upload" }}
        />
      )}

      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <Link
            key={video.id}
            to={`/videos/${video.id}`}
            className="block rounded-xl border p-5 transition-colors hover:bg-white/[0.02]"
            style={{ borderColor: "var(--color-ink-line)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-paper)" }}>
                  {video.final_title || video.ai_title || video.original_filename}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-stone)" }}>
                  {STATUS_LABELS[video.status] || video.status}
                </p>
              </div>
              <span className="text-xs font-mono shrink-0" style={{ color: "var(--color-stone)" }}>
                {new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>
            <PipelineRail status={video.status} compact />
          </Link>
        ))}
      </div>
    </div>
  );
}
