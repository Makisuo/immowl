import { Workpool } from "@convex-dev/workpool"
import { v } from "convex/values"
import { components, internal } from "../_generated/api"
import { action, internalAction } from "../_generated/server"
import { firecrawl } from "./client"

const scrapePool = new Workpool(components.scrapeWorkpool, {
	maxParallelism: 20,
})

export const crawlImmowelt = action({
	handler: async (ctx) => {
		const res = await firecrawl.scrape(
			"https://www.immowelt.de/classified-search?distributionTypes=Rent&estateTypes=Apartment&locations=AD08DE8638&order=DateDesc&page=1",
			{
				formats: ["links"],
			},
		)

		if (!res.links || res.links.length === 0) {
			return
		}

		const exposeLinks = res.links.filter((link) => link.includes("https://www.immowelt.de/expose"))

		// TODO should paginate through all results
		const listings = exposeLinks
			.map((link) => {
				const match = link.match(/\/expose\/([a-f0-9-]+)/i)
				const listingId = match ? match[1] : null

				return {
					listingId,
				}
			})
			.filter((item) => item.listingId !== null)

		await scrapePool.enqueueActionBatch(ctx, internal.crawlers.immowelt.scrapeListing, listings)

		return listings
	},
})

export const scrapeListing = internalAction({
	args: {
		listingId: v.string(),
	},
	handler: async (_ctx, args) => {
		firecrawl.scrape(`https://www.immowelt.de/expose/${args.listingId}`, {
			formats: [
				{
					type: "json",
					schema: {
						type: "object",
						properties: {
							title: {
								type: "string",
							},
							description: {
								type: "string",
							},
							address: {
								type: "string",
							},
							city: {
								type: "string",
							},
							state: {
								type: "string",
							},
							zipCode: {
								type: "string",
							},
							country: {
								type: "string",
							},
							latitude: {
								type: "number",
							},
							longitude: {
								type: "number",
							},
							propertyType: {
								type: "string",
							},
							bedrooms: {
								type: "number",
							},
							bathrooms: {
								type: "number",
							},
							squareFeet: {
								type: "number",
							},
							furnished: {
								type: "boolean",
							},
							monthlyRent: {
								type: "number",
							},
							securityDeposit: {
								type: "number",
							},
							minimumLease: {
								type: "number",
							},
							availableFrom: {
								type: "string",
							},
							amenities: {
								type: "array",
							},
							petFriendly: {
								type: "boolean",
							},
							smokingAllowed: {
								type: "boolean",
							},
							parkingIncluded: {
								type: "boolean",
							},
							utilitiesIncluded: {
								type: "boolean",
							},
							laundryInUnit: {
								type: "boolean",
							},
							laundryInBuilding: {
								type: "boolean",
							},
							gym: {
								type: "boolean",
							},
							pool: {
								type: "boolean",
							},
							balcony: {
								type: "boolean",
							},
							airConditioning: {
								type: "boolean",
							},
							heating: {
								type: "boolean",
							},
							imageUrls: {
								type: "array",
							},
							contactEmail: {
								type: "string",
							},
							contactPhone: {
								type: "string",
							},
							yearBuilt: {
								type: "number",
							},
							propertyTax: {
								type: "number",
							},
							hoaFees: {
								type: "number",
							},
							walkScore: {
								type: "number",
							},
							schoolDistrict: {
								type: "string",
							},
							nearbyTransport: {
								type: "array",
							},
						},
					},
				},
			],
		})
		console.log("scraping", args.listingId)
	},
})
