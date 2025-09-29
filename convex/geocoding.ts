"use node"

import { Workpool } from "@convex-dev/workpool"
import { v } from "convex/values"
import { action, internalAction } from "./_generated/server"
import { components, internal } from "./_generated/api"

const geocodePool = new Workpool(components.geocodeWorkpool, {
	maxParallelism: 1, // Respect Nominatim's 1 req/sec rate limit
})

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
 * Geocode a single property and update its coordinates
 * Designed to be used with workpool for batch processing
 */
export const geocodeSingleProperty = internalAction({
	args: {
		propertyId: v.id("properties"),
		street: v.string(),
		city: v.string(),
		state: v.string(),
		country: v.string(),
		zipCode: v.string(),
	},
	returns: v.object({
		success: v.boolean(),
		propertyId: v.id("properties"),
		coordinates: v.optional(
			v.object({
				latitude: v.number(),
				longitude: v.number(),
			}),
		),
	}),
	handler: async (ctx, args) => {
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

			console.log(`[Geocoding] Property ${args.propertyId}: ${args.street}, ${args.city}`)

			const response = await fetch(url, {
				headers: {
					"User-Agent": "Immowl Property App (https://immowl.com)",
					Accept: "application/json",
				},
			})

			if (!response.ok) {
				console.error(`[Geocoding] HTTP error ${response.status} for property ${args.propertyId}`)
				return {
					success: false,
					propertyId: args.propertyId,
				}
			}

			const data = (await response.json()) as Array<{
				lat: string
				lon: string
				display_name: string
			}>

			if (!data || data.length === 0) {
				console.warn(
					`[Geocoding] No results for property ${args.propertyId}: ${args.street}, ${args.city}`,
				)
				return {
					success: false,
					propertyId: args.propertyId,
				}
			}

			const result = data[0]
			const latitude = Number.parseFloat(result.lat)
			const longitude = Number.parseFloat(result.lon)

			// Update property coordinates
			await ctx.runMutation(internal.geocodingQueries.updatePropertyCoordinates, {
				propertyId: args.propertyId,
				latitude,
				longitude,
			})

			console.log(
				`[Geocoding] Success for property ${args.propertyId}: (${latitude}, ${longitude})`,
			)

			return {
				success: true,
				propertyId: args.propertyId,
				coordinates: {
					latitude,
					longitude,
				},
			}
		} catch (error) {
			console.error(`[Geocoding] Error for property ${args.propertyId}:`, error)
			return {
				success: false,
				propertyId: args.propertyId,
			}
		}
	},
})

/**
 * Background task to geocode properties with missing coordinates
 * Uses workpool to respect Nominatim rate limit automatically
 */
export const geocodePropertiesInBackground = internalAction({
	args: {
		batchSize: v.optional(v.number()), // Number of properties to process
		city: v.optional(v.string()), // Filter by city
	},
	returns: v.object({
		enqueued: v.number(),
	}),
	handler: async (ctx, args): Promise<{ enqueued: number }> => {
		const batchSize = args.batchSize || 100

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
		}> = await ctx.runQuery(
			internal.geocodingQueries.getPropertiesWithoutCoordinates,
			{
				limit: batchSize,
				city: args.city,
			},
		)

		if (properties.length === 0) {
			console.log("[Geocoding] No properties found without coordinates")
			return { enqueued: 0 }
		}

		console.log(`[Geocoding] Enqueueing ${properties.length} properties for geocoding...`)

		// Enqueue all properties to workpool for processing
		// The workpool will automatically respect the maxParallelism=1 rate limit
		await geocodePool.enqueueActionBatch(
			ctx,
			internal.geocoding.geocodeSingleProperty,
			properties.map((p) => ({
				propertyId: p._id,
				street: p.address.street,
				city: p.address.city,
				state: p.address.state,
				country: p.address.country,
				zipCode: p.address.zipCode,
			})),
		)

		console.log(`[Geocoding] Successfully enqueued ${properties.length} properties`)

		return {
			enqueued: properties.length,
		}
	},
})