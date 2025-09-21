import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getUser } from "./auth"
import { sortPaginatedResults } from "./propertyUtils"
import { propertyFiltersValidator } from "./validators"

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
	args: propertyFiltersValidator,
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		// Get all saved property records for the user
		const savedRecords = await ctx.db
			.query("savedProperties")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect()

		// Get the actual properties with their saved dates
		const propertiesWithSavedDate = await Promise.all(
			savedRecords.map(async (record) => {
				const property = await ctx.db.get(record.propertyId)
				if (!property || property.status !== "active") {
					return null
				}
				return {
					property,
					savedDate: record._creationTime,
				}
			}),
		)

		// Filter out nulls and extract properties for filtering
		let filteredResults = propertiesWithSavedDate.filter((p) => p !== null)

		if (args.propertyType) {
			filteredResults = filteredResults.filter((p) => p.property.propertyType === args.propertyType)
		}

		if (args.city) {
			filteredResults = filteredResults.filter((p) => p.property.city === args.city)
		}

		if (args.minPrice !== undefined) {
			filteredResults = filteredResults.filter((p) => p.property.monthlyRent >= args.minPrice!)
		}

		if (args.maxPrice !== undefined) {
			filteredResults = filteredResults.filter((p) => p.property.monthlyRent <= args.maxPrice!)
		}

		// Apply sorting using shared utility
		// Extract just the properties for sorting
		const properties = filteredResults.map((r) => r.property)
		sortPaginatedResults(properties, args.sortBy)

		// Rebuild the results with sorted properties
		if (args.sortBy && args.sortBy !== "date-saved") {
			const propertyToSavedDate = new Map(filteredResults.map((r) => [r.property._id, r.savedDate]))
			filteredResults = properties.map((property) => ({
				property,
				savedDate: propertyToSavedDate.get(property._id)!,
			}))
		}

		return filteredResults
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
