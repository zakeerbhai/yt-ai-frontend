// Maps backend VideoStatus values to the pipeline rail UI.
// Order matters — this is the literal left-to-right/top-to-bottom
// sequence rendered in <PipelineRail>.
export const PIPELINE_STAGES = [
  { key: "uploaded", label: "Uploaded" },
  { key: "transcribing", label: "Transcribing" },
  { key: "transcribed", label: "Transcript ready" },
  { key: "generating_content", label: "Generating content" },
  { key: "ready_for_review", label: "Ready for review" },
  { key: "scheduled", label: "Scheduled" },
  { key: "publishing", label: "Publishing" },
  { key: "published", label: "Published" },
];

const STAGE_INDEX = Object.fromEntries(PIPELINE_STAGES.map((s, i) => [s.key, i]));

export function stageIndex(status) {
  if (status === "failed") return -1;
  return STAGE_INDEX[status] ?? 0;
}

export const STATUS_LABELS = {
  uploaded: "Uploaded",
  transcribing: "Transcribing speech",
  transcribed: "Transcript ready",
  generating_content: "Writing title, description & tags",
  ready_for_review: "Ready for your review",
  scheduled: "Scheduled",
  publishing: "Publishing to YouTube",
  published: "Published",
  failed: "Something went wrong",
};

export const STATUS_COLOR = {
  failed: "var(--color-danger)",
  published: "var(--color-success)",
  ready_for_review: "var(--color-signal)",
  scheduled: "var(--color-signal)",
};
