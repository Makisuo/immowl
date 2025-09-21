import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"

export const Route = createFileRoute("/_app/_authed")({
	component: RouteComponent,
	beforeLoad: ({ context }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" })
		}
	},
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
