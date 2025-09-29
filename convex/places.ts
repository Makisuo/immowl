"use node"

import { v } from "convex/values"
import jwt from "jsonwebtoken"
import { action } from "./_generated/server"

// Apple Maps Server API Point of Interest categories
// Full list: https://developer.apple.com/documentation/applemapsserverapi/poicategory
const POI_CATEGORIES = {
	// Transit
	transit: ["Airport", "PublicTransport"],
	subway: ["PublicTransport"],

	// Food & Drink
	food: ["Restaurant", "Cafe", "Bakery", "Brewery", "Distillery", "Winery"],
	restaurant: ["Restaurant"],
	cafe: ["Cafe", "Bakery"],
	supermarket: ["FoodMarket"],
	grocery: ["FoodMarket"],

	// Shopping
	shopping: ["Store", "Mall", "FoodMarket"],
	store: ["Store"],
	mall: ["Mall"],

	// Services
	bank: ["Bank"],
	atm: ["ATM"],
	hospital: ["Hospital"],
	pharmacy: ["Pharmacy"],
	gas: ["GasStation"],
	parking: ["Parking"],
	evCharger: ["EVCharger"],

	// Entertainment & Leisure
	entertainment: ["MovieTheater", "Museum", "Nightlife", "Theater"],
	park: ["Park", "NationalPark"],
	museum: ["Museum"],
	theater: ["Theater", "MovieTheater"],
	nightlife: ["Nightlife"],

	// Accommodation
	hotel: ["Hotel"],

	// Education
	school: ["School", "University"],
	library: ["Library"],

	// Fitness & Wellness
	fitness: ["Fitness"],
	spa: ["Spa"],

	// All categories
	all: [],
}

export const searchNearbyPlaces = action({
	args: {
		latitude: v.number(),
		longitude: v.number(),
		categories: v.optional(v.array(v.string())),
		radius: v.optional(v.number()), // in meters, default 1000
		limit: v.optional(v.number()), // max results, default 20
		query: v.optional(v.string()), // optional search query
	},

	handler: async (_ctx, args) => {
		const { latitude, longitude, categories = ["all"], limit = 20, query } = args
		// radius parameter reserved for future use when Apple Maps API supports it
		const _radius = args.radius || 1000

		try {
			// Generate JWT token for MapKit
			const token = await generateMapKitToken()
			if (!token) {
				return {
					places: [],
					error: "Failed to generate MapKit token",
				}
			}

			// Exchange the auth token for an access token
			const tokenResponse = await fetch("https://maps-api.apple.com/v1/token", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!tokenResponse.ok) {
				console.error("Failed to get access token:", tokenResponse.status)
				return {
					places: [],
					error: "Failed to authenticate with Apple Maps",
				}
			}

			const { accessToken } = (await tokenResponse.json()) as { accessToken: string }

			// Prepare search parameters
			const searchParams = new URLSearchParams()

			// Only add q if there's a query
			if (query) {
				searchParams.append("q", query)
			}

			searchParams.append("searchLocation", `${latitude},${longitude}`)
			searchParams.append("resultTypeFilter", "Poi")
			searchParams.append("lang", "en-US")

			// Add category filters if specified
			const poiFilters = getCategoryFilters(categories)
			if (poiFilters.length > 0 && !categories.includes("all")) {
				searchParams.append("includePoiCategories", poiFilters.join(","))
			}

			console.log("Search URL:", `https://maps-api.apple.com/v1/search?${searchParams.toString()}`)

			// Make the search request to Apple Maps Server API
			const searchResponse = await fetch(
				`https://maps-api.apple.com/v1/search?${searchParams.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/json",
					},
				},
			)

			if (!searchResponse.ok) {
				const errorText = await searchResponse.text()
				console.error(
					"Search API error:",
					searchResponse.status,
					searchResponse.statusText,
					errorText,
				)
				return {
					places: [],
					error: `Search failed: ${searchResponse.status} - ${errorText}`,
				}
			}

			const data = (await searchResponse.json()) as any

			// Parse and format the results
			const places = (data.results || [])
				.map((place: any) => ({
					name: place.name || "Unknown Place",
					category: place.poiCategory || place.categories?.[0] || undefined,
					address: formatAddress(place),
					coordinate: {
						latitude: place.coordinate?.latitude || place.center?.latitude,
						longitude: place.coordinate?.longitude || place.center?.longitude,
					},
					distance: place.coordinate
						? calculateDistance(
								latitude,
								longitude,
								place.coordinate.latitude,
								place.coordinate.longitude,
							)
						: undefined,
					phoneNumber: place.phoneNumber || undefined,
					url: place.urls?.business || undefined,
					placeId: place.id || place.muid || undefined,
				}))
				.slice(0, limit) // Apply limit

			// Sort by distance if available
			places.sort((a: any, b: any) => {
				if (!a.distance) return 1
				if (!b.distance) return -1
				return a.distance - b.distance
			})

			return { places, data }
		} catch (error) {
			console.error("Error searching nearby places:", error)
			return {
				places: [],
				error: error instanceof Error ? error.message : "Failed to search places",
			}
		}
	},
})

// Helper function to generate MapKit token (reusing logic from mapkit.ts)
async function generateMapKitToken(): Promise<string | null> {
	const teamId = process.env.APPLE_TEAM_ID
	const keyId = process.env.APPLE_MAPKIT_KEY_ID
	let privateKey = process.env.APPLE_MAPKIT_PRIVATE_KEY

	if (!teamId || !keyId || !privateKey) {
		console.error("Missing Apple MapKit configuration")
		return null
	}

	try {
		privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`

		const token = jwt.sign(
			{
				iss: teamId,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 1800,
			},
			privateKey,
			{
				header: {
					kid: keyId,
					typ: "JWT",
					alg: "ES256",
				},
				algorithm: "ES256",
			},
		)

		return token
	} catch (error) {
		console.error("Error generating MapKit token:", error)
		return null
	}
}

// Convert category strings to MapKit POI filters
function getCategoryFilters(categories: string[]): string[] {
	const filters: Set<string> = new Set()

	for (const category of categories) {
		const poiList = POI_CATEGORIES[category as keyof typeof POI_CATEGORIES]
		if (poiList) {
			for (const poi of poiList) {
				filters.add(poi)
			}
		}
	}

	return Array.from(filters)
}

// Format address from place data
function formatAddress(place: any): string {
	// Apple Maps Server API uses structuredAddress
	if (place.structuredAddress) {
		const addr = place.structuredAddress
		const parts = []

		if (addr.thoroughfare) {
			let street = addr.thoroughfare
			if (addr.subThoroughfare) {
				street = `${addr.subThoroughfare} ${street}`
			}
			parts.push(street)
		}

		if (addr.locality) parts.push(addr.locality)
		if (addr.administrativeArea) parts.push(addr.administrativeArea)
		if (addr.postCode) parts.push(addr.postCode)

		return parts.join(", ")
	}

	// Fallback to formattedAddress if available
	if (place.formattedAddress) {
		return place.formattedAddress
	}

	// Fallback to displayMapRegion center as approximate address
	if (place.displayMapRegion) {
		return `Near ${place.name || "location"}`
	}

	return "Address not available"
}

// Calculate distance between two points (Haversine formula)
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

// Additional helper action to get available categories
export const getPlaceCategories = action({
	args: {},
	returns: v.object({
		categories: v.array(
			v.object({
				key: v.string(),
				label: v.string(),
				poiTypes: v.array(v.string()),
			}),
		),
	}),
	handler: async () => {
		const categories = Object.entries(POI_CATEGORIES)
			.filter(([key]) => key !== "all")
			.map(([key, poiTypes]) => ({
				key,
				label:
					key.charAt(0).toUpperCase() +
					key
						.slice(1)
						.replace(/([A-Z])/g, " $1")
						.trim(),
				poiTypes,
			}))

		return { categories }
	},
})
