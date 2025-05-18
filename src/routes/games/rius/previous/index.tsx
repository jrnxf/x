import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/rius/previous/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/games/rius/previous"!</div>;
}
