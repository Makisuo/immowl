import type { OrderedQuery, Query, QueryInitializer } from "convex/server"
import type { DataModel } from "./_generated/dataModel"

/**
 * Builds a query for properties based on provided filters.
 * This shared logic is used by both listProperties and getTotalCount to avoid duplication.
 */
export function buildPropertyQuery(
	ctx: { db: { query: (tableName: "properties") => QueryInitializer<DataModel["properties"]> } },
	filters: {
		city?: string
		propertyType?: "apartment" | "house" | "condo" | "townhouse" | "studio"
		country?: string
		minPrice?: number
		maxPrice?: number
		bedrooms?: number
		bathrooms?: number
		amenities?: string[]
		petFriendly?: boolean
		furnished?: boolean
	},
): Query<DataModel["properties"]> {
	// Stage 1: Create the initial table query
	const tableQuery = ctx.db.query("properties")

	// Stage 2: Apply index based on filters
	let indexedQuery: Query<DataModel["properties"]>

	if (filters.city && filters.propertyType) {
		// Use composite index if both filters are present
		indexedQuery = tableQuery
			.withIndex("by_status_and_city", (q) =>
				q.eq("status", "active").eq("address.city", filters.city!),
			)
			.filter((q) => q.eq(q.field("propertyType"), filters.propertyType))
	} else if (filters.city) {
		// Use city index
		indexedQuery = tableQuery.withIndex("by_status_and_city", (q) =>
			q.eq("status", "active").eq("address.city", filters.city!),
		)
	} else if (filters.propertyType) {
		// Use property type index
		indexedQuery = tableQuery.withIndex("by_status_and_property_type", (q) =>
			q.eq("status", "active").eq("propertyType", filters.propertyType!),
		)
	} else {
		// Use status index for general queries
		indexedQuery = tableQuery.withIndex("by_status", (q) => q.eq("status", "active"))
	}

	// Stage 3: Apply additional filters
	let filteredQuery = indexedQuery

	// Country filter (no index for country)
	if (filters.country) {
		filteredQuery = filteredQuery.filter((q) => q.eq(q.field("address.country"), filters.country))
	}

	// Price filters
	if (filters.minPrice || filters.maxPrice) {
		filteredQuery = filteredQuery.filter((q) => {
			let priceCondition = q.gt(q.field("monthlyRent.warm"), 0) // Base condition
			
			if (filters.minPrice) {
				const minCondition = q.or(
					q.gte(q.field("monthlyRent.warm"), filters.minPrice),
					q.and(
						q.not(q.field("monthlyRent.warm")),
						q.gte(q.field("monthlyRent.cold"), filters.minPrice)
					)
				)
				priceCondition = q.and(priceCondition, minCondition)
			}
			
			if (filters.maxPrice) {
				const maxCondition = q.or(
					q.lte(q.field("monthlyRent.warm"), filters.maxPrice),
					q.and(
						q.not(q.field("monthlyRent.warm")),
						q.lte(q.field("monthlyRent.cold"), filters.maxPrice)
					)
				)
				priceCondition = q.and(priceCondition, maxCondition)
			}
			
			return priceCondition
		})
	}

	// Bedroom filter
	if (filters.bedrooms !== undefined) {
		filteredQuery = filteredQuery.filter((q) => q.eq(q.field("rooms.bedrooms"), filters.bedrooms))
	}

	// Bathroom filter
	if (filters.bathrooms !== undefined) {
		filteredQuery = filteredQuery.filter((q) => q.gte(q.field("rooms.bathrooms"), filters.bathrooms!))
	}

	// Boolean filters
	if (filters.furnished === true) {
		filteredQuery = filteredQuery.filter((q) => q.eq(q.field("furnished"), true))
	}

	if (filters.petFriendly === true) {
		filteredQuery = filteredQuery.filter((q) => q.eq(q.field("petFriendly"), true))
	}

	// Amenities filter - simplified check for now
	// Note: Full amenity matching would require more complex logic
	if (filters.amenities && filters.amenities.length > 0) {
		filteredQuery = filteredQuery.filter((q) => q.field("amenities"))
	}

	return filteredQuery
}

/**
 * Sort properties by price
 */
export function sortByPrice(
	properties: Array<{ monthlyRent: { cold?: number; warm?: number } }>,
	direction: "asc" | "desc",
): void {
	properties.sort((a, b) => {
		const aPrice = a.monthlyRent.warm ?? a.monthlyRent.cold ?? 0
		const bPrice = b.monthlyRent.warm ?? b.monthlyRent.cold ?? 0
		const diff = aPrice - bPrice
		return direction === "asc" ? diff : -diff
	})
}

/**
 * Sort properties by creation time
 */
export function sortByCreationTime(
	properties: Array<{ _creationTime: number }>,
	direction: "asc" | "desc",
): void {
	properties.sort((a, b) => {
		const diff = a._creationTime - b._creationTime
		return direction === "asc" ? diff : -diff
	})
}

/**
 * Apply availability filter for properties available soon
 */
export function filterAvailableSoon(
	query: Query<DataModel["properties"]>,
	maxDaysFromNow = 30,
): Query<DataModel["properties"]> {
	const now = Date.now()
	const cutoffDate = now + maxDaysFromNow * 24 * 60 * 60 * 1000

	return query.filter((q) =>
		q.or(q.not(q.field("availableFrom")), q.lte(q.field("availableFrom"), cutoffDate)),
	)
}

/**
 * Common sorting logic for properties based on sort option
 */
export function applySorting(
	query: Query<DataModel["properties"]>,
	sortBy?: "price-low" | "price-high" | "newest" | "available",
): OrderedQuery<DataModel["properties"]> {
	switch (sortBy) {
		case "price-high":
		case "price-low":
		case "newest":
			// For these sorts, we order by creation time desc and sort client-side
			return query.order("desc")
		case "available": {
			// Filter for available properties and order ascending
			const filtered = filterAvailableSoon(query)
			return filtered.order("asc")
		}
		default:
			// Default to newest first
			return query.order("desc")
	}
}

/**
 * Apply client-side sorting to paginated results
 */
export function sortPaginatedResults<
	T extends { monthlyRent: { cold?: number; warm?: number }; _creationTime: number },
>(results: T[], sortBy?: "price-low" | "price-high" | "newest" | "date-saved" | "available"): void {
	switch (sortBy) {
		case "price-low":
			sortByPrice(results, "asc")
			break
		case "price-high":
			sortByPrice(results, "desc")
			break
		case "newest":
			sortByCreationTime(results, "desc")
			break
		// "date-saved" and "available" are handled by the query itself
	}
}
