import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"
import { ApartmentGrid } from "~/components/apartment-grid"

export const Route = createFileRoute("/")({
	component: Home,
})

function Home() {
	return (
		<div>
			<Unauthenticated>
				<Navigate to="/sign-in" />
			</Unauthenticated>
			<Authenticated>
				<ApartmentGrid />
			</Authenticated>
			<AuthLoading>Loading...</AuthLoading>
		</div>
	)
}
