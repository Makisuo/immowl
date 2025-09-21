import { useCallback, useMemo, useState } from "react"
import type { PropertyFilters, PropertyType, SortOption } from "~/types/property"
import { DEFAULT_PRICE_RANGE } from "~/types/property"

export interface UsePropertyFiltersOptions {
	initialFilters?: Partial<PropertyFilters>
	onFiltersChange?: (filters: PropertyFilters) => void
}

export function usePropertyFilters({ initialFilters = {}, onFiltersChange }: UsePropertyFiltersOptions = {}) {
	const [priceRange, setPriceRange] = useState<[number, number]>([
		initialFilters.minPrice ?? DEFAULT_PRICE_RANGE.min,
		initialFilters.maxPrice ?? DEFAULT_PRICE_RANGE.max,
	])

	const [city, setCity] = useState(initialFilters.city ?? "")
	const [propertyType, setPropertyType] = useState<PropertyType | undefined>(initialFilters.propertyType)
	const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy ?? "date-saved")

	const filters = useMemo<PropertyFilters>(
		() => ({
			propertyType,
			city: city || undefined,
			minPrice: priceRange[0] === DEFAULT_PRICE_RANGE.min ? undefined : priceRange[0],
			maxPrice: priceRange[1] === DEFAULT_PRICE_RANGE.max ? undefined : priceRange[1],
			sortBy,
		}),
		[propertyType, city, priceRange, sortBy],
	)

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (filters.minPrice !== undefined) count++
		if (filters.maxPrice !== undefined) count++
		if (filters.city) count++
		if (filters.propertyType) count++
		return count
	}, [filters])

	const updateFilters = useCallback(
		(updates: Partial<PropertyFilters>) => {
			if (updates.propertyType !== undefined) setPropertyType(updates.propertyType)
			if (updates.city !== undefined) setCity(updates.city)
			if (updates.minPrice !== undefined || updates.maxPrice !== undefined) {
				setPriceRange([updates.minPrice ?? priceRange[0], updates.maxPrice ?? priceRange[1]])
			}
			if (updates.sortBy !== undefined) setSortBy(updates.sortBy)

			const newFilters = {
				...filters,
				...updates,
			}
			onFiltersChange?.(newFilters)
		},
		[filters, onFiltersChange, priceRange],
	)

	const clearFilters = useCallback(() => {
		setPriceRange([DEFAULT_PRICE_RANGE.min, DEFAULT_PRICE_RANGE.max])
		setCity("")
		setPropertyType(undefined)
		setSortBy("date-saved")

		const clearedFilters: PropertyFilters = {
			sortBy: "date-saved",
		}
		onFiltersChange?.(clearedFilters)
	}, [onFiltersChange])

	const applyPriceRange = useCallback(() => {
		updateFilters({
			minPrice: priceRange[0],
			maxPrice: priceRange[1],
		})
	}, [priceRange, updateFilters])

	const applyCity = useCallback(() => {
		updateFilters({ city })
	}, [city, updateFilters])

	return {
		// State values
		priceRange,
		setPriceRange,
		city,
		setCity,
		propertyType,
		setPropertyType,
		sortBy,
		setSortBy,

		// Computed values
		filters,
		activeFiltersCount,

		// Actions
		updateFilters,
		clearFilters,
		applyPriceRange,
		applyCity,
	}
}
