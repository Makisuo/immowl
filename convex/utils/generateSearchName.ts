/**
 * Generate a human-readable name for a saved search based on its criteria
 */
export function generateSearchName(criteria: {
	city: string
	country: string
	propertyType?: "apartment" | "house" | "condo" | "townhouse" | "studio"
	bedrooms?: number
	minPrice?: number
	maxPrice?: number
}): string {
	const parts: string[] = []

	// Add bedrooms if specified
	if (criteria.bedrooms !== undefined && criteria.bedrooms > 0) {
		parts.push(`${criteria.bedrooms}BR`)
	}

	// Add property type if specified (capitalize first letter)
	if (criteria.propertyType) {
		const propertyTypeFormatted =
			criteria.propertyType.charAt(0).toUpperCase() + criteria.propertyType.slice(1)
		parts.push(propertyTypeFormatted)
	}

	// Add location (always present)
	parts.push(`in ${criteria.city}, ${criteria.country}`)

	// Add price range if specified
	if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
		if (criteria.minPrice && criteria.maxPrice) {
			parts.push(`(€${criteria.minPrice}-${criteria.maxPrice})`)
		} else if (criteria.minPrice) {
			parts.push(`(€${criteria.minPrice}+)`)
		} else if (criteria.maxPrice) {
			parts.push(`(up to €${criteria.maxPrice})`)
		}
	}

	return parts.join(" ")
}
