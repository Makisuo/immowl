import { httpRouter } from "convex/server"
import { api } from "./_generated/api"
import { httpAction } from "./_generated/server"
import { authComponent, createAuth } from "./auth"

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)

// MapKit JS token endpoint
http.route({
	path: "/mapkit-token",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		// Get origin from request headers for security
		const origin = request.headers.get("origin") || process.env.SITE_URL || "http://localhost:3000"

		// Call the Node.js action to generate the token
		const result = await ctx.runAction(api.mapkit.generateToken, { origin })

		if (result.error) {
			return new Response(
				JSON.stringify({ error: result.error }),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, OPTIONS",
					},
				}
			)
		}

		return new Response(
			JSON.stringify({ token: result.token }),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": origin,
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Cache-Control": "private, max-age=1500", // Cache for 25 minutes
				},
			}
		)
	}),
})

export default http
