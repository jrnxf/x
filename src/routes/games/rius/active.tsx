import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/rius/active")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/games/rius/active"!</div>;
}
