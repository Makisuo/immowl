import {
	rand,
	randAddress,
	randBoolean,
	randCity,
	randCountryCode,
	randEmail,
	randFloat,
	randFutureDate,
	randImg,
	randLatitude,
	randLongitude,
	randNumber,
	randParagraph,
	randPhoneNumber,
	randState,
	randTextRange,
	randUuid,
	randZipCode,
} from "@ngneat/falso"
import { type OrderedQuery, paginationOptsValidator, type Query, type QueryInitializer } from "convex/server"
import { v } from "convex/values"
import type { DataModel } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"

const propertyTypes = ["apartment", "house", "condo", "townhouse", "studio"] as const

const amenitiesList = [
	"Parking",
	"Storage",
	"Dishwasher",
	"Microwave",
	"Walk-in Closet",
	"Hardwood Floors",
	"Carpet",
	"High Ceilings",
	"Natural Light",
	"City View",
	"Garden View",
	"Street Parking",
	"Garage",
	"Patio",
	"Deck",
	"Fireplace",
	"Smart Home",
	"Security System",
	"Concierge",
	"Doorman",
	"Package Room",
	"Bike Storage",
	"EV Charging",
	"Rooftop Access",
	"BBQ Area",
	"Playground",
	"Dog Park",
	"Tennis Court",
	"Basketball Court",
	"Sauna",
	"Steam Room",
	"Wine Cellar",
	"Home Office",
	"Guest Room",
]

const externalSources = [
	"immowelt",
	// "zillow",
	// "apartments.com",
	// "trulia",
	// "realtor.com",
	// "craigslist",
	// "padmapper",
	// "rentberry",
]

function generatePropertyData(specificCity?: string, specificCountry?: string) {
	const propertyType = rand(propertyTypes)

	// Generate correlated data based on property type
	let bedrooms: number
	let bathrooms: number
	let squareMeters: number
	let monthlyRent: number

	switch (propertyType) {
		case "studio":
			bedrooms = 0
			bathrooms = 1
			squareMeters = randNumber({ min: 25, max: 50 })
			monthlyRent = randNumber({ min: 500, max: 1500 })
			break
		case "apartment":
			bedrooms = randNumber({ min: 1, max: 3 })
			bathrooms = randNumber({ min: 1, max: 2 })
			squareMeters = randNumber({ min: 40, max: 120 })
			monthlyRent = randNumber({ min: 800, max: 3500 })
			break
		case "condo":
			bedrooms = randNumber({ min: 1, max: 4 })
			bathrooms = randNumber({ min: 1, max: 3 })
			squareMeters = randNumber({ min: 50, max: 150 })
			monthlyRent = randNumber({ min: 1000, max: 4500 })
			break
		case "townhouse":
			bedrooms = randNumber({ min: 2, max: 4 })
			bathrooms = randNumber({ min: 2, max: 3 })
			squareMeters = randNumber({ min: 80, max: 200 })
			monthlyRent = randNumber({ min: 1500, max: 5500 })
			break
		case "house":
			bedrooms = randNumber({ min: 2, max: 6 })
			bathrooms = randNumber({ min: 2, max: 4 })
			squareMeters = randNumber({ min: 100, max: 300 })
			monthlyRent = randNumber({ min: 1800, max: 8000 })
			break
		default:
			bedrooms = randNumber({ min: 1, max: 4 })
			bathrooms = randNumber({ min: 1, max: 3 })
			squareMeters = randNumber({ min: 50, max: 150 })
			monthlyRent = randNumber({ min: 1000, max: 4000 })
	}

	// Generate address
	const address = randAddress()
	const city = specificCity || randCity()
	const state = randState()
	const zipCode = randZipCode()
	const country = specificCountry || randCountryCode()

	// Generate title and description
	const bedroomText = bedrooms === 0 ? "Studio" : `${bedrooms} Bedroom`
	const propertyTypeText = propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
	const title = `${bedroomText} ${propertyTypeText} in ${city}`

	const description = `${randParagraph()} ${randTextRange({ min: 100, max: 300 })}`

	// Generate images (3-10 images per property)
	const imageCount = randNumber({ min: 3, max: 10 })
	const imageUrls = Array.from({ length: imageCount }, () =>
		randImg({ width: 800, height: 600, category: "house" }),
	)

	// Randomly select amenities
	const amenityCount = randNumber({ min: 3, max: 15 })
	const selectedAmenities = rand(amenitiesList, { length: amenityCount })

	// Generate external source data
	const isExternal = randBoolean()
	const externalSource = isExternal ? rand(externalSources) : undefined
	const externalId = isExternal ? randUuid() : undefined
	const externalUrl = isExternal ? `https://${externalSource}.com/listing/${externalId}` : undefined

	// Generate availability date (some immediate, some future)
	const availableFrom = randBoolean()
		? Date.now() // Available now
		: randFutureDate({ years: 1 }).getTime() // Available in the future

	return {
		title,
		description,
		address: address.street,
		city,
		state,
		zipCode,
		country,
		latitude: randLatitude(),
		longitude: randLongitude(),
		propertyType,
		rooms: {
			bedrooms,
			bathrooms,
		},
		squareMeters,
		monthlyRent,
		deposit: Math.round(monthlyRent * randFloat({ min: 1, max: 2, fraction: 1 })),
		minimumLease: rand([1, 3, 6, 12, 24]),
		availableFrom,
		amenities: selectedAmenities,
		furnished: randBoolean(),
		petFriendly: randBoolean(),
		imageUrls,
		contactEmail: randEmail(),
		contactPhone: randPhoneNumber(),
		externalId,
		externalSource,
		externalUrl,
		lastSyncedAt: isExternal ? Date.now() : undefined,
		status: "active" as const,
		isExternal,
	}
}

export const listProperties = query({
	args: {
		city: v.optional(v.string()),
		country: v.optional(v.string()),
		propertyType: v.optional(
			v.union(
				v.literal("apartment"),
				v.literal("house"),
				v.literal("condo"),
				v.literal("townhouse"),
				v.literal("studio"),
			),
		),
		sortBy: v.optional(
			v.union(
				v.literal("price-low"),
				v.literal("price-high"),
				v.literal("newest"),
				v.literal("available"),
			),
		),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		// Stage 1: Create the initial table query
		const tableQuery: QueryInitializer<DataModel["properties"]> = ctx.db.query("properties")

		// Stage 2: Apply index based on filters
		let indexedQuery: Query<DataModel["properties"]>

		if (args.city && args.propertyType) {
			// Use composite index if both filters are present
			indexedQuery = tableQuery
				.withIndex("by_status_and_city", (q) => q.eq("status", "active").eq("city", args.city!))
				.filter((q) => q.eq(q.field("propertyType"), args.propertyType))
		} else if (args.city) {
			// Use city index
			indexedQuery = tableQuery.withIndex("by_status_and_city", (q) =>
				q.eq("status", "active").eq("city", args.city!),
			)
		} else if (args.propertyType) {
			// Use property type index
			indexedQuery = tableQuery.withIndex("by_status_and_property_type", (q) =>
				q.eq("status", "active").eq("propertyType", args.propertyType!),
			)
		} else {
			// Use status index for general queries
			indexedQuery = tableQuery.withIndex("by_status", (q) => q.eq("status", "active"))
		}

		// Stage 3: Apply country filter if provided (no index for country)
		let filteredQuery = indexedQuery
		if (args.country) {
			filteredQuery = indexedQuery.filter((q) => q.eq(q.field("country"), args.country))
		}

		// Stage 4: Apply sorting and additional filters
		let orderedQuery: OrderedQuery<DataModel["properties"]>

		switch (args.sortBy) {
			case "price-high":
			case "price-low":
			case "newest":
				orderedQuery = filteredQuery.order("desc")
				break
			case "available": {
				// Filter for properties available now or soon
				const now = Date.now()
				const oneMonthFromNow = now + 30 * 24 * 60 * 60 * 1000
				const availableFiltered = filteredQuery.filter((q) =>
					q.or(q.not(q.field("availableFrom")), q.lte(q.field("availableFrom"), oneMonthFromNow)),
				)
				orderedQuery = availableFiltered.order("asc")
				break
			}
			default:
				orderedQuery = filteredQuery.order("desc")
		}

		const result = await orderedQuery.paginate(args.paginationOpts)

		// If sorting by price, sort the page results client-side
		if (args.sortBy === "price-low" || args.sortBy === "price-high") {
			result.page.sort((a, b) => {
				if (args.sortBy === "price-low") {
					return a.monthlyRent - b.monthlyRent
				} else {
					return b.monthlyRent - a.monthlyRent
				}
			})
		}

		return result
	},
})

export const getTotalCount = query({
	args: {
		city: v.optional(v.string()),
		country: v.optional(v.string()),
		propertyType: v.optional(
			v.union(
				v.literal("apartment"),
				v.literal("house"),
				v.literal("condo"),
				v.literal("townhouse"),
				v.literal("studio"),
			),
		),
	},
	handler: async (ctx, args) => {
		// Stage 1: Create the initial table query
		const tableQuery: QueryInitializer<DataModel["properties"]> = ctx.db.query("properties")

		// Stage 2: Apply index based on filters (same logic as listProperties)
		let indexedQuery: Query<DataModel["properties"]>

		if (args.city && args.propertyType) {
			// Use composite index if both filters are present
			indexedQuery = tableQuery
				.withIndex("by_status_and_city", (q) => q.eq("status", "active").eq("city", args.city!))
				.filter((q) => q.eq(q.field("propertyType"), args.propertyType))
		} else if (args.city) {
			// Use city index
			indexedQuery = tableQuery.withIndex("by_status_and_city", (q) =>
				q.eq("status", "active").eq("city", args.city!),
			)
		} else if (args.propertyType) {
			// Use property type index
			indexedQuery = tableQuery.withIndex("by_status_and_property_type", (q) =>
				q.eq("status", "active").eq("propertyType", args.propertyType!),
			)
		} else {
			// Use status index for general queries
			indexedQuery = tableQuery.withIndex("by_status", (q) => q.eq("status", "active"))
		}

		// Stage 3: Apply country filter if provided (no index for country)
		let filteredQuery = indexedQuery
		if (args.country) {
			filteredQuery = indexedQuery.filter((q) => q.eq(q.field("country"), args.country))
		}

		const properties = await filteredQuery.collect()
		return properties.length
	},
})

export const getPropertyById = query({
	args: {
		propertyId: v.id("properties"),
	},
	handler: async (ctx, args) => {
		const property = await ctx.db.get(args.propertyId)

		if (!property || property.status !== "active") {
			return null
		}

		return property
	},
})

export const createMockListings = mutation({
	args: {
		count: v.optional(v.number()),
		city: v.optional(v.string()),
		country: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const count = args.count || 75 // Default to 75 properties
		const city = args.city
		const country = args.country
		const properties = []

		console.log(
			`Generating ${count} mock property listings${city ? ` in ${city}` : ""}${country ? ` in country ${country}` : ""}...`,
		)

		// Generate all properties
		for (let i = 0; i < count; i++) {
			const propertyData = generatePropertyData(city, country)
			properties.push(propertyData)
		}

		// Batch insert for better performance
		const batchSize = 10
		let inserted = 0

		for (let i = 0; i < properties.length; i += batchSize) {
			const batch = properties.slice(i, Math.min(i + batchSize, properties.length))

			// Insert each property in the batch
			for (const property of batch) {
				await ctx.db.insert("properties", property)
				inserted++
			}

			// Log progress
			if (inserted % 20 === 0) {
				console.log(`Inserted ${inserted}/${count} properties...`)
			}
		}

		console.log(
			`Successfully created ${count} mock property listings${city ? ` in ${city}` : ""}${country ? ` in country ${country}` : ""}!`,
		)

		return {
			success: true,
			count,
			city,
			country,
			message: `Created ${count} mock property listings${city ? ` in ${city}` : ""}${country ? ` in country ${country}` : ""}`,
		}
	},
})
