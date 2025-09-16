import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"

export const Route = createFileRoute("/")({
	component: Home,
})

function Home() {
	return (
		<div>
			<Unauthenticated>
				<Navigate to="/sign-in" />
			</Unauthenticated>
			<Authenticated>Hello :D</Authenticated>
			<AuthLoading>Loading...</AuthLoading>
		</div>
	)
}
