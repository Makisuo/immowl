import { useEffect } from "react"
import type { SearchFilters } from "./use-search-params"

const STORAGE_KEY = "immowl_last_search"

/**
 * Custom hook for managing saved search state in localStorage
 * Persists and retrieves the last used search filters
 */
export function useSavedSearch() {
	/**
	 * Save search parameters to localStorage
	 * @param searchParams - The search filters to save
	 */
	const saveSearchParams = (searchParams: SearchFilters) => {
		try {
			// Only save if we have valid params
			if (searchParams?.city) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams))
			}
		} catch (error) {
			// Silently fail if localStorage is not available or quota exceeded
			console.warn("Failed to save search params to localStorage:", error)
		}
	}

	/**
	 * Retrieve saved search parameters from localStorage
	 * @returns The saved search filters or null if none exist
	 */
	const getSavedSearchParams = (): SearchFilters | null => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (saved) {
				const parsed = JSON.parse(saved) as SearchFilters
				// Validate that the saved data has required fields
				if (parsed.city && parsed.country && parsed.sortBy) {
					return parsed
				}
			}
		} catch (error) {
			// If parsing fails or localStorage is not available, return null
			console.warn("Failed to retrieve saved search params:", error)
		}
		return null
	}

	/**
	 * Clear saved search parameters from localStorage
	 */
	const clearSavedSearchParams = () => {
		try {
			localStorage.removeItem(STORAGE_KEY)
		} catch (error) {
			console.warn("Failed to clear saved search params:", error)
		}
	}

	/**
	 * Get saved search parameters with fallback to defaults
	 * @param defaults - Default values to use if no saved params exist
	 * @returns The saved search filters or the provided defaults
	 */
	const getSavedSearchParamsWithDefaults = (defaults: SearchFilters): SearchFilters => {
		const saved = getSavedSearchParams()
		return saved || defaults
	}

	/**
	 * Hook to automatically save search params when they change
	 * @param searchParams - The current search parameters
	 */
	const useAutoSave = (searchParams: SearchFilters) => {
		useEffect(() => {
			saveSearchParams(searchParams)
		}, [searchParams])
	}

	return {
		saveSearchParams,
		getSavedSearchParams,
		clearSavedSearchParams,
		getSavedSearchParamsWithDefaults,
		useAutoSave,
	}
}
