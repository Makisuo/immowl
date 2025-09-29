import { v } from "convex/values"
import { internalMutation, internalQuery } from "./_generated/server"

/**
 * Internal query to get properties without coordinates
 * This is in a separate file because queries cannot use "use node"
 */
export const getPropertiesWithoutCoordinates = internalQuery({
	args: {
		limit: v.number(),
		city: v.optional(v.string()),
	},
	returns: v.array(
		v.object({
			_id: v.id("properties"),
			address: v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				country: v.string(),
				zipCode: v.string(),
				latitude: v.optional(v.number()),
				longitude: v.optional(v.number()),
			}),
		}),
	),
	handler: async (ctx, args) => {
		// Query properties where coordinates are missing or invalid
		const allProperties = await ctx.db
			.query("properties")
			.filter((q) => q.eq(q.field("status"), "active"))
			.collect()

		// Filter properties without valid coordinates
		const propertiesWithoutCoords = allProperties.filter((p) => {
			const hasNoLat = p.address.latitude === undefined || p.address.latitude === null
			const hasNoLng = p.address.longitude === undefined || p.address.longitude === null
			const matchesCity = !args.city || p.address.city === args.city

			return (hasNoLat || hasNoLng) && matchesCity
		})

		// Take only the requested limit and return simplified structure
		return propertiesWithoutCoords.slice(0, args.limit).map((p) => ({
			_id: p._id,
			address: {
				street: p.address.street,
				city: p.address.city,
				state: p.address.state,
				country: p.address.country,
				zipCode: p.address.zipCode,
				latitude: p.address.latitude,
				longitude: p.address.longitude,
			},
		}))
	},
})

/**
 * Internal mutation to update a single property's coordinates
 */
export const updatePropertyCoordinates = internalMutation({
	args: {
		propertyId: v.id("properties"),
		latitude: v.number(),
		longitude: v.number(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const property = await ctx.db.get(args.propertyId)
		if (!property) {
			return null
		}

		await ctx.db.patch(args.propertyId, {
			address: {
				...property.address,
				latitude: args.latitude,
				longitude: args.longitude,
			},
		})
		return null
	},
})
