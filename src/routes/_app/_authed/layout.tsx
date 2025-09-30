import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"
import Threads from "~/components/shaders/threads"

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
			<AuthLoading>
				<div style={{ width: "100%", height: "500px", position: "relative" }}>
					<Threads
						amplitude={2}
						distance={0.3}
						color={[0.1, 0.5, 1.0]}
						enableMouseInteraction={false}
					/>
				</div>
			</AuthLoading>
		</div>
	)
}
