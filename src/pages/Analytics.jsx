import ComingSoon from "../components/ComingSoon";

export default function Analytics() {
  return (
    <ComingSoon
      title="Analytics"
      body="Views, watch time, subscribers, CTR, and retention, pulled from the YouTube Analytics API."
      plannedRoutes={["GET /api/analytics/channel", "GET /api/analytics/video/{id}"]}
    />
  );
}
