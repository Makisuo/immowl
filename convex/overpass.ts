"use node"

import { v } from "convex/values"
import { internalAction } from "./_generated/server"

// OpenStreetMap Overpass API amenity types
// Documentation: https://wiki.openstreetmap.org/wiki/Key:amenity
const AMENITY_TYPES = {
	// Food & Dining
	restaurants: ["restaurant", "cafe", "fast_food", "bar", "pub", "food_court", "ice_cream", "biergarten"],

	// Public Transit
	publicTransit: ["bus_stop", "tram_stop", "subway_entrance", "ferry_terminal"],

	// Railway stations (uses railway=* tag, not amenity)
	railway: ["station", "halt", "tram_stop", "subway_entrance"],

	// Airports (uses aeroway=* tag)
	airports: ["aerodrome", "airport"],

	// Shopping
	shopping: ["supermarket", "convenience", "marketplace", "mall"],

	// Healthcare
	healthcare: ["pharmacy", "hospital", "doctors", "clinic", "dentist", "veterinary"],

	// Financial
	financial: ["bank", "atm"],

	// Education
	education: ["school", "university", "college", "kindergarten", "library"],

	// Recreation & Entertainment
	recreation: ["cinema", "theatre", "community_centre", "arts_centre", "nightclub", "casino"],

	// Sports & Fitness
	sports: ["sports_centre", "swimming_pool", "fitness_centre", "stadium"],

	// Parks (uses leisure=* tag)
	parks: ["park", "playground", "garden", "nature_reserve"],

	// Services
	services: ["post_office", "police", "fire_station", "townhall", "courthouse", "embassy"],

	// Worship
	worship: ["place_of_worship"],
}

// Validator for a single place/amenity result
const placeValidator = v.object({
	id: v.union(v.number(), v.string()),
	type: v.string(),
	name: v.optional(v.string()),
	amenityType: v.string(),
	category: v.string(),
	latitude: v.number(),
	longitude: v.number(),
	distance: v.number(),
	address: v.optional(v.string()),
	tags: v.optional(v.any()),
})

// Validator for category results
const categoryResultValidator = v.object({
	count: v.number(),
	closest: v.optional(placeValidator),
	all: v.array(placeValidator),
})

/**
 * Fetch nearby amenities using OpenStreetMap Overpass API
 * This action queries multiple amenity types and returns categorized results
 */
export const getNearbyAmenities = internalAction({
	args: {
		latitude: v.number(),
		longitude: v.number(),
		radius: v.optional(v.number()), // in meters, default 1000
		categories: v.optional(v.array(v.string())), // which categories to fetch, default: all
		limitPerCategory: v.optional(v.number()), // max items per category, default: 50
	},
	returns: v.object({
		summary: v.object({
			totalCount: v.number(),
			categoryCounts: v.record(v.string(), v.number()),
		}),
		restaurants: categoryResultValidator,
		publicTransit: categoryResultValidator,
		trainStations: categoryResultValidator,
		airports: categoryResultValidator,
		shopping: categoryResultValidator,
		healthcare: categoryResultValidator,
		financial: categoryResultValidator,
		education: categoryResultValidator,
		recreation: categoryResultValidator,
		sports: categoryResultValidator,
		parks: categoryResultValidator,
		services: categoryResultValidator,
		worship: categoryResultValidator,
	}),
	handler: async (_ctx, args) => {
		const { latitude, longitude, radius = 1000, categories, limitPerCategory = 50 } = args

		try {
			// Build Overpass QL query
			const query = buildOverpassQuery(latitude, longitude, radius, categories)

			console.log(`[Overpass] Querying amenities within ${radius}m of (${latitude}, ${longitude})`)

			// Make request to Overpass API
			const response = await fetch("https://overpass-api.de/api/interpreter", {
				method: "POST",
				body: query,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"User-Agent": "Immowl Property App (https://immowl.com)",
				},
			})

			if (!response.ok) {
				console.error(`[Overpass] HTTP error: ${response.status}`)
				return createEmptyResults()
			}

			const data = (await response.json()) as OverpassResponse

			// Process and categorize results
			const categorized = categorizeResults(data, latitude, longitude, limitPerCategory)

			console.log(`[Overpass] Found ${categorized.summary.totalCount} amenities across ${Object.keys(categorized.summary.categoryCounts).length} categories`)

			return categorized
		} catch (error) {
			console.error("[Overpass] Error:", error)
			return createEmptyResults()
		}
	},
})

/**
 * Get a quick count of specific amenity types near a location
 */
export const countNearbyAmenities = internalAction({
	args: {
		latitude: v.number(),
		longitude: v.number(),
		radius: v.optional(v.number()),
		amenityTypes: v.array(v.string()), // e.g., ["restaurant", "bus_stop"]
	},
	returns: v.object({
		total: v.number(),
		byType: v.record(v.string(), v.number()),
	}),
	handler: async (_ctx, args) => {
		const { latitude, longitude, radius = 1000, amenityTypes } = args

		try {
			// Build a simple count query
			const query = `[out:json][timeout:25];
(
  ${amenityTypes.map(type => `node["amenity"="${type}"](around:${radius},${latitude},${longitude});`).join("\n  ")}
);
out count;`

			const response = await fetch("https://overpass-api.de/api/interpreter", {
				method: "POST",
				body: query,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"User-Agent": "Immowl Property App (https://immowl.com)",
				},
			})

			if (!response.ok) {
				return { total: 0, byType: {} }
			}

			const data = (await response.json()) as OverpassResponse
			const total = data.elements?.length || 0

			// Count by type
			const byType: Record<string, number> = {}
			for (const element of data.elements || []) {
				const type = element.tags?.amenity
				if (type) {
					byType[type] = (byType[type] || 0) + 1
				}
			}

			return { total, byType }
		} catch (error) {
			console.error("[Overpass] Count error:", error)
			return { total: 0, byType: {} }
		}
	},
})

/**
 * Build Overpass QL query for multiple amenity types
 */
function buildOverpassQuery(
	lat: number,
	lon: number,
	radius: number,
	categories?: string[]
): string {
	const categoriesToQuery = categories && categories.length > 0
		? categories
		: Object.keys(AMENITY_TYPES)

	const queries: string[] = []

	for (const category of categoriesToQuery) {
		const types = AMENITY_TYPES[category as keyof typeof AMENITY_TYPES]
		if (!types) continue

		if (category === "railway") {
			// Railway stations use railway=* tag
			for (const type of types) {
				queries.push(`  node["railway"="${type}"](around:${radius},${lat},${lon});`)
				queries.push(`  way["railway"="${type}"](around:${radius},${lat},${lon});`)
			}
		} else if (category === "airports") {
			// Airports use aeroway=* tag
			for (const type of types) {
				queries.push(`  node["aeroway"="${type}"](around:${radius},${lat},${lon});`)
				queries.push(`  way["aeroway"="${type}"](around:${radius},${lat},${lon});`)
			}
		} else if (category === "parks") {
			// Parks use leisure=* tag
			for (const type of types) {
				queries.push(`  node["leisure"="${type}"](around:${radius},${lat},${lon});`)
				queries.push(`  way["leisure"="${type}"](around:${radius},${lat},${lon});`)
			}
		} else {
			// Regular amenity=* tags
			for (const type of types) {
				queries.push(`  node["amenity"="${type}"](around:${radius},${lat},${lon});`)
				queries.push(`  way["amenity"="${type}"](around:${radius},${lat},${lon});`)
			}
		}
	}

	return `[out:json][timeout:25];
(
${queries.join("\n")}
);
out body center;`
}

/**
 * Categorize Overpass API results into structured format
 */
function categorizeResults(
	data: OverpassResponse,
	originLat: number,
	originLon: number,
	limitPerCategory: number
): any {
	const results: Record<string, any[]> = {
		restaurants: [],
		publicTransit: [],
		trainStations: [],
		airports: [],
		shopping: [],
		healthcare: [],
		financial: [],
		education: [],
		recreation: [],
		sports: [],
		parks: [],
		services: [],
		worship: [],
	}

	// Process each element
	for (const element of data.elements || []) {
		const place = parseElement(element, originLat, originLon)
		if (!place) continue

		// Categorize based on amenity type
		const category = getCategoryForAmenity(place.amenityType, element.tags)
		if (category && results[category]) {
			results[category].push(place)
		}
	}

	// Sort by distance and limit
	for (const key of Object.keys(results)) {
		results[key].sort((a, b) => a.distance - b.distance)
		results[key] = results[key].slice(0, limitPerCategory)
	}

	// Build final response
	const categoryCounts: Record<string, number> = {}
	const response: any = {
		summary: {
			totalCount: 0,
			categoryCounts: {},
		},
	}

	for (const [category, items] of Object.entries(results)) {
		const count = items.length
		categoryCounts[category] = count
		response.summary.totalCount += count

		response[category] = {
			count,
			closest: items[0] || undefined,
			all: items,
		}
	}

	response.summary.categoryCounts = categoryCounts

	return response
}

/**
 * Parse an Overpass element into a standardized place object
 */
function parseElement(element: any, originLat: number, originLon: number): any | null {
	// Get coordinates (handle both nodes and ways with center)
	const lat = element.lat || element.center?.lat
	const lon = element.lon || element.center?.lon

	if (!lat || !lon) return null

	// Determine amenity type
	const amenityType = element.tags?.amenity || element.tags?.railway || element.tags?.aeroway || element.tags?.leisure
	if (!amenityType) return null

	// Calculate distance
	const distance = calculateDistance(originLat, originLon, lat, lon)

	return {
		id: element.id,
		type: element.type,
		name: element.tags?.name,
		amenityType,
		category: getCategoryForAmenity(amenityType, element.tags),
		latitude: lat,
		longitude: lon,
		distance,
		address: formatOSMAddress(element.tags),
		tags: element.tags,
	}
}

/**
 * Determine which category an amenity belongs to
 */
function getCategoryForAmenity(amenityType: string, tags?: any): string {
	// Check railway/train stations
	if (tags?.railway && ["station", "halt"].includes(tags.railway)) {
		return "trainStations"
	}

	// Check airports
	if (tags?.aeroway) {
		return "airports"
	}

	// Check parks
	if (tags?.leisure && ["park", "playground", "garden", "nature_reserve"].includes(tags.leisure)) {
		return "parks"
	}

	// Check regular amenities
	for (const [category, types] of Object.entries(AMENITY_TYPES)) {
		if (types.includes(amenityType)) {
			return category
		}
	}

	return "services" // default fallback
}

/**
 * Format OSM tags into a readable address
 */
function formatOSMAddress(tags?: any): string | undefined {
	if (!tags) return undefined

	const parts: string[] = []

	if (tags["addr:housenumber"] && tags["addr:street"]) {
		parts.push(`${tags["addr:housenumber"]} ${tags["addr:street"]}`)
	} else if (tags["addr:street"]) {
		parts.push(tags["addr:street"])
	}

	if (tags["addr:city"]) parts.push(tags["addr:city"])
	if (tags["addr:postcode"]) parts.push(tags["addr:postcode"])

	return parts.length > 0 ? parts.join(", ") : undefined
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371e3 // Earth's radius in meters
	const φ1 = (lat1 * Math.PI) / 180
	const φ2 = (lat2 * Math.PI) / 180
	const Δφ = ((lat2 - lat1) * Math.PI) / 180
	const Δλ = ((lon2 - lon1) * Math.PI) / 180

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	return Math.round(R * c) // Distance in meters
}

/**
 * Create empty results structure
 */
function createEmptyResults(): any {
	const emptyCategory = { count: 0, all: [] }

	return {
		summary: {
			totalCount: 0,
			categoryCounts: {},
		},
		restaurants: emptyCategory,
		publicTransit: emptyCategory,
		trainStations: emptyCategory,
		airports: emptyCategory,
		shopping: emptyCategory,
		healthcare: emptyCategory,
		financial: emptyCategory,
		education: emptyCategory,
		recreation: emptyCategory,
		sports: emptyCategory,
		parks: emptyCategory,
		services: emptyCategory,
		worship: emptyCategory,
	}
}

// Type definitions for Overpass API response
interface OverpassResponse {
	version: number
	generator: string
	elements: OverpassElement[]
}

interface OverpassElement {
	type: "node" | "way" | "relation"
	id: number
	lat?: number
	lon?: number
	center?: {
		lat: number
		lon: number
	}
	tags?: Record<string, string>
}