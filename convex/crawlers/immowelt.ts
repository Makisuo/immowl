import { Workpool } from "@convex-dev/workpool"
import { v } from "convex/values"
import { components, internal } from "../_generated/api"
import { action, internalAction, internalQuery } from "../_generated/server"
import { firecrawl } from "./client"

const scrapePool = new Workpool(components.scrapeWorkpool, {
	maxParallelism: 20,
})

export const crawlImmowelt = action({
	args: {
		maxPages: v.optional(v.number()),
		city: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const maxPages = args.maxPages || 5
		const allListings: Array<{ listingId: string; url: string }> = []
		let hasStoppedEarly = false

		// Get existing external IDs to check for duplicates
		const existingIds: string[] = await ctx.runQuery(internal.crawlers.immowelt.getExistingListingIds)
		const existingIdSet = new Set(existingIds)

		for (let page = 1; page <= maxPages; page++) {
			console.log(`Crawling page ${page}...`)

			// Build the search URL (Potsdam by default, can be parameterized)
			// Currently filters out apartmentswaps and WGs
			const searchUrl = `https://www.immowelt.de/classified-search?distributionTypes=Rent&estateTypes=House,Apartment&locations=AD08DE8638&projectTypes=Stock,New_Build&order=DateDesc&page=${page}`

			try {
				const res = await firecrawl.scrape(searchUrl, {
					formats: ["links"],
				})

				if (!res.links || res.links.length === 0) {
					console.log(`No links found on page ${page}, stopping.`)
					break
				}

				const exposeLinks = res.links.filter((link) =>
					link.includes("https://www.immowelt.de/expose"),
				)

				const listings = exposeLinks
					.map((link) => {
						const match = link.match(/\/expose\/([a-f0-9-]+)/i)
						const listingId = match ? match[1] : null
						return { listingId, url: link }
					})
					.filter((item): item is { listingId: string; url: string } => item.listingId !== null)

				// Filter out already existing listings
				const newListings: Array<{ listingId: string; url: string }> = listings.filter(
					(l) => !existingIdSet.has(l.listingId),
				)

				if (newListings.length === 0) {
					console.log(`All listings on page ${page} already exist, stopping.`)
					hasStoppedEarly = true
					break
				}

				if (newListings.length < listings.length) {
					console.log(
						`Found ${listings.length - newListings.length} duplicate listings on page ${page}`,
					)
				}

				allListings.push(...newListings)

				// If we found some duplicates but not all, we might be near the end
				if (newListings.length < listings.length / 2) {
					console.log(`More than half of listings on page ${page} are duplicates, stopping.`)
					hasStoppedEarly = true
					break
				}
			} catch (error) {
				console.error(`Error crawling page ${page}:`, error)
				break
			}
		}

		if (allListings.length > 0) {
			console.log(`Enqueueing ${allListings.length} new listings for scraping...`)
			await scrapePool.enqueueActionBatch(
				ctx,
				internal.crawlers.immowelt.scrapeListing,
				allListings.map((l) => ({ listingId: l.listingId, url: l.url })),
			)
		}

		return {
			total: allListings.length,
			pagesScraped: hasStoppedEarly ? "stopped early due to duplicates" : maxPages,
			listings: allListings.map((l) => l.listingId),
		}
	},
})

export const getExistingListingIds = internalQuery({
	args: {},
	returns: v.array(v.string()),
	handler: async (ctx) => {
		const properties = await ctx.db
			.query("properties")
			.withIndex("by_external_id_and_source")
			.filter((q) => q.eq(q.field("externalSource"), "immowelt"))
			.collect()

		return properties.map((p) => p.externalId).filter((id): id is string => id !== undefined)
	},
})

export const scrapeListing = internalAction({
	args: {
		listingId: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		console.log(`Scraping listing ${args.listingId}...`)

		try {
			const res = await firecrawl.scrape(`https://www.immowelt.de/expose/${args.listingId}`, {
				formats: [
					{
						type: "json",
						schema: {
							type: "object",
							properties: {
								title: { type: "string" },
								description: {
									type: "string",
									prompt: "Very brief description of the property (max. 50 words)",
								},
								address: { type: "string" },
								city: { type: "string" },
								state: { type: "string" },
								zipCode: { type: "string" },
								propertyType: { type: "string" },
								bedrooms: { type: "number" },
								bathrooms: { type: "number" },
								squareMeters: { type: "number" },
								livingArea: { type: "number" },
								rooms: { type: "number" },
								floor: { type: "number" },
								totalFloors: { type: "number" },
								furnished: { type: "boolean" },
								monthlyRent: { type: "number" },
								coldRent: { type: "number" },
								warmRent: { type: "number" },
								utilities: { type: "number" },
								heatingCosts: { type: "number" },
								securityDeposit: { type: "number" },
								availableFrom: { type: "string" },
								availableDate: { type: "string" },
								balcony: { type: "boolean" },
								terrace: { type: "boolean" },
								garden: { type: "boolean" },
								basement: { type: "boolean" },
								elevator: { type: "boolean" },
								parking: { type: "boolean" },
								garage: { type: "boolean" },
								builtInKitchen: { type: "boolean" },
								petFriendly: { type: "boolean" },
								images: { type: "array", prompt: "All images of the property" },
								contactName: { type: "string" },
								contactPhone: { type: "string" },
								yearBuilt: { type: "number" },
								energyClass: { type: "string" },
							},
						},
					},
				],
			})

			console.log(`Scraped listing ${res}`)

			if (!res || !(res as any).json) {
				console.error(`No data returned for listing ${args.listingId}`)
				return
			}

			const data = (res as any).json

			// Map property type from German to English
			const propertyTypeMap: Record<string, "apartment" | "house" | "studio" | "condo" | "townhouse"> =
				{
					wohnung: "apartment",
					apartment: "apartment",
					haus: "house",
					house: "house",
					studio: "studio",
					maisonette: "apartment",
					dachgeschoss: "apartment",
					penthouse: "apartment",
					loft: "studio",
					etagenwohnung: "apartment",
					erdgeschosswohnung: "apartment",
					souterrainwohnung: "apartment",
					doppelhaushälfte: "townhouse",
					reihenhaus: "townhouse",
					einfamilienhaus: "house",
				}

			let propertyType: "apartment" | "house" | "studio" | "condo" | "townhouse" = "apartment"
			if (data.propertyType) {
				const normalizedType = data.propertyType.toLowerCase()
				propertyType = propertyTypeMap[normalizedType] || "apartment"
			}

			// Determine bedrooms (German sites often list "rooms" which include living room)
			let bedrooms = 1
			if (data.bedrooms && typeof data.bedrooms === "number") {
				bedrooms = data.bedrooms
			} else if (data.rooms && typeof data.rooms === "number") {
				// German convention: total rooms - 1 = bedrooms (assuming 1 living room)
				bedrooms = Math.max(1, data.rooms - 1)
			}
			// Studio has 0 bedrooms
			if (propertyType === "studio") {
				bedrooms = 0
			}

			// Parse available date
			let availableFrom: number | undefined
			if (data.availableFrom || data.availableDate) {
				const dateStr = data.availableFrom || data.availableDate
				if (dateStr === "sofort" || dateStr === "immediately" || dateStr === "ab sofort") {
					availableFrom = Date.now()
				} else {
					const parsed = Date.parse(dateStr)
					if (!Number.isNaN(parsed)) {
						availableFrom = parsed
					}
				}
			}

			// Collect amenities from boolean fields
			const amenities = []
			if (data.balcony) amenities.push("Balcony")
			if (data.terrace) amenities.push("Terrace")
			if (data.garden) amenities.push("Garden")
			if (data.basement) amenities.push("Storage", "Basement")
			if (data.elevator) amenities.push("Elevator")
			if (data.parking) amenities.push("Parking")
			if (data.garage) amenities.push("Garage")
			if (data.builtInKitchen) amenities.push("Built-in Kitchen")

			// Extract images
			let imageUrls: string[] = []
			if (data.images && Array.isArray(data.images)) {
				imageUrls = data.images
					.filter((img: any) => typeof img === "string" || (img && typeof img.url === "string"))
					.map((img: any) => (typeof img === "string" ? img : img.url))
					.slice(0, 20) // Limit to 20 images
			}

			// Determine rent - set warm and cold appropriately
			const coldRent = data.coldRent || data.monthlyRent || 0
			const warmRent = data.warmRent || undefined

			// Get square meters
			const squareMeters = data.squareMeters || data.livingArea || 50

			// Save to database
			await ctx.runMutation(internal.properties.upsertScrapedProperty, {
				externalId: args.listingId,
				externalSource: "immowelt",
				externalUrl: args.url,
				title:
					data.title ||
					`${bedrooms > 0 ? `${bedrooms} Bedroom` : "Studio"} ${propertyType} in ${data.city || "Munich"}`,
				description: data.description || "Property listing from Immowelt",
				address: data.address || "Address not provided",
				city: data.city || "Munich",
				state: data.state || "Bavaria",
				zipCode: data.zipCode || "80000",
				country: "DE",
				propertyType,
				bedrooms,
				bathrooms: data.bathrooms || 1,
				squareMeters,
				coldRent,
				warmRent,
				deposit: data.securityDeposit,
				availableFrom,
				amenities: amenities.length > 0 ? amenities : undefined,
				furnished: data.furnished,
				petFriendly: data.petFriendly,
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
				contactPhone: data.contactPhone,
			})

			console.log(`Successfully scraped and saved listing ${args.listingId}`)
		} catch (error) {
			console.error(`Error scraping listing ${args.listingId}:`, error)
		}
	},
})
