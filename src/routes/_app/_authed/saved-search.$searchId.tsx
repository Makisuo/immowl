import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/_authed/saved-search/$searchId")({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_app/_authed/saved-search/$searchId"!</div>
}
