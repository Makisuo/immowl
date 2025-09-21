import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { externalSourceValidator, propertyTypeValidator } from "./validators"

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
		propertyType: propertyTypeValidator,
		rooms: v.object({
			bedrooms: v.number(),
			bathrooms: v.number(),
		}),
		squareMeters: v.number(),

		// Rental details
		monthlyRent: v.number(),
		deposit: v.optional(v.number()), // Made optional for external imports
		minimumLease: v.optional(v.number()), // in months, made optional
		availableFrom: v.optional(v.number()),

		amenities: v.optional(v.array(v.string())),

		furnished: v.optional(v.boolean()), // Made optional for external imports
		petFriendly: v.optional(v.boolean()),

		imageUrls: v.optional(v.array(v.string())), // External image URLs for scraped properties

		// Owner info - made flexible for external sources
		ownerId: v.optional(v.id("users")), // Made optional for external properties
		contactEmail: v.optional(v.string()), // Made optional
		contactPhone: v.optional(v.string()),

		// External source tracking
		externalId: v.optional(v.string()), // ID from external provider
		externalSource: v.optional(externalSourceValidator),
		externalUrl: v.optional(v.string()), // Original listing URL
		lastSyncedAt: v.optional(v.number()), // Timestamp of last sync

		// Additional fields that might come from external sources

		// Status
		status: v.union(v.literal("active"), v.literal("disabled")),
		isExternal: v.boolean(), // Flag to identify external properties
	})
		.index("by_status", ["status"])
		.index("by_city", ["city"])
		.index("by_property_type", ["propertyType"])
		.index("by_status_and_city", ["status", "city"])
		.index("by_status_and_property_type", ["status", "propertyType"]),

	savedProperties: defineTable({
		userId: v.id("users"),
		propertyId: v.id("properties"),
	})
		.index("by_user", ["userId"])
		.index("by_user_and_property", ["userId", "propertyId"]),
})
