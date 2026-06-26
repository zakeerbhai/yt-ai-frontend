import { PIPELINE_STAGES, stageIndex, STATUS_LABELS } from "../lib/pipeline";

/**
 * The signature visual: renders a video's journey through the pipeline
 * as a literal connected line of nodes, rather than an abstract percent
 * bar. Each node is the actual stage name, so a creator always knows
 * exactly which system (transcription, AI generation, YouTube) is
 * currently doing the work — important for a tool that's allowed to
 * publish on someone's behalf.
 */
export default function PipelineRail({ status, compact = false }) {
  const isFailed = status === "failed";
  const currentIndex = stageIndex(status);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {PIPELINE_STAGES.map((stage, i) => {
          const isDone = !isFailed && i < currentIndex;
          const isCurrent = !isFailed && i === currentIndex;
          const isLast = i === PIPELINE_STAGES.length - 1;

          let nodeColor = "var(--color-ink-line)";
          let textColor = "var(--color-stone)";
          if (isDone) {
            nodeColor = "var(--color-success)";
          } else if (isCurrent) {
            nodeColor = "var(--color-signal)";
            textColor = "var(--color-paper)";
          }

          return (
            <div key={stage.key} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : "1 1 0%" }}>
              <div className="flex flex-col items-center" style={{ minWidth: compact ? 0 : 64 }}>
                <span
                  className={`rounded-full shrink-0 ${isCurrent ? "animate-pulse" : ""}`}
                  style={{
                    width: compact ? 8 : 10,
                    height: compact ? 8 : 10,
                    background: nodeColor,
                    boxShadow: isCurrent ? `0 0 0 4px var(--color-signal-soft)` : "none",
                  }}
                  aria-hidden="true"
                />
                {!compact && (
                  <span
                    className="mt-2 text-[11px] text-center leading-tight font-mono"
                    style={{ color: textColor, maxWidth: 72 }}
                  >
                    {stage.label}
                  </span>
                )}
              </div>
              {!isLast && (
                <div
                  className="h-px flex-1 mx-1"
                  style={{ background: isDone ? "var(--color-success)" : "var(--color-ink-line)" }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {isFailed && (
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
          {STATUS_LABELS.failed}
        </p>
      )}
    </div>
  );
}
