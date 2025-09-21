import { v } from "convex/values"

// Define property type validator once
export const propertyTypeValidator = v.union(
	v.literal("apartment"),
	v.literal("house"),
	v.literal("condo"),
	v.literal("townhouse"),
	v.literal("studio"),
)

// Define sort option validators for different contexts
export const propertySortByValidator = v.union(
	v.literal("price-low"),
	v.literal("price-high"),
	v.literal("newest"),
	v.literal("available"),
)

export const savedPropertiesSortByValidator = v.union(
	v.literal("date-saved"),
	v.literal("price-low"),
	v.literal("price-high"),
	v.literal("newest"),
)

// Common property filters validator for saved properties
export const propertyFiltersValidator = {
	propertyType: v.optional(propertyTypeValidator),
	city: v.optional(v.string()),
	minPrice: v.optional(v.number()),
	maxPrice: v.optional(v.number()),
	sortBy: v.optional(savedPropertiesSortByValidator),
}

// External source validator
export const externalSourceValidator = v.literal("immowelt")
