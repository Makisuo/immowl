import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getUser } from "./auth"

export const toggleSaveProperty = mutation({
	args: {
		propertyId: v.id("properties"),
	},
	returns: v.object({
		saved: v.boolean(),
	}),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		// Check if property exists and is active
		const property = await ctx.db.get(args.propertyId)
		if (!property || property.status !== "active") {
			throw new Error("Property not found or not available")
		}

		// Check if already saved
		const existing = await ctx.db
			.query("savedProperties")
			.withIndex("by_user_and_property", (q) =>
				q.eq("userId", user._id).eq("propertyId", args.propertyId),
			)
			.unique()

		if (existing) {
			// Unsave
			await ctx.db.delete(existing._id)
			return { saved: false }
		} else {
			// Save
			await ctx.db.insert("savedProperties", {
				userId: user._id,
				propertyId: args.propertyId,
			})
			return { saved: true }
		}
	},
})

export const isSaved = query({
	args: {
		propertyId: v.id("properties"),
	},
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const saved = await ctx.db
			.query("savedProperties")
			.withIndex("by_user_and_property", (q) =>
				q.eq("userId", user._id).eq("propertyId", args.propertyId),
			)
			.unique()

		return saved !== null
	},
})

export const listSavedProperties = query({
	args: {
		propertyType: v.optional(
			v.union(
				v.literal("apartment"),
				v.literal("house"),
				v.literal("condo"),
				v.literal("townhouse"),
				v.literal("studio"),
			),
		),
		city: v.optional(v.string()),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		sortBy: v.optional(
			v.union(
				v.literal("date-saved"),
				v.literal("price-low"),
				v.literal("price-high"),
				v.literal("newest"),
			),
		),
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		// Get all saved property records for the user
		const savedRecords = await ctx.db
			.query("savedProperties")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect()

		// Get the actual properties
		const properties = await Promise.all(
			savedRecords.map(async (record) => {
				const property = await ctx.db.get(record.propertyId)
				if (!property || property.status !== "active") {
					return null
				}
				return {
					...property,
					savedAt: record._creationTime,
				}
			}),
		)

		// Filter out nulls and apply filters
		let filteredProperties = properties.filter((p) => p !== null)

		if (args.propertyType) {
			filteredProperties = filteredProperties.filter((p) => p.propertyType === args.propertyType)
		}

		if (args.city) {
			filteredProperties = filteredProperties.filter((p) => p.city === args.city)
		}

		if (args.minPrice !== undefined) {
			filteredProperties = filteredProperties.filter((p) => p.monthlyRent >= args.minPrice!)
		}

		if (args.maxPrice !== undefined) {
			filteredProperties = filteredProperties.filter((p) => p.monthlyRent <= args.maxPrice!)
		}

		// Sort
		switch (args.sortBy) {
			case "price-low":
				filteredProperties.sort((a, b) => a.monthlyRent - b.monthlyRent)
				break
			case "price-high":
				filteredProperties.sort((a, b) => b.monthlyRent - a.monthlyRent)
				break
			case "newest":
				filteredProperties.sort((a, b) => b._creationTime - a._creationTime)
				break
			default:
				// Already sorted by saved date (desc) from the query
				break
		}

		return filteredProperties
	},
})

export const getSavedCount = query({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		const user = await getUser(ctx)

		const savedRecords = await ctx.db
			.query("savedProperties")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect()

		// Verify properties are still active
		let activeCount = 0
		for (const record of savedRecords) {
			const property = await ctx.db.get(record.propertyId)
			if (property && property.status === "active") {
				activeCount++
			}
		}

		return activeCount
	},
})

export const getSavedPropertyIds = query({
	args: {},
	returns: v.array(v.id("properties")),
	handler: async (ctx) => {
		const user = await getUser(ctx)

		const saved = await ctx.db
			.query("savedProperties")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect()

		return saved.map((s) => s.propertyId)
	},
})
