import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router"
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react"
import Threads from "~/components/shaders/threads"

export const Route = createFileRoute("/_app/_authed")({
	component: RouteComponent,

	beforeLoad: async ({ context, location }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" })
		}

		if (location.pathname === "/onboarding") {
			return
		}

		try {
			// const profile = await fetchQuery(api.userProfiles.getUserProfile, {})

			// if (!profile) {
			// 	throw redirect({ to: "/onboarding" })
			// }
		} catch (error) {
			if (error && typeof error === "object" && "href" in error) {
				throw error
			}
			console.error("Failed to check user profile:", error)
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
