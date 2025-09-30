/**
 * Calculates the completion percentage of a search profile
 * @param profile - The saved search profile data
 * @returns Completion percentage (0-100)
 */
export function calculateProfileCompletion(profile: any): number {
	if (!profile) return 0

	let score = 0
	let maxScore = 0

	// Required fields (30% weight)
	const requiredFields = [
		profile.name,
		profile.criteria?.city || (profile as any).city,
		profile.criteria?.country || (profile as any).country,
	]
	maxScore += 30
	const filledRequired = requiredFields.filter(Boolean).length
	score += (filledRequired / requiredFields.length) * 30

	// Optional criteria fields (50% weight)
	const criteria = profile.criteria || profile
	const optionalFields = [
		criteria.minPrice,
		criteria.maxPrice,
		criteria.bedrooms,
		criteria.bathrooms,
		criteria.propertyType,
		criteria.petFriendly !== undefined,
		criteria.furnished !== undefined,
	]
	maxScore += 50
	const filledOptional = optionalFields.filter(Boolean).length
	score += (filledOptional / optionalFields.length) * 50

	// Advanced fields (20% weight)
	const advancedFields = [
		criteria.amenities && criteria.amenities.length > 0,
		criteria.minSquareMeters,
		criteria.maxSquareMeters,
		profile.description,
	]
	maxScore += 20
	const filledAdvanced = advancedFields.filter(Boolean).length
	score += (filledAdvanced / advancedFields.length) * 20

	return Math.round(score)
}

/**
 * Gets a human-readable completion status message
 */
export function getCompletionStatus(percentage: number): {
	message: string
	color: string
} {
	if (percentage === 100) {
		return { message: "Complete", color: "text-green-600" }
	}
	if (percentage >= 70) {
		return { message: "Almost there", color: "text-blue-600" }
	}
	if (percentage >= 40) {
		return { message: "In progress", color: "text-yellow-600" }
	}
	return { message: "Just started", color: "text-gray-600" }
}