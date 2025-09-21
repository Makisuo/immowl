import type { Doc, Id } from "convex/_generated/dataModel"

// Derive types directly from the Convex schema
export type Property = Doc<"properties">
export type PropertyType = Property["propertyType"]
export type SortOption = "date-saved" | "price-low" | "price-high" | "newest"

export interface SavedPropertyWithDate {
	property: Property
	savedDate: number
}

export interface PropertyFilters {
	propertyType?: PropertyType
	city?: string
	minPrice?: number
	maxPrice?: number
	sortBy?: SortOption
}

export interface PropertyCardProps {
	property: Property
	savedDate?: number
	isSaved?: boolean
	onToggleSave?: (propertyId: Id<"properties">) => Promise<void>
	onImageClick?: (index: number) => void
}

// Constants for UI display
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
	apartment: "Apartment",
	house: "House",
	condo: "Condo",
	townhouse: "Townhouse",
	studio: "Studio",
}

export const SORT_OPTIONS = {
	"date-saved": "Date Saved",
	"price-low": "Price: Low to High",
	"price-high": "Price: High to Low",
	newest: "Newest First",
} as const

export const DEFAULT_PRICE_RANGE = {
	min: 0,
	max: 5000,
} as const

export const DEFAULT_FILTERS: PropertyFilters = {
	sortBy: "date-saved",
	minPrice: DEFAULT_PRICE_RANGE.min,
	maxPrice: DEFAULT_PRICE_RANGE.max,
}
