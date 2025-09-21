import { useNavigate } from "@tanstack/react-router"
import { Route } from "~/routes/_app/search"

// API-compatible types for the backend
export interface SearchFilters {
	city: string
	country: string
	propertyType?: "apartment" | "house" | "condo" | "townhouse" | "studio"
	sortBy: "price-low" | "price-high" | "newest" | "available"
	minPrice?: number
	maxPrice?: number
	bedrooms?: number
	bathrooms?: number
	amenities?: string[]
	petFriendly?: boolean
	furnished?: boolean
}

// UI-friendly types for the frontend
export interface UISearchFilters {
	city: string
	country: string
	propertyType: "Apartment" | "House" | "Condo" | "Townhouse" | "Studio" | "Any"
	sortBy: "price-low" | "price-high" | "newest" | "available"
	priceRange: [number, number]
	bedrooms: "Any" | "Studio" | "1" | "2" | "3+"
	bathrooms: "Any" | "1" | "2" | "3+"
	amenities: string[]
	petFriendly: "Any" | "Yes" | "No"
	furnished: "Any" | "Yes" | "No"
}

// Default values
const DEFAULT_FILTERS: UISearchFilters = {
	city: "Berlin",
	country: "DE",
	propertyType: "Any",
	sortBy: "newest",
	priceRange: [0, 5000],
	bedrooms: "Any",
	bathrooms: "Any",
	amenities: [],
	petFriendly: "Any",
	furnished: "Any",
}

// Convert from URL search params to UI filters
export function searchParamsToUIFilters(searchParams: SearchFilters): UISearchFilters {
	// Explicitly handle undefined propertyType
	const propertyType =
		searchParams.propertyType === undefined ? "Any" : propertyTypeToUI(searchParams.propertyType)

	return {
		city: searchParams.city,
		country: searchParams.country,
		propertyType,
		sortBy: searchParams.sortBy,
		priceRange: [searchParams.minPrice || 0, searchParams.maxPrice || 5000],
		bedrooms: bedroomsToUI(searchParams.bedrooms),
		bathrooms: bathroomsToUI(searchParams.bathrooms),
		amenities: searchParams.amenities || [],
		petFriendly: booleanToUI(searchParams.petFriendly),
		furnished: booleanToUI(searchParams.furnished),
	}
}

// Convert from UI filters to search params
export function uiFiltersToSearchParams(filters: Partial<UISearchFilters>): Partial<SearchFilters> {
	const result: Partial<SearchFilters> = {}

	if (filters.city !== undefined) result.city = filters.city
	if (filters.country !== undefined) result.country = filters.country
	// Only add propertyType if it's not "Any"
	if (filters.propertyType !== undefined) {
		const propertyType = propertyTypeFromUI(filters.propertyType)
		if (propertyType !== undefined) {
			result.propertyType = propertyType
		}
	}
	if (filters.sortBy !== undefined) result.sortBy = filters.sortBy
	if (filters.priceRange !== undefined) {
		const [min, max] = filters.priceRange
		result.minPrice = min > 0 ? min : undefined
		result.maxPrice = max < 5000 ? max : undefined
	}
	// Only add filter if it's not "Any"
	if (filters.bedrooms !== undefined && filters.bedrooms !== "Any") {
		result.bedrooms = bedroomsFromUI(filters.bedrooms)
	}
	if (filters.bathrooms !== undefined && filters.bathrooms !== "Any") {
		result.bathrooms = bathroomsFromUI(filters.bathrooms)
	}
	if (filters.amenities !== undefined) {
		result.amenities = filters.amenities.length > 0 ? filters.amenities : undefined
	}
	if (filters.petFriendly !== undefined && filters.petFriendly !== "Any") {
		result.petFriendly = booleanFromUI(filters.petFriendly)
	}
	if (filters.furnished !== undefined && filters.furnished !== "Any") {
		result.furnished = booleanFromUI(filters.furnished)
	}

	return result
}

// Helper converters
function propertyTypeToUI(type?: string): UISearchFilters["propertyType"] {
	// If no type specified or undefined, show "Any" in the UI
	if (type === undefined || type === null || type === "") {
		return "Any"
	}
	switch (type) {
		case "apartment":
			return "Apartment"
		case "house":
			return "House"
		case "condo":
			return "Condo"
		case "townhouse":
			return "Townhouse"
		case "studio":
			return "Studio"
		default:
			return "Any"
	}
}

function propertyTypeFromUI(
	type: UISearchFilters["propertyType"],
): SearchFilters["propertyType"] | undefined {
	switch (type) {
		case "Apartment":
			return "apartment"
		case "House":
			return "house"
		case "Condo":
			return "condo"
		case "Townhouse":
			return "townhouse"
		case "Studio":
			return "studio"
		default:
			return undefined // Don't send propertyType when "Any" is selected
	}
}

function bedroomsToUI(bedrooms?: number): UISearchFilters["bedrooms"] {
	if (bedrooms === undefined) return "Any"
	if (bedrooms === 0) return "Studio"
	if (bedrooms === 1) return "1"
	if (bedrooms === 2) return "2"
	return "3+"
}

function bedroomsFromUI(bedrooms: UISearchFilters["bedrooms"]): number | undefined {
	switch (bedrooms) {
		case "Studio":
			return 0
		case "1":
			return 1
		case "2":
			return 2
		case "3+":
			return 3
		default:
			return undefined
	}
}

function bathroomsToUI(bathrooms?: number): UISearchFilters["bathrooms"] {
	if (bathrooms === undefined) return "Any"
	if (bathrooms === 1) return "1"
	if (bathrooms === 2) return "2"
	return "3+"
}

function bathroomsFromUI(bathrooms: UISearchFilters["bathrooms"]): number | undefined {
	switch (bathrooms) {
		case "1":
			return 1
		case "2":
			return 2
		case "3+":
			return 3
		default:
			return undefined
	}
}

function booleanToUI(value?: boolean): "Any" | "Yes" | "No" {
	if (value === undefined) return "Any"
	return value ? "Yes" : "No"
}

function booleanFromUI(value: "Any" | "Yes" | "No"): boolean | undefined {
	switch (value) {
		case "Yes":
			return true
		case "No":
			return false
		default:
			return undefined
	}
}

// Custom hook for managing search params
export function useSearchFilters() {
	const navigate = useNavigate({ from: "/search" })
	const rawSearchParams = Route.useSearch()

	// Ensure propertyType is properly undefined when not in URL
	const searchParams: SearchFilters = {
		city: rawSearchParams.city || "Berlin",
		country: rawSearchParams.country || "DE",
		propertyType: rawSearchParams.propertyType, // Keep undefined if not present
		sortBy: rawSearchParams.sortBy || "newest",
		minPrice: rawSearchParams.minPrice,
		maxPrice: rawSearchParams.maxPrice,
		bedrooms: rawSearchParams.bedrooms,
		bathrooms: rawSearchParams.bathrooms,
		amenities: rawSearchParams.amenities,
		petFriendly: rawSearchParams.petFriendly,
		furnished: rawSearchParams.furnished,
	}

	// Convert search params to UI-friendly format
	const uiFilters = searchParamsToUIFilters(searchParams)

	// Update function that merges changes
	const updateFilters = (updates: Partial<UISearchFilters>) => {
		// Merge UI updates with current UI filters
		const updatedUIFilters = { ...uiFilters, ...updates }
		// Convert the full UI state to search params
		const newSearchParams = uiFiltersToSearchParams(updatedUIFilters)

		navigate({
			search: newSearchParams as SearchFilters,
		})
	}

	// Helper to reset filters
	const resetFilters = () => {
		navigate({
			search: {
				city: DEFAULT_FILTERS.city,
				country: DEFAULT_FILTERS.country,
				sortBy: DEFAULT_FILTERS.sortBy,
				// propertyType is omitted to show all types
			},
		})
	}

	// Check if any filters are active
	const hasActiveFilters = () => {
		return (
			searchParams.minPrice !== undefined ||
			searchParams.maxPrice !== undefined ||
			searchParams.bedrooms !== undefined ||
			searchParams.bathrooms !== undefined ||
			(searchParams.amenities && searchParams.amenities.length > 0) ||
			searchParams.petFriendly !== undefined ||
			searchParams.furnished !== undefined ||
			searchParams.propertyType !== undefined // Any specified property type is a filter
		)
	}

	const activeFiltersCount = () => {
		let count = 0
		if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) count++
		if (searchParams.bedrooms !== undefined) count++
		if (searchParams.bathrooms !== undefined) count++
		if (searchParams.amenities && searchParams.amenities.length > 0) count++
		if (searchParams.petFriendly !== undefined) count++
		if (searchParams.furnished !== undefined) count++
		if (searchParams.propertyType !== undefined) count++ // Count any specified property type
		return count
	}

	return {
		searchParams,
		uiFilters,
		updateFilters,
		resetFilters,
		hasActiveFilters,
		activeFiltersCount,
	}
}
