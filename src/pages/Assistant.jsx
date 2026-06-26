import ComingSoon from "../components/ComingSoon";

export default function Assistant() {
  return (
    <ComingSoon
      title="AI Assistant"
      body="A chat-style interface for asking questions about your channel's performance or regenerating content for a specific video."
      plannedRoutes={["POST /api/assistant/chat"]}
    />
  );
}
