"use node"

import { v } from "convex/values"
import { action, internalAction } from "./_generated/server"
import { internal } from "./_generated/api"

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * Note: This is a Node.js action
 *
 * Rate limits: 1 request per second (strict)
 * Documentation: https://nominatim.org/release-docs/latest/api/Search/
 */
export const geocodeAddress = action({
	args: {
		street: v.string(),
		city: v.string(),
		state: v.optional(v.string()),
		country: v.optional(v.string()),
		zipCode: v.optional(v.string()),
	},
	returns: v.union(
		v.object({
			latitude: v.number(),
			longitude: v.number(),
			displayName: v.string(),
		}),
		v.null(),
	),
	handler: async (_ctx, args) => {
		try {
			const fetch = (await import("node-fetch")).default

			// Build structured query parameters
			const params = new URLSearchParams()
			params.append("street", args.street)
			params.append("city", args.city)
			if (args.state) params.append("state", args.state)
			if (args.country) params.append("country", args.country)
			if (args.zipCode) params.append("postalcode", args.zipCode)
			params.append("format", "json")
			params.append("limit", "1")

			const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`

			console.log(`[Geocoding] Requesting: ${args.street}, ${args.city}`)

			const response = await fetch(url, {
				headers: {
					"User-Agent": "Immowl Property App (https://immowl.com)",
					Accept: "application/json",
				},
			})

			if (!response.ok) {
				console.error(`[Geocoding] HTTP error: ${response.status}`)
				return null
			}

			const data = (await response.json()) as Array<{
				lat: string
				lon: string
				display_name: string
			}>

			if (!data || data.length === 0) {
				console.warn(`[Geocoding] No results for: ${args.street}, ${args.city}`)
				return null
			}

			const result = data[0]
			const latitude = Number.parseFloat(result.lat)
			const longitude = Number.parseFloat(result.lon)

			console.log(
				`[Geocoding] Success: ${args.street}, ${args.city} -> (${latitude}, ${longitude})`,
			)

			return {
				latitude,
				longitude,
				displayName: result.display_name,
			}
		} catch (error) {
			console.error("[Geocoding] Error:", error)
			return null
		}
	},
})

/**
 * Background task to geocode properties with missing coordinates
 * Respects Nominatim rate limit of 1 request per second
 */
export const geocodePropertiesInBackground = internalAction({
	args: {
		batchSize: v.optional(v.number()), // Number of properties to process
		city: v.optional(v.string()), // Filter by city
	},
	returns: v.object({
		processed: v.number(),
		successful: v.number(),
		failed: v.number(),
	}),
	handler: async (
		ctx,
		args,
	): Promise<{ processed: number; successful: number; failed: number }> => {
		const batchSize = args.batchSize || 50

		// Query properties with missing coordinates
		const properties: Array<{
			_id: any
			address: {
				street: string
				city: string
				state: string
				country: string
				zipCode: string
			}
		}> = await ctx.runQuery(internal.geocodingQueries.getPropertiesWithoutCoordinates, {
			limit: batchSize,
			city: args.city,
		})

		let successful = 0
		let failed = 0

		console.log(`[Geocoding] Starting batch of ${properties.length} properties`)

		for (const property of properties) {
			try {
				// Geocode the address directly (we're already in a Node action)
				const fetch = (await import("node-fetch")).default

				// Build structured query parameters
				const params = new URLSearchParams()
				params.append("street", property.address.street)
				params.append("city", property.address.city)
				if (property.address.state) params.append("state", property.address.state)
				if (property.address.country) params.append("country", property.address.country)
				if (property.address.zipCode) params.append("postalcode", property.address.zipCode)
				params.append("format", "json")
				params.append("limit", "1")

				const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`

				console.log(`[Geocoding] Requesting: ${property.address.street}, ${property.address.city}`)

				const response = await fetch(url, {
					headers: {
						"User-Agent": "Immowl Property App (https://immowl.com)",
						Accept: "application/json",
					},
				})

				let result: { latitude: number; longitude: number } | null = null

				if (response.ok) {
					const data = (await response.json()) as Array<{
						lat: string
						lon: string
						display_name: string
					}>

					if (data && data.length > 0) {
						const item = data[0]
						result = {
							latitude: Number.parseFloat(item.lat),
							longitude: Number.parseFloat(item.lon),
						}
						console.log(
							`[Geocoding] Success: ${property.address.street}, ${property.address.city} -> (${result.latitude}, ${result.longitude})`,
						)
					}
				}

				if (result) {
					// Update the property with coordinates
					await ctx.runMutation(internal.geocodingQueries.updatePropertyCoordinates, {
						propertyId: property._id,
						latitude: result.latitude,
						longitude: result.longitude,
					})
					successful++
				} else {
					failed++
				}

				// Rate limiting: Wait 1.1 seconds between requests to respect 1 req/sec limit
				await new Promise((resolve) => setTimeout(resolve, 1100))
			} catch (error) {
				console.error(`[Geocoding] Failed to geocode property ${property._id}:`, error)
				failed++
			}
		}

		console.log(
			`[Geocoding] Batch complete: ${successful} successful, ${failed} failed out of ${properties.length}`,
		)

		return {
			processed: properties.length,
			successful,
			failed,
		}
	},
})