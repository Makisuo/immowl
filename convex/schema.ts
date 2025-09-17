import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	users: defineTable({
		email: v.string(),
	}).index("email", ["email"]),

	properties: defineTable({
		title: v.string(),
		description: v.string(),
		address: v.string(),
		city: v.string(),
		state: v.string(),
		zipCode: v.string(),
		country: v.string(),
		latitude: v.optional(v.number()),
		longitude: v.optional(v.number()),

		// Property details
		propertyType: v.union(
			v.literal("apartment"),
			v.literal("house"),
			v.literal("condo"),
			v.literal("townhouse"),
			v.literal("studio"),
		),
		bedrooms: v.number(),
		bathrooms: v.number(),
		squareFeet: v.optional(v.number()),
		furnished: v.optional(v.boolean()), // Made optional for external imports

		// Rental details
		monthlyRent: v.number(),
		securityDeposit: v.optional(v.number()), // Made optional for external imports
		minimumLease: v.optional(v.number()), // in months, made optional
		availableFrom: v.optional(v.number()),

		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		smokingAllowed: v.optional(v.boolean()),
		parkingIncluded: v.optional(v.boolean()),
		utilitiesIncluded: v.optional(v.boolean()),
		internetIncluded: v.optional(v.boolean()),

		// Building features - all made optional for external imports
		elevator: v.optional(v.boolean()),
		laundryInUnit: v.optional(v.boolean()),
		laundryInBuilding: v.optional(v.boolean()),
		gym: v.optional(v.boolean()),
		pool: v.optional(v.boolean()),
		balcony: v.optional(v.boolean()),
		airConditioning: v.optional(v.boolean()),
		heating: v.optional(v.boolean()),

		// Images
		images: v.optional(v.array(v.id("_storage"))), // Made optional for external imports
		imageUrls: v.optional(v.array(v.string())), // External image URLs for scraped properties

		// Owner info - made flexible for external sources
		ownerId: v.optional(v.id("users")), // Made optional for external properties
		contactEmail: v.optional(v.string()), // Made optional
		contactPhone: v.optional(v.string()),

		// External source tracking
		externalId: v.optional(v.string()), // ID from external provider
		externalSource: v.optional(v.string()), // Name of the external provider (e.g., "zillow", "apartments.com")
		externalUrl: v.optional(v.string()), // Original listing URL
		lastSyncedAt: v.optional(v.number()), // Timestamp of last sync

		// Additional fields that might come from external sources
		yearBuilt: v.optional(v.number()),
		lotSize: v.optional(v.number()),
		propertyTax: v.optional(v.number()),
		hoaFees: v.optional(v.number()),
		walkScore: v.optional(v.number()),
		schoolDistrict: v.optional(v.string()),
		nearbyTransport: v.optional(v.array(v.string())),

		// Flexible metadata for any additional data from external sources
		metadata: v.optional(
			v.object({
				originalData: v.optional(v.string()), // JSON string of original scraped data
				customFields: v.optional(v.record(v.string(), v.string())), // Key-value pairs for custom fields
			}),
		),

		// Status
		isActive: v.boolean(),
		featured: v.optional(v.boolean()), // Made optional, defaults to false
		isExternal: v.optional(v.boolean()), // Flag to identify external properties
	}),
})
