import ComingSoon from "../components/ComingSoon";

export default function Calendar() {
  return (
    <ComingSoon
      title="Content Calendar"
      body="A monthly view of scheduled and published videos, plus AI-suggested upload slots based on your channel's historical performance."
      plannedRoutes={["GET /api/calendar", "GET /api/best-publish-time"]}
    />
  );
}
