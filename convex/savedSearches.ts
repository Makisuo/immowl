import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getUser } from "./auth"
import { generateSearchName } from "./utils/generateSearchName"
import { propertyTypeValidator } from "./validators"

// Create a new saved search from wizard (with nested criteria structure)
export const createSavedSearchFromWizard = mutation({
	args: {
		criteria: v.object({
			city: v.string(),
			country: v.string(),
			propertyType: v.optional(propertyTypeValidator),
			minPrice: v.optional(v.number()),
			maxPrice: v.optional(v.number()),
			minSquareMeters: v.optional(v.number()),
			maxSquareMeters: v.optional(v.number()),
			bedrooms: v.optional(v.number()),
			bathrooms: v.optional(v.number()),
			amenities: v.optional(v.array(v.string())),
			petFriendly: v.optional(v.boolean()),
			furnished: v.optional(v.boolean()),
			weights: v.optional(
				v.object({
					location: v.optional(v.number()),
					price: v.optional(v.number()),
					bedrooms: v.optional(v.number()),
					bathrooms: v.optional(v.number()),
					amenities: v.optional(v.number()),
					petFriendly: v.optional(v.number()),
					furnished: v.optional(v.number()),
					propertyType: v.optional(v.number()),
				}),
			),
		}),
	},
	returns: v.id("savedSearches"),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)
		const now = Date.now()

		// Auto-generate search name based on criteria
		const name = generateSearchName({
			city: args.criteria.city,
			country: args.criteria.country,
			propertyType: args.criteria.propertyType,
			bedrooms: args.criteria.bedrooms,
			minPrice: args.criteria.minPrice,
			maxPrice: args.criteria.maxPrice,
		})

		// Normalize weights with defaults
		const clampInt = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
		const normalizedWeights = {
			location: clampInt(args.criteria.weights?.location ?? 50),
			price: clampInt(args.criteria.weights?.price ?? 50),
			bedrooms: clampInt(args.criteria.weights?.bedrooms ?? 50),
			bathrooms: clampInt(args.criteria.weights?.bathrooms ?? 50),
			amenities: clampInt(args.criteria.weights?.amenities ?? 50),
			petFriendly: clampInt(args.criteria.weights?.petFriendly ?? 50),
			furnished: clampInt(args.criteria.weights?.furnished ?? 50),
			propertyType: clampInt(args.criteria.weights?.propertyType ?? 50),
		}

		const savedSearchId = await ctx.db.insert("savedSearches", {
			userId: user._id,
			name,
			criteria: {
				...args.criteria,
				weights: normalizedWeights,
			},
			isActive: true,
			createdAt: now,
			lastModified: now,
		})

		return savedSearchId
	},
})

// Create a new saved search
export const createSavedSearch = mutation({
	args: {
		// Search criteria
		city: v.string(),
		country: v.string(),
		propertyType: v.optional(propertyTypeValidator),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		minSquareMeters: v.optional(v.number()),
		maxSquareMeters: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),
		// Grouped weights (optional)
		weights: v.optional(
			v.object({
				location: v.optional(v.number()),
				price: v.optional(v.number()),
				bedrooms: v.optional(v.number()),
				bathrooms: v.optional(v.number()),
				amenities: v.optional(v.number()),
				petFriendly: v.optional(v.number()),
				furnished: v.optional(v.number()),
				propertyType: v.optional(v.number()),
			}),
		),
	},
	returns: v.id("savedSearches"),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const now = Date.now()

		// Auto-generate search name based on criteria
		const name = generateSearchName({
			city: args.city,
			country: args.country,
			propertyType: args.propertyType,
			bedrooms: args.bedrooms,
			minPrice: args.minPrice,
			maxPrice: args.maxPrice,
		})

		// Normalize grouped weights with defaults and boolean overrides (0/100 for booleans)
		const clampInt = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
		const normalizedWeights = {
			location: clampInt(args.weights?.location ?? 50),
			price: clampInt(args.weights?.price ?? 50),
			bedrooms: clampInt(args.weights?.bedrooms ?? 50),
			bathrooms: clampInt(args.weights?.bathrooms ?? 50),
			amenities: clampInt(args.weights?.amenities ?? 50),
			petFriendly: 0,
			furnished: 0,
			propertyType: clampInt(args.weights?.propertyType ?? 50),
		}
		// Boolean selectable criteria => 0 or 100 based on selection
		normalizedWeights.petFriendly = args.petFriendly === true ? 100 : 0
		normalizedWeights.furnished = args.furnished === true ? 100 : 0

		const savedSearchId = await ctx.db.insert("savedSearches", {
			userId: user._id,
			name,

			// Search criteria (nested)
			criteria: {
				city: args.city,
				country: args.country,
				propertyType: args.propertyType,
				minPrice: args.minPrice,
				maxPrice: args.maxPrice,
				minSquareMeters: args.minSquareMeters,
				maxSquareMeters: args.maxSquareMeters,
				bedrooms: args.bedrooms,
				bathrooms: args.bathrooms,
				amenities: args.amenities,
				petFriendly: args.petFriendly,
				furnished: args.furnished,
				weights: normalizedWeights,
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

		// Search criteria
		city: v.optional(v.string()),
		country: v.optional(v.string()),
		propertyType: v.optional(propertyTypeValidator),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		minSquareMeters: v.optional(v.number()),
		maxSquareMeters: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),
		// Grouped weights (optional)
		weights: v.optional(
			v.object({
				location: v.optional(v.number()),
				price: v.optional(v.number()),
				bedrooms: v.optional(v.number()),
				bathrooms: v.optional(v.number()),
				amenities: v.optional(v.number()),
				petFriendly: v.optional(v.number()),
				furnished: v.optional(v.number()),
				propertyType: v.optional(v.number()),
			}),
		),
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

		// Build updated nested criteria (support legacy docs without `criteria`)
		const baseCriteria: any = (savedSearch as any).criteria ?? {
			city: (savedSearch as any).city,
			country: (savedSearch as any).country,
			propertyType: (savedSearch as any).propertyType,
			minPrice: (savedSearch as any).minPrice,
			maxPrice: (savedSearch as any).maxPrice,
			minSquareMeters: (savedSearch as any).minSquareMeters,
			maxSquareMeters: (savedSearch as any).maxSquareMeters,
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
		if (args.minSquareMeters !== undefined) updatedCriteria.minSquareMeters = args.minSquareMeters
		if (args.maxSquareMeters !== undefined) updatedCriteria.maxSquareMeters = args.maxSquareMeters
		if (args.bedrooms !== undefined) updatedCriteria.bedrooms = args.bedrooms
		if (args.bathrooms !== undefined) updatedCriteria.bathrooms = args.bathrooms
		if (args.amenities !== undefined) updatedCriteria.amenities = args.amenities
		if (args.petFriendly !== undefined) updatedCriteria.petFriendly = args.petFriendly
		if (args.furnished !== undefined) updatedCriteria.furnished = args.furnished

		// Normalize/merge weights
		const clampInt2 = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
		const existingWeights = (baseCriteria?.weights as any) ?? {}
		const mergedWeights: any = {
			location: 50,
			price: 50,
			bedrooms: 50,
			bathrooms: 50,
			amenities: 50,
			petFriendly: 0,
			furnished: 0,
			propertyType: 50,
			...existingWeights,
		}
		if (args.weights) {
			if (args.weights.location !== undefined) mergedWeights.location = clampInt2(args.weights.location)
			if (args.weights.price !== undefined) mergedWeights.price = clampInt2(args.weights.price)
			if (args.weights.bedrooms !== undefined) mergedWeights.bedrooms = clampInt2(args.weights.bedrooms)
			if (args.weights.bathrooms !== undefined)
				mergedWeights.bathrooms = clampInt2(args.weights.bathrooms)
			if (args.weights.amenities !== undefined)
				mergedWeights.amenities = clampInt2(args.weights.amenities)
			if (args.weights.petFriendly !== undefined)
				mergedWeights.petFriendly = clampInt2(args.weights.petFriendly)
			if (args.weights.furnished !== undefined)
				mergedWeights.furnished = clampInt2(args.weights.furnished)
			if (args.weights.propertyType !== undefined)
				mergedWeights.propertyType = clampInt2(args.weights.propertyType)
		}
		// Boolean selectable criteria => 0 or 100 based on selection
		mergedWeights.petFriendly = updatedCriteria.petFriendly === true ? 100 : 0
		mergedWeights.furnished = updatedCriteria.furnished === true ? 100 : 0

		updates.criteria = { ...updatedCriteria, weights: mergedWeights }

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
			minSquareMeters: (savedSearch as any).minSquareMeters,
			maxSquareMeters: (savedSearch as any).maxSquareMeters,
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
			minSquareMeters: criteria1.minSquareMeters,
			maxSquareMeters: criteria1.maxSquareMeters,
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
			minSquareMeters: (savedSearch as any).minSquareMeters,
			maxSquareMeters: (savedSearch as any).maxSquareMeters,
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
			minSquareMeters: criteria2.minSquareMeters,
			maxSquareMeters: criteria2.maxSquareMeters,
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
