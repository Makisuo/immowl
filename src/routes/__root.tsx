import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { fetchSession, getCookieName } from "@convex-dev/better-auth/react-start"
import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, getWebRequest } from "@tanstack/react-start/server"
import type { ConvexReactClient } from "convex/react"
import type * as React from "react"
import { authClient } from "~/lib/auth.client"
import appCss from "~/styles/app.css?url"

const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
	const { createAuth } = await import("../../convex/auth")
	const { session } = await fetchSession(getWebRequest())
	const sessionCookieName = getCookieName(createAuth as any)
	const token = getCookie(sessionCookieName)
	return {
		userId: session?.user.id,
		token,
	}
})

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
	convexClient: ConvexReactClient
	convexQueryClient: ConvexQueryClient
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async (ctx) => {
		const { userId, token } = await fetchAuth()

		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
		}

		return { userId, token }
	},
	component: RootComponent,
})

function RootComponent() {
	const context = useRouteContext({ from: Route.id })
	return (
		<ConvexBetterAuthProvider client={context.convexClient} authClient={authClient}>
			<RootDocument>
				<Outlet />
			</RootDocument>
		</ConvexBetterAuthProvider>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen">
				{children}
				<Scripts />
			</body>
		</html>
	)
}
