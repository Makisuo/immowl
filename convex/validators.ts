import { v } from "convex/values"

// Define property type validator once
export const propertyTypeValidator = v.union(
	v.literal("apartment"),
	v.literal("house"),
	v.literal("condo"),
	v.literal("townhouse"),
	v.literal("studio"),
)

// Define sort option validator
export const sortByValidator = v.union(
	v.literal("date-saved"),
	v.literal("price-low"),
	v.literal("price-high"),
	v.literal("newest"),
)

// Common property filters validator
export const propertyFiltersValidator = {
	propertyType: v.optional(propertyTypeValidator),
	city: v.optional(v.string()),
	minPrice: v.optional(v.number()),
	maxPrice: v.optional(v.number()),
	sortBy: v.optional(sortByValidator),
}