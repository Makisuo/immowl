"use node"

import { v } from "convex/values"
import { api, internal } from "./_generated/api"
import { action, internalAction } from "./_generated/server"

/**
 * Fetch and cache nearby amenities for a property
 * This action fetches data from OpenStreetMap and stores it in the property record
 */
export const fetchAndCachePropertyAmenities = action({
	args: {
		propertyId: v.id("properties"),
		radius: v.optional(v.number()), // in meters, default 1000
	},
	returns: v.object({
		success: v.boolean(),
		error: v.optional(v.string()),
		amenitiesCount: v.optional(v.number()),
	}),
	handler: async (ctx, args): Promise<{ success: boolean; error?: string; amenitiesCount?: number }> => {
		try {
			// Get property coordinates
			const property: { latitude?: number; longitude?: number } | null = await ctx.runQuery(
				internal.amenities.getPropertyCoordinates,
				{
					propertyId: args.propertyId,
				},
			)

			if (!property) {
				return {
					success: false,
					error: "Property not found",
				}
			}

			if (!property.latitude || !property.longitude) {
				return {
					success: false,
					error: "Property has no coordinates. Please geocode it first.",
				}
			}

			// Fetch amenities from OpenStreetMap
			const amenitiesData: any = await ctx.runAction(internal.overpass.getNearbyAmenities, {
				latitude: property.latitude,
				longitude: property.longitude,
				radius: args.radius || 1000,
			})

			// Transform data for storage (store only counts and closest items)
			const storageData = {
				lastUpdated: Date.now(),
				radius: args.radius || 1000,
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
				`[Amenities] Cached ${amenitiesData.summary.totalCount} amenities for property ${args.propertyId}`,
			)

			return {
				success: true,
				amenitiesCount: amenitiesData.summary.totalCount,
			}
		} catch (error) {
			console.error("[Amenities] Error:", error)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch amenities",
			}
		}
	},
})

/**
 * Action to batch fetch amenities for multiple properties
 */
export const batchFetchAmenities = internalAction({
	args: {
		propertyIds: v.array(v.id("properties")),
		radius: v.optional(v.number()),
		delayMs: v.optional(v.number()), // delay between requests to be respectful
	},
	returns: v.object({
		processed: v.number(),
		successful: v.number(),
		failed: v.number(),
	}),
	handler: async (ctx, args) => {
		const delayMs = args.delayMs || 1000 // 1 second default delay
		let successful = 0
		let failed = 0

		for (const propertyId of args.propertyIds) {
			const result = await ctx.runAction(api.amenitiesActions.fetchAndCachePropertyAmenities, {
				propertyId,
				radius: args.radius,
			})

			if (result.success) {
				successful++
			} else {
				failed++
				console.error(`[Amenities] Failed for property ${propertyId}: ${result.error}`)
			}

			// Respectful delay between requests
			if (delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, delayMs))
			}
		}

		console.log(
			`[Amenities] Batch complete: ${successful} successful, ${failed} failed out of ${args.propertyIds.length} properties`,
		)

		return {
			processed: args.propertyIds.length,
			successful,
			failed,
		}
	},
})
