import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { internalMutation, internalQuery, mutation, query } from "./_generated/server"
import { getUser } from "./auth"
import { propertyTypeValidator, propertySortByValidator } from "./validators"

// Create a new saved search
export const createSavedSearch = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),

		// Search criteria
		city: v.string(),
		country: v.string(),
		propertyType: v.optional(propertyTypeValidator),
		sortBy: propertySortByValidator,
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),

		// Notification settings
		notificationsEnabled: v.boolean(),
		emailNotifications: v.boolean(),
	},
	returns: v.id("savedSearches"),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		const now = Date.now()

		const savedSearchId = await ctx.db.insert("savedSearches", {
			userId: user._id,
			name: args.name,
			description: args.description,

			// Search criteria
			city: args.city,
			country: args.country,
			propertyType: args.propertyType,
			sortBy: args.sortBy,
			minPrice: args.minPrice,
			maxPrice: args.maxPrice,
			bedrooms: args.bedrooms,
			bathrooms: args.bathrooms,
			amenities: args.amenities,
			petFriendly: args.petFriendly,
			furnished: args.furnished,

			// Notification settings
			notificationsEnabled: args.notificationsEnabled,
			emailNotifications: args.emailNotifications,
			lastNotificationSent: undefined,

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
		sortBy: v.optional(propertySortByValidator),
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),

		// Notification settings
		notificationsEnabled: v.optional(v.boolean()),
		emailNotifications: v.optional(v.boolean()),
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

		// Only update provided fields
		if (args.name !== undefined) updates.name = args.name
		if (args.description !== undefined) updates.description = args.description
		if (args.city !== undefined) updates.city = args.city
		if (args.country !== undefined) updates.country = args.country
		if (args.propertyType !== undefined) updates.propertyType = args.propertyType
		if (args.sortBy !== undefined) updates.sortBy = args.sortBy
		if (args.minPrice !== undefined) updates.minPrice = args.minPrice
		if (args.maxPrice !== undefined) updates.maxPrice = args.maxPrice
		if (args.bedrooms !== undefined) updates.bedrooms = args.bedrooms
		if (args.bathrooms !== undefined) updates.bathrooms = args.bathrooms
		if (args.amenities !== undefined) updates.amenities = args.amenities
		if (args.petFriendly !== undefined) updates.petFriendly = args.petFriendly
		if (args.furnished !== undefined) updates.furnished = args.furnished
		if (args.notificationsEnabled !== undefined) updates.notificationsEnabled = args.notificationsEnabled
		if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications

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
export const toggleNotifications = mutation({
	args: {
		searchId: v.id("savedSearches"),
		notificationsEnabled: v.boolean(),
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
			notificationsEnabled: args.notificationsEnabled,
			lastModified: Date.now(),
		})

		return null
	},
})

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

		const filteredQuery = buildPropertyQuery(ctx, {
			city: savedSearch.city,
			country: savedSearch.country,
			propertyType: savedSearch.propertyType,
			minPrice: savedSearch.minPrice,
			maxPrice: savedSearch.maxPrice,
			bedrooms: savedSearch.bedrooms,
			bathrooms: savedSearch.bathrooms,
			amenities: savedSearch.amenities,
			petFriendly: savedSearch.petFriendly,
			furnished: savedSearch.furnished,
		})

		const orderedQuery = applySorting(filteredQuery, savedSearch.sortBy)
		const result = await orderedQuery.paginate(args.paginationOpts)

		// Apply client-side sorting for price-based sorts
		sortPaginatedResults(result.page, savedSearch.sortBy)

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

		const filteredQuery = buildPropertyQuery(ctx, {
			city: savedSearch.city,
			country: savedSearch.country,
			propertyType: savedSearch.propertyType,
			minPrice: savedSearch.minPrice,
			maxPrice: savedSearch.maxPrice,
			bedrooms: savedSearch.bedrooms,
			bathrooms: savedSearch.bathrooms,
			amenities: savedSearch.amenities,
			petFriendly: savedSearch.petFriendly,
			furnished: savedSearch.furnished,
		})

		const properties = await filteredQuery.collect()
		return properties.length
	},
})

// Internal query to get saved searches for notification checking
export const getActiveSearchesForNotification = internalQuery({
	args: {},
	handler: async (ctx) => {
		const searches = await ctx.db
			.query("savedSearches")
			.withIndex("by_notifications", (q) => q.eq("notificationsEnabled", true).eq("isActive", true))
			.collect()

		return searches
	},
})

// Internal mutation to update last notification timestamp
export const updateLastNotificationSent = internalMutation({
	args: {
		searchId: v.id("savedSearches"),
		timestamp: v.number(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.searchId, {
			lastNotificationSent: args.timestamp,
		})
		return null
	},
})
