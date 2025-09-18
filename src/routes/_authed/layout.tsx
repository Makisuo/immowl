import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"

export const Route = createFileRoute("/_authed")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<Unauthenticated>
				<Navigate to="/sign-in" />
			</Unauthenticated>
			<Authenticated>
				<Outlet />
			</Authenticated>
			<AuthLoading>Loading...</AuthLoading>
		</div>
	)
}
