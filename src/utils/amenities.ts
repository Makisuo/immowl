import {
	Activity,
	BookOpen,
	Building,
	Bus,
	DollarSign,
	Dumbbell,
	Film,
	type LucideIcon,
	Plane,
	ShoppingBag,
	Train,
	Trees,
	Utensils,
} from "lucide-react"

/**
 * Convert meters to walking minutes
 * Average walking speed: ~80 meters per minute
 */
export function metersToWalkingMinutes(meters: number): number {
	return Math.round(meters / 80)
}

/**
 * Format distance for display
 * - Short distances (< 1600m / 20 min): show as "X min walk"
 * - Long distances (>= 1600m): show as "~X.Xkm away"
 */
export function formatAmenityDistance(meters: number): string {
	const minutes = metersToWalkingMinutes(meters)

	if (minutes <= 1) {
		return "< 1 min walk"
	}

	if (minutes < 20) {
		return `${minutes} min walk`
	}

	const km = (meters / 1000).toFixed(1)
	return `~${km}km away`
}

/**
 * Get display name for amenity category
 */
export function getAmenityDisplayName(category: string): string {
	const names: Record<string, string> = {
		restaurants: "Restaurants",
		publicTransit: "Bus/Tram",
		trainStations: "Train Station",
		airports: "Airport",
		shopping: "Shopping",
		healthcare: "Healthcare",
		financial: "Bank/ATM",
		education: "Schools",
		recreation: "Entertainment",
		sports: "Fitness",
		parks: "Parks",
		services: "Services",
		worship: "Places of Worship",
	}
	return names[category] || category
}

/**
 * Get icon component for amenity category
 */
export function getAmenityIcon(category: string): LucideIcon {
	const icons: Record<string, LucideIcon> = {
		restaurants: Utensils,
		publicTransit: Bus,
		trainStations: Train,
		airports: Plane,
		shopping: ShoppingBag,
		healthcare: Activity,
		financial: DollarSign,
		education: BookOpen,
		recreation: Film,
		sports: Dumbbell,
		parks: Trees,
		services: Building,
		worship: Building,
	}
	return icons[category] || Building
}

/**
 * Get the most important amenity categories to display
 * Returns category keys in priority order
 */
export function getPriorityAmenityCategories(): string[] {
	return [
		"publicTransit",
		"trainStations",
		"restaurants",
		"shopping",
		"healthcare",
		"parks",
		"financial",
		"education",
	]
}

/**
 * Format last updated timestamp to relative time
 */
export function formatLastUpdated(timestamp: number): string {
	const now = Date.now()
	const diffMs = now - timestamp
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) {
		return "Today"
	}
	if (diffDays === 1) {
		return "Yesterday"
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`
	}
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return `${weeks} week${weeks > 1 ? "s" : ""} ago`
	}
	const months = Math.floor(diffDays / 30)
	return `${months} month${months > 1 ? "s" : ""} ago`
}
