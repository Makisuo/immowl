import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getUser } from "./auth"
import { propertyTypeValidator } from "./validators"

// Create a new saved search
export const createSavedSearch = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),

		// Search criteria
		city: v.string(),
		country: v.string(),
		propertyType: v.optional(propertyTypeValidator),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),
	},
	returns: v.id("savedSearches"),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const now = Date.now()

		const savedSearchId = await ctx.db.insert("savedSearches", {
			userId: user._id,
			name: args.name,
			description: args.description,

			// Search criteria (nested)
			criteria: {
				city: args.city,
				country: args.country,
				propertyType: args.propertyType,
				minPrice: args.minPrice,
				maxPrice: args.maxPrice,
				bedrooms: args.bedrooms,
				bathrooms: args.bathrooms,
				amenities: args.amenities,
				petFriendly: args.petFriendly,
				furnished: args.furnished,
			},

			// Metadata
			isActive: true,
			createdAt: now,
			lastModified: now,
		})

		return savedSearchId
	},
})

// Update an existing saved search
export const updateSavedSearch = mutation({
	args: {
		searchId: v.id("savedSearches"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),

		// Search criteria
		city: v.optional(v.string()),
		country: v.optional(v.string()),
		propertyType: v.optional(propertyTypeValidator),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		if (!savedSearch) {
			throw new Error("Saved search not found")
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		const updates: any = {
			lastModified: Date.now(),
		}

		// Only update provided fields (top-level)
		if (args.name !== undefined) updates.name = args.name
		if (args.description !== undefined) updates.description = args.description

		// Build updated nested criteria (support legacy docs without `criteria`)
		const baseCriteria: any = (savedSearch as any).criteria ?? {
			city: (savedSearch as any).city,
			country: (savedSearch as any).country,
			propertyType: (savedSearch as any).propertyType,
			minPrice: (savedSearch as any).minPrice,
			maxPrice: (savedSearch as any).maxPrice,
			bedrooms: (savedSearch as any).bedrooms,
			bathrooms: (savedSearch as any).bathrooms,
			amenities: (savedSearch as any).amenities,
			petFriendly: (savedSearch as any).petFriendly,
			furnished: (savedSearch as any).furnished,
		}
		const updatedCriteria: any = { ...baseCriteria }
		if (args.city !== undefined) updatedCriteria.city = args.city
		if (args.country !== undefined) updatedCriteria.country = args.country
		if (args.propertyType !== undefined) updatedCriteria.propertyType = args.propertyType
		if (args.minPrice !== undefined) updatedCriteria.minPrice = args.minPrice
		if (args.maxPrice !== undefined) updatedCriteria.maxPrice = args.maxPrice
		if (args.bedrooms !== undefined) updatedCriteria.bedrooms = args.bedrooms
		if (args.bathrooms !== undefined) updatedCriteria.bathrooms = args.bathrooms
		if (args.amenities !== undefined) updatedCriteria.amenities = args.amenities
		if (args.petFriendly !== undefined) updatedCriteria.petFriendly = args.petFriendly
		if (args.furnished !== undefined) updatedCriteria.furnished = args.furnished

		updates.criteria = updatedCriteria

		await ctx.db.patch(args.searchId, updates)
		return null
	},
})

// Delete a saved search
export const deleteSavedSearch = mutation({
	args: {
		searchId: v.id("savedSearches"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		if (!savedSearch) {
			throw new Error("Saved search not found")
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		await ctx.db.delete(args.searchId)
		return null
	},
})

// Toggle saved search active status
export const toggleSavedSearchStatus = mutation({
	args: {
		searchId: v.id("savedSearches"),
		isActive: v.boolean(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		if (!savedSearch) {
			throw new Error("Saved search not found")
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		await ctx.db.patch(args.searchId, {
			isActive: args.isActive,
			lastModified: Date.now(),
		})

		return null
	},
})

// Toggle notifications for a saved search
// Get user's saved searches (both active and inactive)
export const listUserSavedSearches = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const result = await ctx.db
			.query("savedSearches")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.paginate(args.paginationOpts)

		return result
	},
})

// Get a single saved search by ID
export const getSavedSearchById = query({
	args: {
		searchId: v.id("savedSearches"),
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		console.log("savedSearch", savedSearch)
		if (!savedSearch) {
			return null
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		return savedSearch
	},
})

// Get properties matching a saved search
export const getSavedSearchResults = query({
	args: {
		searchId: v.id("savedSearches"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		if (!savedSearch) {
			throw new Error("Saved search not found")
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		// Use the same logic as the main property search
		const { buildPropertyQuery, applySorting, sortPaginatedResults } = await import("./propertyUtils")

		// Handle legacy docs that might not have `criteria`
		const criteria1: any = (savedSearch as any).criteria ?? {
			city: (savedSearch as any).city,
			country: (savedSearch as any).country,
			propertyType: (savedSearch as any).propertyType,
			minPrice: (savedSearch as any).minPrice,
			maxPrice: (savedSearch as any).maxPrice,
			bedrooms: (savedSearch as any).bedrooms,
			bathrooms: (savedSearch as any).bathrooms,
			amenities: (savedSearch as any).amenities,
			petFriendly: (savedSearch as any).petFriendly,
			furnished: (savedSearch as any).furnished,
		}
		const filteredQuery = buildPropertyQuery(ctx, {
			city: criteria1.city,
			country: criteria1.country,
			propertyType: criteria1.propertyType,
			minPrice: criteria1.minPrice,
			maxPrice: criteria1.maxPrice,
			bedrooms: criteria1.bedrooms,
			bathrooms: criteria1.bathrooms,
			amenities: criteria1.amenities,
			petFriendly: criteria1.petFriendly,
			furnished: criteria1.furnished,
		})

		const orderedQuery = applySorting(filteredQuery)
		const result = await orderedQuery.paginate(args.paginationOpts)

		// Apply client-side sorting when needed (uses default newest when no sort specified)
		sortPaginatedResults(result.page)

		return result
	},
})

// Get count of properties matching a saved search
export const getSavedSearchCount = query({
	args: {
		searchId: v.id("savedSearches"),
	},
	returns: v.number(),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const savedSearch = await ctx.db.get(args.searchId)
		if (!savedSearch) {
			throw new Error("Saved search not found")
		}

		if (savedSearch.userId !== user._id) {
			throw new Error("Unauthorized")
		}

		// Use the same logic as the main property search
		const { buildPropertyQuery } = await import("./propertyUtils")

		// Handle legacy docs that might not have `criteria`
		const criteria2: any = (savedSearch as any).criteria ?? {
			city: (savedSearch as any).city,
			country: (savedSearch as any).country,
			propertyType: (savedSearch as any).propertyType,
			minPrice: (savedSearch as any).minPrice,
			maxPrice: (savedSearch as any).maxPrice,
			bedrooms: (savedSearch as any).bedrooms,
			bathrooms: (savedSearch as any).bathrooms,
			amenities: (savedSearch as any).amenities,
			petFriendly: (savedSearch as any).petFriendly,
			furnished: (savedSearch as any).furnished,
		}
		const filteredQuery = buildPropertyQuery(ctx, {
			city: criteria2.city,
			country: criteria2.country,
			propertyType: criteria2.propertyType,
			minPrice: criteria2.minPrice,
			maxPrice: criteria2.maxPrice,
			bedrooms: criteria2.bedrooms,
			bathrooms: criteria2.bathrooms,
			amenities: criteria2.amenities,
			petFriendly: criteria2.petFriendly,
			furnished: criteria2.furnished,
		})

		const properties = await filteredQuery.collect()
		return properties.length
	},
})
