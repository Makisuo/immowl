import { v } from "convex/values"
import { internalMutation, internalQuery, query } from "./_generated/server"

/**
 * Internal query to get property coordinates
 */
export const getPropertyCoordinates = internalQuery({
	args: {
		propertyId: v.id("properties"),
	},
	returns: v.union(
		v.object({
			latitude: v.optional(v.number()),
			longitude: v.optional(v.number()),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const property = await ctx.db.get(args.propertyId)
		if (!property) return null

		return {
			latitude: property.address.latitude,
			longitude: property.address.longitude,
		}
	},
})

/**
 * Internal mutation to update property with amenities data
 */
export const updatePropertyAmenities = internalMutation({
	args: {
		propertyId: v.id("properties"),
		amenitiesData: v.any(), // Complex nested structure
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.propertyId, {
			nearbyAmenities: args.amenitiesData,
		})
		return null
	},
})

/**
 * Query to get property with cached amenities
 */
export const getPropertyWithAmenities = query({
	args: {
		propertyId: v.id("properties"),
	},
	returns: v.union(
		v.object({
			_id: v.id("properties"),
			title: v.string(),
			address: v.object({
				fullAddress: v.string(),
				city: v.string(),
				latitude: v.optional(v.number()),
				longitude: v.optional(v.number()),
			}),
			nearbyAmenities: v.optional(v.any()),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const property = await ctx.db.get(args.propertyId)
		if (!property) return null

		return {
			_id: property._id,
			title: property.title,
			address: {
				fullAddress: property.address.fullAddress,
				city: property.address.city,
				latitude: property.address.latitude,
				longitude: property.address.longitude,
			},
			nearbyAmenities: property.nearbyAmenities,
		}
	},
})

/**
 * Query to get properties that need amenity data
 * (have coordinates but no cached amenities)
 */
export const getPropertiesNeedingAmenities = internalQuery({
	args: {
		limit: v.optional(v.number()),
	},
	returns: v.array(
		v.object({
			_id: v.id("properties"),
			title: v.string(),
			city: v.string(),
			hasCoordinates: v.boolean(),
			hasAmenities: v.boolean(),
		}),
	),
	handler: async (ctx, args) => {
		const limit = args.limit || 100

		// Get all active properties
		const properties = await ctx.db
			.query("properties")
			.withIndex("by_status", (q) => q.eq("status", "active"))
			.take(limit)

		// Filter for properties with coordinates but no amenities
		const needingAmenities = properties
			.filter((p) => {
				const hasCoordinates = p.address.latitude !== undefined && p.address.longitude !== undefined
				const hasAmenities = p.nearbyAmenities !== undefined
				return hasCoordinates && !hasAmenities
			})
			.map((p) => ({
				_id: p._id,
				title: p.title,
				city: p.address.city,
				hasCoordinates: true,
				hasAmenities: false,
			}))

		return needingAmenities
	},
})

