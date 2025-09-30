import type { Doc } from "convex/_generated/dataModel"

// Type definitions
export interface UserPreferences {
	maxBudget: number | null
	minBudget: number | null
	desiredBedrooms: number | null
	desiredBathrooms: number | null
	preferredCity: string | null
	preferredLatitude: number | null
	preferredLongitude: number | null
	maxDistanceKm: number | null // Maximum acceptable distance in km
	preferredPropertyType: string | null
	requiresPetFriendly: boolean
	prefersFurnished: boolean
	desiredAmenities: string[]
	minSquareMeters: number | null
	maxSquareMeters: number | null
}

export interface CriteriaWeights {
	price: number
	location: number
	bedrooms: number
	bathrooms: number
	propertyType: number
	petFriendly: number
	furnished: number
	amenities: number
	size: number
}

export interface ScoreBreakdown {
	price: number | null
	location: number | null
	bedrooms: number | null
	bathrooms: number | null
	propertyType: number | null
	petFriendly: number | null
	furnished: number | null
	amenities: number | null
	size: number | null
}

export interface MatchScore {
	overall: number
	breakdown: ScoreBreakdown
	weights: CriteriaWeights
}

// Property type similarity matrix
const PROPERTY_TYPE_SIMILARITY: Record<string, Record<string, number>> = {
	apartment: { apartment: 1.0, flat: 0.95, studio: 0.85, loft: 0.75 },
	flat: { flat: 1.0, apartment: 0.95, studio: 0.85, loft: 0.75 },
	house: { house: 1.0, villa: 0.9, townhouse: 0.85, duplex: 0.8 },
	villa: { villa: 1.0, house: 0.9, townhouse: 0.75, duplex: 0.7 },
	studio: { studio: 1.0, apartment: 0.85, flat: 0.85, loft: 0.8 },
	loft: { loft: 1.0, studio: 0.8, apartment: 0.75, flat: 0.75 },
	townhouse: { townhouse: 1.0, house: 0.85, duplex: 0.85, villa: 0.75 },
	duplex: { duplex: 1.0, townhouse: 0.85, house: 0.8, villa: 0.7 },
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371 // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1)
	const dLon = toRadians(lon2 - lon1)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180)
}

/**
 * Improved price scoring algorithm
 * - Optimal score at 70-85% of max budget
 * - Perfect score up to max budget
 * - Gradual penalty for over-budget
 * - Penalty for suspiciously cheap properties (below min budget)
 */
export function calculatePriceScore(
	rent: number,
	minBudget: number | null,
	maxBudget: number | null,
): number | null {
	// If no budget preferences, don't score
	if (maxBudget === null) return null

	if (rent === 0) return 0

	// Check if below minimum budget (potential quality issue)
	if (minBudget !== null && rent < minBudget) {
		const deficit = (minBudget - rent) / minBudget
		return Math.max(50, 100 - deficit * 100)
	}

	// Within budget - optimal at 70-85% of max
	if (rent <= maxBudget) {
		const ratio = rent / maxBudget
		if (ratio >= 0.7 && ratio <= 0.85) {
			return 100 // Sweet spot
		}
		if (ratio < 0.7) {
			// Too cheap relative to budget might indicate quality issues
			const distance = 0.7 - ratio
			return Math.max(85, 100 - distance * 50)
		}
		// Between 85% and 100% - still great
		return Math.max(90, 100 - (ratio - 0.85) * 30)
	}

	// Over budget - gradual penalty
	const overBudgetRatio = (rent - maxBudget) / maxBudget
	if (overBudgetRatio <= 0.1) {
		// Within 10% over budget - minor penalty
		return Math.max(75, 90 - overBudgetRatio * 150)
	}
	if (overBudgetRatio <= 0.25) {
		// 10-25% over budget - moderate penalty
		return Math.max(50, 75 - (overBudgetRatio - 0.1) * 150)
	}
	// More than 25% over budget - severe penalty
	return Math.max(0, 50 - (overBudgetRatio - 0.25) * 100)
}

/**
 * Proportional bedroom scoring with diminishing returns
 * - Exact match: 100
 * - More bedrooms: diminishing bonus (capped at 90)
 * - Fewer bedrooms: proportional penalty
 */
export function calculateBedroomScore(
	actualBedrooms: number,
	desiredBedrooms: number | null,
): number | null {
	if (desiredBedrooms === null) return null

	if (actualBedrooms === desiredBedrooms) return 100

	if (actualBedrooms > desiredBedrooms) {
		// More rooms - slight bonus with diminishing returns
		const extra = actualBedrooms - desiredBedrooms
		return Math.min(90, 85 + extra * 5)
	}

	// Fewer rooms - proportional penalty
	const deficit = desiredBedrooms - actualBedrooms
	const penaltyPerRoom = 25
	return Math.max(30, 100 - deficit * penaltyPerRoom)
}

/**
 * Proportional bathroom scoring
 * - More bathrooms than desired: perfect score
 * - Exact match: perfect score
 * - Fewer bathrooms: proportional penalty
 */
export function calculateBathroomScore(
	actualBathrooms: number,
	desiredBathrooms: number | null,
): number | null {
	if (desiredBathrooms === null) return null

	// More or equal is always good
	if (actualBathrooms >= desiredBathrooms) return 100

	// Fewer than desired - proportional penalty
	const deficit = desiredBathrooms - actualBathrooms
	const penaltyPerBathroom = 30
	return Math.max(40, 100 - deficit * penaltyPerBathroom)
}

/**
 * Distance-based location scoring using coordinates
 * Falls back to city name match if coordinates unavailable
 */
export function calculateLocationScore(
	propertyCity: string,
	propertyLat: number | undefined,
	propertyLon: number | undefined,
	preferredCity: string | null,
	preferredLat: number | null,
	preferredLon: number | null,
	maxDistanceKm: number | null,
): number | null {
	// If no location preference, don't score
	if (preferredCity === null) return null

	// Try coordinate-based scoring first
	if (
		propertyLat !== undefined &&
		propertyLon !== undefined &&
		preferredLat !== null &&
		preferredLon !== null
	) {
		const distance = calculateDistance(propertyLat, propertyLon, preferredLat, preferredLon)

		// Use maxDistanceKm or default to 50km
		const maxDistance = maxDistanceKm || 50
		const idealDistance = maxDistance * 0.1 // Within 10% is ideal

		if (distance <= idealDistance) return 100
		if (distance <= maxDistance) {
			// Linear scale from 100 to 60 within acceptable range
			const ratio = (distance - idealDistance) / (maxDistance - idealDistance)
			return Math.max(60, 100 - ratio * 40)
		}
		// Beyond max distance - declining score
		const excessRatio = (distance - maxDistance) / maxDistance
		return Math.max(0, 60 - excessRatio * 60)
	}

	// Fallback to city name match
	if (propertyCity.toLowerCase() === preferredCity.toLowerCase()) {
		return 100
	}

	return 60 // Different city, no coordinate data
}

/**
 * Property type scoring with similarity matrix
 */
export function calculatePropertyTypeScore(
	actualType: string,
	preferredType: string | null,
): number | null {
	if (preferredType === null) return null

	const actualTypeLower = actualType.toLowerCase()
	const preferredTypeLower = preferredType.toLowerCase()

	if (actualTypeLower === preferredTypeLower) return 100

	// Check similarity matrix
	const similarity =
		PROPERTY_TYPE_SIMILARITY[preferredTypeLower]?.[actualTypeLower] ||
		PROPERTY_TYPE_SIMILARITY[actualTypeLower]?.[preferredTypeLower]

	if (similarity) {
		return Math.round(similarity * 100)
	}

	return 50 // No similarity found
}

/**
 * Size scoring with min/max bounds
 */
export function calculateSizeScore(
	actualSize: number,
	minSquareMeters: number | null,
	maxSquareMeters: number | null,
): number | null {
	// If no size preferences, don't score
	if (minSquareMeters === null && maxSquareMeters === null) return null

	// Only min specified
	if (minSquareMeters !== null && maxSquareMeters === null) {
		if (actualSize >= minSquareMeters) return 100
		const deficit = minSquareMeters - actualSize
		return Math.max(0, 100 - (deficit / minSquareMeters) * 100)
	}

	// Only max specified
	if (minSquareMeters === null && maxSquareMeters !== null) {
		if (actualSize <= maxSquareMeters) return 100
		const excess = actualSize - maxSquareMeters
		return Math.max(50, 100 - (excess / maxSquareMeters) * 50)
	}

	// Both specified
	if (minSquareMeters !== null && maxSquareMeters !== null) {
		if (actualSize >= minSquareMeters && actualSize <= maxSquareMeters) return 100
		if (actualSize < minSquareMeters) {
			const deficit = minSquareMeters - actualSize
			return Math.max(0, 100 - (deficit / minSquareMeters) * 100)
		}
		if (actualSize > maxSquareMeters) {
			const excess = actualSize - maxSquareMeters
			return Math.max(50, 100 - (excess / maxSquareMeters) * 50)
		}
	}

	return null
}

/**
 * Pet friendly scoring
 */
export function calculatePetFriendlyScore(
	isPetFriendly: boolean,
	requiresPetFriendly: boolean,
): number | null {
	if (!requiresPetFriendly) return null // Don't score if not required
	return isPetFriendly ? 100 : 0 // Binary: must have or deal-breaker
}

/**
 * Furnished scoring
 */
export function calculateFurnishedScore(
	isFurnished: boolean,
	prefersFurnished: boolean,
): number | null {
	if (!prefersFurnished) return null // Don't score if not preferred
	return isFurnished ? 100 : 50 // Preferred but not required
}

/**
 * Amenities scoring
 */
export function calculateAmenitiesScore(
	propertyAmenities: string[] | undefined,
	desiredAmenities: string[],
): number | null {
	if (desiredAmenities.length === 0) return null // Don't score if no preferences

	if (!propertyAmenities || propertyAmenities.length === 0) return 60 // Base score

	const matches = propertyAmenities.filter((a) => desiredAmenities.includes(a)).length
	const matchRate = matches / desiredAmenities.length

	// Scale from 60 to 100 based on match rate
	return Math.min(100, Math.round(60 + matchRate * 40))
}

/**
 * Calculate overall match score with proper weight handling
 * Only includes criteria that are actually configured
 */
export function calculateMatchScore(
	property: Doc<"properties">,
	preferences: UserPreferences,
	userWeights?: Partial<CriteriaWeights>,
): MatchScore {
	// Calculate individual scores (null if not configured)
	const breakdown: ScoreBreakdown = {
		price: calculatePriceScore(
			property.monthlyRent.warm || property.monthlyRent.cold || 0,
			preferences.minBudget,
			preferences.maxBudget,
		),
		location: calculateLocationScore(
			property.address.city,
			property.address.latitude,
			property.address.longitude,
			preferences.preferredCity,
			preferences.preferredLatitude,
			preferences.preferredLongitude,
			preferences.maxDistanceKm,
		),
		bedrooms: calculateBedroomScore(property.rooms.bedrooms, preferences.desiredBedrooms),
		bathrooms: calculateBathroomScore(property.rooms.bathrooms, preferences.desiredBathrooms),
		propertyType: calculatePropertyTypeScore(property.propertyType, preferences.preferredPropertyType),
		petFriendly: calculatePetFriendlyScore(
			property.petFriendly ?? false,
			preferences.requiresPetFriendly,
		),
		furnished: calculateFurnishedScore(property.furnished ?? false, preferences.prefersFurnished),
		amenities: calculateAmenitiesScore(property.amenities, preferences.desiredAmenities),
		size: calculateSizeScore(
			property.squareMeters,
			preferences.minSquareMeters,
			preferences.maxSquareMeters,
		),
	}

	// Default weights
	const defaultWeights: CriteriaWeights = {
		price: 35,
		location: 15,
		bedrooms: 20,
		bathrooms: 10,
		propertyType: 5,
		petFriendly: 5,
		furnished: 5,
		amenities: 5,
		size: 5,
	}

	// Merge with user weights
	const baseWeights = { ...defaultWeights, ...userWeights }

	// Only include weights for configured criteria (non-null scores)
	const activeWeights: Partial<CriteriaWeights> = {}
	for (const [key, score] of Object.entries(breakdown)) {
		if (score !== null) {
			activeWeights[key as keyof CriteriaWeights] = baseWeights[key as keyof CriteriaWeights]
		}
	}

	// Normalize weights to sum to 1
	const totalWeight = Object.values(activeWeights).reduce((sum, w) => sum + w, 0)
	const normalizedWeights: Partial<CriteriaWeights> = {}
	for (const [key, weight] of Object.entries(activeWeights)) {
		normalizedWeights[key as keyof CriteriaWeights] =
			totalWeight > 0 ? weight / totalWeight : 0
	}

	// Calculate weighted overall score
	let overallScore = 0
	for (const [key, score] of Object.entries(breakdown)) {
		if (score !== null) {
			overallScore += score * (normalizedWeights[key as keyof CriteriaWeights] ?? 0)
		}
	}

	return {
		overall: Math.round(overallScore),
		breakdown,
		weights: baseWeights,
	}
}

/**
 * Get match quality label and styling
 */
export function getMatchQuality(score: number) {
	if (score >= 85) return { label: "Excellent Match", color: "bg-green-500" }
	if (score >= 70) return { label: "Good Match", color: "bg-blue-500" }
	if (score >= 50) return { label: "Fair Match", color: "bg-yellow-500" }
	return { label: "Poor Match", color: "bg-red-500" }
}
