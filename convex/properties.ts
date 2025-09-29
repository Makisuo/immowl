import {
	rand,
	randAddress,
	randBoolean,
	randCity,
	randCountryCode,
	randEmail,
	randFloat,
	randFutureDate,
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

// City-specific data for realistic address generation
const cityData: Record<string, {
	streets: string[]
	zipCodes: string[]
	state: string
	coordinates: { minLat: number; maxLat: number; minLng: number; maxLng: number }
}> = {
	Munich: {
		streets: [
			"Leopoldstraße", "Maximilianstraße", "Sendlinger Straße", "Kaufingerstraße",
			"Theatinerstraße", "Schwabing", "Marienplatz", "Karlsplatz", "Odeonsplatz",
			"Ludwigstraße", "Prinzregentenstraße", "Elisenstraße", "Arnulfstraße",
			"Landsberger Straße", "Nymphenburger Straße", "Romanstraße", "Baaderstraße",
			"Gärtnerplatz", "Frauenstraße", "Rosenheimer Straße"
		],
		zipCodes: ["80331", "80333", "80335", "80469", "80538", "80539", "80796", "80798", "80799", "80801"],
		state: "Bavaria",
		coordinates: { minLat: 48.0619, maxLat: 48.2482, minLng: 11.3608, maxLng: 11.7229 }
	},
	Berlin: {
		streets: [
			"Alexanderplatz", "Unter den Linden", "Friedrichstraße", "Kurfürstendamm",
			"Karl-Marx-Allee", "Potsdamer Platz", "Brandenburger Tor", "Leipziger Straße",
			"Oranienburger Straße", "Schönhauser Allee", "Warschauer Straße", "Kastanienallee",
			"Prenzlauer Allee", "Sonnenallee", "Bergmannstraße", "Mehringdamm", "Torstraße",
			"Rosenthaler Straße", "Invalidenstraße", "Eberswalder Straße"
		],
		zipCodes: ["10115", "10117", "10178", "10179", "10243", "10245", "10247", "10249", "10405", "10435"],
		state: "Berlin",
		coordinates: { minLat: 52.3382, maxLat: 52.6755, minLng: 13.0883, maxLng: 13.7611 }
	},
	Hamburg: {
		streets: [
			"Reeperbahn", "Mönckebergstraße", "Jungfernstieg", "Alsterarkaden", "Speicherstadt",
			"HafenCity", "Große Bleichen", "Neuer Wall", "Ballindamm", "Gänsemarkt",
			"Colonnaden", "Rothenbaumchaussee", "Grindelallee", "Eppendorfer Landstraße",
			"Hoheluftchaussee", "Osterstraße", "Schulterblatt", "Susannenstraße",
			"Lange Reihe", "Steindamm"
		],
		zipCodes: ["20095", "20099", "20144", "20146", "20148", "20249", "20251", "20253", "20354", "20355"],
		state: "Hamburg",
		coordinates: { minLat: 53.3950, maxLat: 53.7499, minLng: 9.7383, maxLng: 10.3270 }
	},
	Frankfurt: {
		streets: [
			"Zeil", "Goethestraße", "Kaiserstraße", "Mainzer Landstraße", "Bockenheimer Landstraße",
			"Berger Straße", "Schweizer Straße", "Freßgass", "Schillerstraße", "Große Eschenheimer Straße",
			"Neue Mainzer Straße", "Taunusanlage", "Westendstraße", "Reuterweg", "Braubachstraße",
			"Fahrgasse", "Saalgasse", "Friedberger Landstraße", "Hanauer Landstraße", "Textorstraße"
		],
		zipCodes: ["60311", "60313", "60314", "60316", "60318", "60320", "60322", "60325", "60326", "60329"],
		state: "Hesse",
		coordinates: { minLat: 50.0157, maxLat: 50.2271, minLng: 8.4729, maxLng: 8.8004 }
	},
	Cologne: {
		streets: [
			"Hohe Straße", "Schildergasse", "Ehrenstraße", "Aachener Straße", "Venloer Straße",
			"Deutzer Brücke", "Severinstraße", "Friesenplatz", "Rudolfplatz", "Neumarkt",
			"Heumarkt", "Domplatte", "Am Hof", "Eigelstein", "Luxemburger Straße",
			"Ringe", "Mittelstraße", "Breite Straße", "Marsplatz", "Barbarossaplatz"
		],
		zipCodes: ["50667", "50668", "50670", "50672", "50674", "50676", "50677", "50678", "50679", "50733"],
		state: "North Rhine-Westphalia",
		coordinates: { minLat: 50.8333, maxLat: 51.0845, minLng: 6.7727, maxLng: 7.1619 }
	}
}

/**
 * Generate a realistic address for a specific city
 * Coordinates are set to undefined and will be geocoded later via background task
 */
function generateCityAddress(city?: string): {
	street: string
	city: string
	state: string
	zipCode: string
	latitude: number | undefined
	longitude: number | undefined
} {
	// If city is specified and we have data for it, use that
	if (city && cityData[city]) {
		const data = cityData[city]
		const street = rand(data.streets)
		const streetNumber = randNumber({ min: 1, max: 250 })
		const zipCode = rand(data.zipCodes)

		// Coordinates will be geocoded later via background task
		// Using undefined so they can be identified for geocoding
		return {
			street: `${street} ${streetNumber}`,
			city: city,
			state: data.state,
			zipCode: zipCode,
			latitude: undefined,
			longitude: undefined
		}
	}

	// Fall back to random generation (for cities without curated data)
	const addressData = randAddress()
	return {
		street: addressData.street,
		city: city || randCity(),
		state: randState(),
		zipCode: randZipCode(),
		latitude: undefined,
		longitude: undefined
	}
}

/**
 * Get curated real estate images based on property type
 * Returns a mix of exterior and interior images
 */
function getCuratedRealEstateImages(
	propertyType: typeof propertyTypes[number],
	count: number = 5
): string[] {
	// Curated collection of real estate images from Unsplash
	const houseImages = [
		"https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&h=600&q=80"
	]

	const apartmentImages = [
		"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&h=600&q=80"
	]

	const condoImages = [
		"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&h=600&q=80"
	]

	const townhouseImages = [
		"https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1628012209120-59c303676c92?auto=format&fit=crop&w=800&h=600&q=80"
	]

	const studioImages = [
		"https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?auto=format&fit=crop&w=800&h=600&q=80",
		"https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&h=600&q=80"
	]

	const imageCollections = {
		house: houseImages,
		apartment: apartmentImages,
		condo: condoImages,
		townhouse: townhouseImages,
		studio: studioImages
	}

	const collection = imageCollections[propertyType]

	// Shuffle and return the requested number of images
	const shuffled = [...collection].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, Math.min(count, shuffled.length))
}

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

	// Generate address using the new helper function
	const addressInfo = generateCityAddress(specificCity)
	const country = specificCountry || randCountryCode()

	// Generate title and description
	const bedroomText = bedrooms === 0 ? "Studio" : `${bedrooms} Bedroom`
	const propertyTypeText = propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
	const title = `${bedroomText} ${propertyTypeText} in ${addressInfo.city}`

	const description = `${randParagraph()} ${randTextRange({ min: 100, max: 300 })}`

	// Generate images using curated real estate images
	const imageCount = randNumber({ min: 3, max: 8 })
	const imageUrls = getCuratedRealEstateImages(propertyType, imageCount)

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
			fullAddress: `${addressInfo.street}, ${addressInfo.zipCode} ${addressInfo.city}, ${addressInfo.state}`,
			street: addressInfo.street,
			city: addressInfo.city,
			state: addressInfo.state,
			zipCode: addressInfo.zipCode,
			country,
			latitude: addressInfo.latitude,
			longitude: addressInfo.longitude,
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
