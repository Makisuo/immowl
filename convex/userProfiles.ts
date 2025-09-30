import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getUser } from "./auth"
import { propertyTypeValidator } from "./validators"

// Get user's profile (returns null if doesn't exist)
export const getUserProfile = query({
	args: {},
	returns: v.union(
		v.object({
			_id: v.id("userProfiles"),
			_creationTime: v.number(),
			userId: v.id("users"),
			preferences: v.object({
				city: v.optional(v.string()),
				country: v.optional(v.string()),
				locationImportance: v.number(),
				propertyType: v.optional(propertyTypeValidator),
				propertyTypeImportance: v.number(),
				bedrooms: v.optional(v.number()),
				bedroomsImportance: v.number(),
				bathrooms: v.optional(v.number()),
				bathroomsImportance: v.number(),
				minSquareMeters: v.optional(v.number()),
				squareMetersImportance: v.number(),
				minPrice: v.optional(v.number()),
				maxPrice: v.optional(v.number()),
				priceImportance: v.number(),
				petFriendly: v.optional(v.boolean()),
				petFriendlyImportance: v.number(),
				furnished: v.optional(v.boolean()),
				furnishedImportance: v.number(),
				amenities: v.optional(v.array(v.string())),
				amenitiesImportance: v.number(),
			}),
			lastModified: v.number(),
		}),
		v.null(),
	),
	handler: async (ctx) => {
		const user = await getUser(ctx)

		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.first()

		return profile
	},
})

// Create or update user profile (upsert)
export const createOrUpdateUserProfile = mutation({
	args: {
		preferences: v.object({
			city: v.optional(v.string()),
			country: v.optional(v.string()),
			locationImportance: v.number(),
			propertyType: v.optional(propertyTypeValidator),
			propertyTypeImportance: v.number(),
			bedrooms: v.optional(v.number()),
			bedroomsImportance: v.number(),
			bathrooms: v.optional(v.number()),
			bathroomsImportance: v.number(),
			minSquareMeters: v.optional(v.number()),
			squareMetersImportance: v.number(),
			minPrice: v.optional(v.number()),
			maxPrice: v.optional(v.number()),
			priceImportance: v.number(),
			petFriendly: v.optional(v.boolean()),
			petFriendlyImportance: v.number(),
			furnished: v.optional(v.boolean()),
			furnishedImportance: v.number(),
			amenities: v.optional(v.array(v.string())),
			amenitiesImportance: v.number(),
		}),
	},
	returns: v.id("userProfiles"),
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		// Check if profile already exists
		const existingProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.first()

		const now = Date.now()

		// Normalize importance values to 0-100 range
		const clampWeight = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
		const normalizedPreferences = {
			...args.preferences,
			locationImportance: clampWeight(args.preferences.locationImportance),
			priceImportance: clampWeight(args.preferences.priceImportance),
			bedroomsImportance: clampWeight(args.preferences.bedroomsImportance),
			bathroomsImportance: clampWeight(args.preferences.bathroomsImportance),
			propertyTypeImportance: clampWeight(args.preferences.propertyTypeImportance),
			squareMetersImportance: clampWeight(args.preferences.squareMetersImportance),
			amenitiesImportance: clampWeight(args.preferences.amenitiesImportance),
			petFriendlyImportance: clampWeight(args.preferences.petFriendlyImportance),
			furnishedImportance: clampWeight(args.preferences.furnishedImportance),
		}

		if (existingProfile) {
			// Update existing profile
			await ctx.db.patch(existingProfile._id, {
				preferences: normalizedPreferences,
				lastModified: now,
			})
			return existingProfile._id
		} else {
			// Create new profile
			const profileId = await ctx.db.insert("userProfiles", {
				userId: user._id,
				preferences: normalizedPreferences,
				lastModified: now,
			})
			return profileId
		}
	},
})

// Get properties matching user's profile with weighted scoring
export const getMatchingProperties = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const user = await getUser(ctx)

		// Get user's profile
		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.first()

		if (!profile) {
			// Return empty results if no profile exists
			return {
				page: [],
				isDone: true,
				continueCursor: null,
			}
		}

		const { preferences } = profile

		// Build base query - start with active properties
		let query = ctx.db.query("properties").withIndex("by_status", (q) => q.eq("status", "active"))

		// Apply hard filters based on preferences
		const properties = await query.collect()

		// Filter and score properties
		const scoredProperties = properties
			.map((property) => {
				let score = 0
				let maxScore = 0

				// Location scoring
				if (preferences.city && preferences.locationImportance > 0) {
					maxScore += preferences.locationImportance
					if (
						property.address.city.toLowerCase() === preferences.city.toLowerCase() &&
						property.address.country.toLowerCase() === (preferences.country?.toLowerCase() ?? "")
					) {
						score += preferences.locationImportance
					}
				}

				// Price scoring (inverse - closer to range is better)
				if ((preferences.minPrice || preferences.maxPrice) && preferences.priceImportance > 0) {
					maxScore += preferences.priceImportance
					const rent = property.monthlyRent.warm ?? property.monthlyRent.cold ?? 0
					if (rent > 0) {
						const inRange =
							(!preferences.minPrice || rent >= preferences.minPrice) &&
							(!preferences.maxPrice || rent <= preferences.maxPrice)
						if (inRange) {
							score += preferences.priceImportance
						}
					}
				}

				// Bedrooms scoring
				if (preferences.bedrooms && preferences.bedroomsImportance > 0) {
					maxScore += preferences.bedroomsImportance
					if (property.rooms.bedrooms >= preferences.bedrooms) {
						score += preferences.bedroomsImportance
					}
				}

				// Bathrooms scoring
				if (preferences.bathrooms && preferences.bathroomsImportance > 0) {
					maxScore += preferences.bathroomsImportance
					if (property.rooms.bathrooms >= preferences.bathrooms) {
						score += preferences.bathroomsImportance
					}
				}

				// Property type scoring
				if (preferences.propertyType && preferences.propertyTypeImportance > 0) {
					maxScore += preferences.propertyTypeImportance
					if (property.propertyType === preferences.propertyType) {
						score += preferences.propertyTypeImportance
					}
				}

				// Square meters scoring
				if (preferences.minSquareMeters && preferences.squareMetersImportance > 0) {
					maxScore += preferences.squareMetersImportance
					if (property.squareMeters >= preferences.minSquareMeters) {
						score += preferences.squareMetersImportance
					}
				}

				// Pet friendly scoring
				if (preferences.petFriendly && preferences.petFriendlyImportance > 0) {
					maxScore += preferences.petFriendlyImportance
					if (property.petFriendly === true) {
						score += preferences.petFriendlyImportance
					}
				}

				// Furnished scoring
				if (preferences.furnished && preferences.furnishedImportance > 0) {
					maxScore += preferences.furnishedImportance
					if (property.furnished === true) {
						score += preferences.furnishedImportance
					}
				}

				// Amenities scoring
				if (preferences.amenities && preferences.amenities.length > 0 && preferences.amenitiesImportance > 0) {
					maxScore += preferences.amenitiesImportance
					const propertyAmenities = property.amenities ?? []
					const matchingAmenities = preferences.amenities.filter((a) =>
						propertyAmenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase())),
					)
					const amenityMatchRatio =
						preferences.amenities.length > 0 ? matchingAmenities.length / preferences.amenities.length : 0
					score += preferences.amenitiesImportance * amenityMatchRatio
				}

				// Calculate percentage score
				const percentageScore = maxScore > 0 ? (score / maxScore) * 100 : 0

				return {
					property,
					score: percentageScore,
				}
			})
			.filter((item) => item.score > 0) // Only include properties with some match
			.sort((a, b) => b.score - a.score) // Sort by score descending

		// Apply pagination manually
		const { numItems, cursor } = args.paginationOpts
		const startIndex = cursor ? Number.parseInt(cursor) : 0
		const endIndex = startIndex + numItems
		const paginatedResults = scoredProperties.slice(startIndex, endIndex)

		return {
			page: paginatedResults.map((item) => ({
				...item.property,
				matchScore: Math.round(item.score),
			})),
			isDone: endIndex >= scoredProperties.length,
			continueCursor: endIndex >= scoredProperties.length ? null : endIndex.toString(),
		}
	},
})