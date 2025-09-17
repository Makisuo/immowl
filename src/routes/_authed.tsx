import { createFileRoute, redirect } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { fetchQuery } from "~/lib/auth.server"

export const Route = createFileRoute("/_authed")({
	beforeLoad: async () => {
		const user = await fetchQuery(api.auth.getCurrentUser, {})

		if (!user) {
			throw redirect({
				to: "/sign-in",
				search: {
					redirect: location.pathname,
				},
			})
		}

		return { user }
	},
})
