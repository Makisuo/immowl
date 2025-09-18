import { mutation } from "./_generated/server"
import { v } from "convex/values"
import {
	rand,
	randAddress,
	randBoolean,
	randCity,
	randCompanyName,
	randCountry,
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
	randText,
	randTextRange,
	randUuid,
	randZipCode,
} from "@ngneat/falso"

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

const externalSources = ["zillow", "apartments.com", "trulia", "realtor.com", "craigslist", "padmapper", "rentberry"]

function generatePropertyData() {
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
	const city = randCity()
	const state = randState()
	const zipCode = randZipCode()
	const country = randCountry()

	// Generate title and description
	const bedroomText = bedrooms === 0 ? "Studio" : `${bedrooms} Bedroom`
	const propertyTypeText = propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
	const title = `${bedroomText} ${propertyTypeText} in ${city}`

	const description = randParagraph() + " " + randTextRange({ min: 100, max: 300 })

	// Generate images (3-10 images per property)
	const imageCount = randNumber({ min: 3, max: 10 })
	const imageUrls = Array.from({ length: imageCount }, () => randImg({ width: 800, height: 600, category: "house" }))

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
		elevator: propertyType !== "house" && randBoolean(),
		laundryInUnit: randBoolean(),
		laundryInBuilding: propertyType !== "house" && randBoolean(),
		gym: randBoolean(),
		pool: randBoolean(),
		balcony: randBoolean(),
		airConditioning: randBoolean(),
		heating: true, // Most properties have heating
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

export const createMockListings = mutation({
	args: {
		count: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const count = args.count || 75 // Default to 75 properties
		const properties = []

		console.log(`Generating ${count} mock property listings...`)

		// Generate all properties
		for (let i = 0; i < count; i++) {
			const propertyData = generatePropertyData()
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

		console.log(`Successfully created ${count} mock property listings!`)

		return {
			success: true,
			count,
			message: `Created ${count} mock property listings`,
		}
	},
})