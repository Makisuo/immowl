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
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { internalMutation, mutation, query } from "./_generated/server"
import { internal } from "./_generated/api"
import { applySorting, buildPropertyQuery, sortPaginatedResults } from "./propertyUtils"
import { externalSourceValidator, propertySortByValidator, propertyTypeValidator } from "./validators"

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
	const addressData = randAddress()
	const city = specificCity || randCity()
	const state = randState()
	const zipCode = randZipCode()
	const country = specificCountry || randCountryCode()
	const latitude = randLatitude()
	const longitude = randLongitude()

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
	const externalSource = isExternal ? ("immowelt" as const) : undefined
	const externalId = isExternal ? randUuid() : undefined
	const externalUrl = isExternal ? `https://${externalSource}.com/listing/${externalId}` : undefined

	// Generate availability date (some immediate, some future)
	const availableFrom = randBoolean()
		? Date.now() // Available now
		: randFutureDate({ years: 1 }).getTime() // Available in the future

	return {
		title,
		description,
		address: {
			fullAddress: addressData.street,
			street: addressData.street,
			city,
			state,
			zipCode,
			country,
			latitude,
			longitude,
		},
		propertyType,
		rooms: {
			bedrooms,
			bathrooms,
		},
		squareMeters,
		monthlyRent: {
			cold: monthlyRent,
			warm: undefined,
		},
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
		propertyType: v.optional(propertyTypeValidator),
		sortBy: v.optional(propertySortByValidator),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		// Build the filtered query using shared logic
		const filteredQuery = buildPropertyQuery(ctx, {
			city: args.city,
			propertyType: args.propertyType,
			country: args.country,
		})

		// Apply sorting
		const orderedQuery = applySorting(filteredQuery, args.sortBy)

		// Paginate results
		const result = await orderedQuery.paginate(args.paginationOpts)

		// Apply client-side sorting for price-based sorts
		sortPaginatedResults(result.page, args.sortBy)

		return result
	},
})

export const getTotalCount = query({
	args: {
		city: v.optional(v.string()),
		country: v.optional(v.string()),
		propertyType: v.optional(propertyTypeValidator),
	},
	handler: async (ctx, args) => {
		// Build the filtered query using shared logic
		const filteredQuery = buildPropertyQuery(ctx, {
			city: args.city,
			propertyType: args.propertyType,
			country: args.country,
		})

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

export const upsertScrapedProperty = internalMutation({
	args: {
		// External tracking
		externalId: v.string(),
		externalSource: externalSourceValidator,
		externalUrl: v.string(),

		// Basic info
		title: v.string(),
		description: v.string(),

		// Address - more flexible
		street: v.optional(v.string()), // Optional street address
		address: v.string(), // Fallback/general address
		city: v.string(),
		state: v.string(),
		zipCode: v.string(),
		country: v.string(),
		latitude: v.optional(v.number()),
		longitude: v.optional(v.number()),

		// Property details
		propertyType: propertyTypeValidator,
		bedrooms: v.number(),
		bathrooms: v.number(),
		squareMeters: v.number(),

		// Rent - separate cold and warm
		coldRent: v.optional(v.number()),
		warmRent: v.optional(v.number()),

		// Other rental details
		deposit: v.optional(v.number()),
		minimumLease: v.optional(v.number()),
		availableFrom: v.optional(v.number()),

		// Features
		amenities: v.optional(v.array(v.string())),
		furnished: v.optional(v.boolean()),
		petFriendly: v.optional(v.boolean()),
		imageUrls: v.optional(v.array(v.string())),

		// Contact
		contactEmail: v.optional(v.string()),
		contactPhone: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if property already exists
		const existing = await ctx.db
			.query("properties")
			.withIndex("by_external_id_and_source", (q) =>
				q.eq("externalId", args.externalId).eq("externalSource", args.externalSource),
			)
			.first()

		// Build full address from components
		const streetAddress = args.street || args.address
		const fullAddress = `${streetAddress}, ${args.zipCode} ${args.city}, ${args.state}, ${args.country}`

		const propertyData = {
			title: args.title,
			description: args.description,
			address: {
				fullAddress,
				street: streetAddress,
				city: args.city,
				state: args.state,
				zipCode: args.zipCode,
				country: args.country,
				latitude: args.latitude,
				longitude: args.longitude,
			},
			propertyType: args.propertyType,
			rooms: {
				bedrooms: args.bedrooms,
				bathrooms: args.bathrooms,
			},
			squareMeters: args.squareMeters,
			monthlyRent: {
				cold: args.coldRent,
				warm: args.warmRent,
			},
			deposit: args.deposit,
			minimumLease: args.minimumLease,
			availableFrom: args.availableFrom,
			amenities: args.amenities,
			furnished: args.furnished,
			petFriendly: args.petFriendly,
			imageUrls: args.imageUrls,
			contactEmail: args.contactEmail,
			contactPhone: args.contactPhone,
			externalId: args.externalId,
			externalSource: args.externalSource,
			externalUrl: args.externalUrl,
			lastSyncedAt: Date.now(),
			status: "active" as const,
			isExternal: true,
		}

		if (existing) {
			// Update existing property
			await ctx.db.patch(existing._id, {
				...propertyData,
				lastSyncedAt: Date.now(),
			})
			return { action: "updated", id: existing._id }
		} else {
			// Insert new property
			const id = await ctx.db.insert("properties", propertyData)

			return { action: "created", id }
		}
	},
})
