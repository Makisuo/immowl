import type { Property } from "~/types/property"

/**
 * Convert square meters to square feet
 */
export const toSqft = (squareMeters: number): number => {
	return Math.round(squareMeters * 10.764)
}

/**
 * Format availability status for display
 */
export const formatAvailability = (availableFrom?: number): string => {
	if (!availableFrom || availableFrom <= Date.now()) {
		return "Available Now"
	}
	return new Date(availableFrom).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})
}

/**
 * Format lease terms for display
 */
export const formatLeaseTerms = (minimumLease?: number): string => {
	if (!minimumLease) {
		return "Flexible"
	}
	return `${minimumLease}+ months`
}

/**
 * Get monthly rent amount (prefers warm rent over cold rent)
 */
export const getRent = (property: Property): number => {
	return property.monthlyRent.warm || property.monthlyRent.cold || 0
}

/**
 * Get rent type label (warm or cold)
 */
export const getRentType = (property: Property): "warm" | "cold" | null => {
	if (property.monthlyRent.warm) return "warm"
	if (property.monthlyRent.cold) return "cold"
	return null
}

/**
 * Get deposit amount (defaults to monthly rent if not specified)
 */
export const getDepositAmount = (property: Property): number => {
	return property.deposit || getRent(property)
}

/**
 * Format room count for display
 */
export const formatRoomCount = (bedrooms: number): string => {
	if (bedrooms === 0) return "Studio"
	return `${bedrooms} bed${bedrooms === 1 ? "" : "s"}`
}

/**
 * Format bathroom count for display
 */
export const formatBathCount = (bathrooms: number): string => {
	return `${bathrooms} bath${bathrooms === 1 ? "" : "s"}`
}

/**
 * Get property type label
 */
export const getPropertyTypeLabel = (propertyType: Property["propertyType"]): string => {
	return propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
}
