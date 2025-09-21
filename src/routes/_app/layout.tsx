import { createFileRoute, Outlet } from "@tanstack/react-router"
import { AppHeader } from "~/components/header"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<AppHeader />
			<main className="relative pt-24 md:pt-36">
				<Outlet />
			</main>
		</div>
	)
}
