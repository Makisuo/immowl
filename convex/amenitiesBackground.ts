"use node"

import { Workpool } from "@convex-dev/workpool"
import { v } from "convex/values"
import { components, internal } from "./_generated/api"
import { internalAction } from "./_generated/server"

const amenitiesPool = new Workpool(components.amenitiesWorkpool, {
	maxParallelism: 1, // Respect Overpass API with one request at a time
})

/**
 * Enrich a single property with nearby amenities data
 * Designed to be used with workpool for batch processing
 */
export const enrichSingleProperty = internalAction({
	args: {
		propertyId: v.id("properties"),
		latitude: v.number(),
		longitude: v.number(),
		radius: v.optional(v.number()), // in meters, default 1000
	},
	returns: v.object({
		success: v.boolean(),
		propertyId: v.id("properties"),
		amenitiesCount: v.optional(v.number()),
		error: v.optional(v.string()),
	}),
	handler: async (ctx, args) => {
		try {
			const radius = args.radius || 1000

			console.log(
				`[Amenities] Enriching property ${args.propertyId} at (${args.latitude}, ${args.longitude})`,
			)

			// Fetch amenities from OpenStreetMap Overpass API
			const amenitiesData: any = await ctx.runAction(internal.overpass.getNearbyAmenities, {
				latitude: args.latitude,
				longitude: args.longitude,
				radius,
			})

			// Transform data for storage (store only counts and closest items)
			const storageData = {
				lastUpdated: Date.now(),
				radius,
				summary: amenitiesData.summary,
				restaurants: {
					count: amenitiesData.restaurants.count,
					closest: amenitiesData.restaurants.closest
						? {
								name: amenitiesData.restaurants.closest.name,
								distance: amenitiesData.restaurants.closest.distance,
								amenityType: amenitiesData.restaurants.closest.amenityType,
							}
						: undefined,
				},
				publicTransit: {
					count: amenitiesData.publicTransit.count,
					closest: amenitiesData.publicTransit.closest
						? {
								name: amenitiesData.publicTransit.closest.name,
								distance: amenitiesData.publicTransit.closest.distance,
								amenityType: amenitiesData.publicTransit.closest.amenityType,
							}
						: undefined,
				},
				trainStations: {
					count: amenitiesData.trainStations.count,
					closest: amenitiesData.trainStations.closest
						? {
								name: amenitiesData.trainStations.closest.name,
								distance: amenitiesData.trainStations.closest.distance,
								amenityType: amenitiesData.trainStations.closest.amenityType,
							}
						: undefined,
				},
				airports: {
					count: amenitiesData.airports.count,
					closest: amenitiesData.airports.closest
						? {
								name: amenitiesData.airports.closest.name,
								distance: amenitiesData.airports.closest.distance,
								amenityType: amenitiesData.airports.closest.amenityType,
							}
						: undefined,
				},
				shopping: {
					count: amenitiesData.shopping.count,
					closest: amenitiesData.shopping.closest
						? {
								name: amenitiesData.shopping.closest.name,
								distance: amenitiesData.shopping.closest.distance,
								amenityType: amenitiesData.shopping.closest.amenityType,
							}
						: undefined,
				},
				healthcare: {
					count: amenitiesData.healthcare.count,
					closest: amenitiesData.healthcare.closest
						? {
								name: amenitiesData.healthcare.closest.name,
								distance: amenitiesData.healthcare.closest.distance,
								amenityType: amenitiesData.healthcare.closest.amenityType,
							}
						: undefined,
				},
				financial: {
					count: amenitiesData.financial.count,
					closest: amenitiesData.financial.closest
						? {
								name: amenitiesData.financial.closest.name,
								distance: amenitiesData.financial.closest.distance,
								amenityType: amenitiesData.financial.closest.amenityType,
							}
						: undefined,
				},
				education: {
					count: amenitiesData.education.count,
					closest: amenitiesData.education.closest
						? {
								name: amenitiesData.education.closest.name,
								distance: amenitiesData.education.closest.distance,
								amenityType: amenitiesData.education.closest.amenityType,
							}
						: undefined,
				},
				recreation: {
					count: amenitiesData.recreation.count,
					closest: amenitiesData.recreation.closest
						? {
								name: amenitiesData.recreation.closest.name,
								distance: amenitiesData.recreation.closest.distance,
								amenityType: amenitiesData.recreation.closest.amenityType,
							}
						: undefined,
				},
				sports: {
					count: amenitiesData.sports.count,
					closest: amenitiesData.sports.closest
						? {
								name: amenitiesData.sports.closest.name,
								distance: amenitiesData.sports.closest.distance,
								amenityType: amenitiesData.sports.closest.amenityType,
							}
						: undefined,
				},
				parks: {
					count: amenitiesData.parks.count,
					closest: amenitiesData.parks.closest
						? {
								name: amenitiesData.parks.closest.name,
								distance: amenitiesData.parks.closest.distance,
								amenityType: amenitiesData.parks.closest.amenityType,
							}
						: undefined,
				},
				services: {
					count: amenitiesData.services.count,
					closest: amenitiesData.services.closest
						? {
								name: amenitiesData.services.closest.name,
								distance: amenitiesData.services.closest.distance,
								amenityType: amenitiesData.services.closest.amenityType,
							}
						: undefined,
				},
				worship: {
					count: amenitiesData.worship.count,
					closest: amenitiesData.worship.closest
						? {
								name: amenitiesData.worship.closest.name,
								distance: amenitiesData.worship.closest.distance,
								amenityType: amenitiesData.worship.closest.amenityType,
							}
						: undefined,
				},
			}

			// Store in database
			await ctx.runMutation(internal.amenities.updatePropertyAmenities, {
				propertyId: args.propertyId,
				amenitiesData: storageData,
			})

			console.log(
				`[Amenities] Success for property ${args.propertyId}: ${amenitiesData.summary.totalCount} amenities`,
			)

			return {
				success: true,
				propertyId: args.propertyId,
				amenitiesCount: amenitiesData.summary.totalCount,
			}
		} catch (error) {
			console.error(`[Amenities] Error for property ${args.propertyId}:`, error)
			return {
				success: false,
				propertyId: args.propertyId,
				error: error instanceof Error ? error.message : "Failed to enrich property",
			}
		}
	},
})

/**
 * Background task to enrich properties with amenity data
 * Uses workpool to respect Overpass API rate limits automatically
 */
export const enrichPropertiesInBackground = internalAction({
	args: {
		batchSize: v.optional(v.number()), // Number of properties to process
		radius: v.optional(v.number()), // Search radius in meters
	},
	returns: v.object({
		enqueued: v.number(),
	}),
	handler: async (ctx, args): Promise<{ enqueued: number }> => {
		const batchSize = args.batchSize || 50
		const radius = args.radius || 1000

		// Query properties with coordinates but no amenities
		const properties: Array<{
			_id: any
			title: string
			city: string
			hasCoordinates: boolean
			hasAmenities: boolean
		}> = await ctx.runQuery(internal.amenities.getPropertiesNeedingAmenities, {
			limit: batchSize,
		})

		if (properties.length === 0) {
			console.log("[Amenities] No properties found needing enrichment")
			return { enqueued: 0 }
		}

		console.log(`[Amenities] Enqueueing ${properties.length} properties for enrichment...`)

		// Get full property details with coordinates
		const propertiesWithCoords: Array<{
			propertyId: any
			latitude: number
			longitude: number
		}> = []

		for (const prop of properties) {
			const coords = await ctx.runQuery(internal.amenities.getPropertyCoordinates, {
				propertyId: prop._id,
			})

			if (coords && coords.latitude && coords.longitude) {
				propertiesWithCoords.push({
					propertyId: prop._id,
					latitude: coords.latitude,
					longitude: coords.longitude,
				})
			}
		}

		// Enqueue all properties to workpool for processing
		// The workpool will automatically respect the maxParallelism=1 rate limit
		await amenitiesPool.enqueueActionBatch(
			ctx,
			internal.amenitiesBackground.enrichSingleProperty,
			propertiesWithCoords.map((p) => ({
				propertyId: p.propertyId,
				latitude: p.latitude,
				longitude: p.longitude,
				radius,
			})),
		)

		console.log(`[Amenities] Successfully enqueued ${propertiesWithCoords.length} properties`)

		return {
			enqueued: propertiesWithCoords.length,
		}
	},
})
