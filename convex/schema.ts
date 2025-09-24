import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { externalSourceValidator, propertyTypeValidator, propertySortByValidator } from "./validators"

export default defineSchema({
	users: defineTable({
		email: v.string(),
	}).index("by_email", ["email"]),

	properties: defineTable({
		title: v.string(),
		description: v.string(),
		address: v.object({
			fullAddress: v.string(),
			street: v.string(),
			city: v.string(),
			state: v.string(),
			zipCode: v.string(),
			country: v.string(),
			latitude: v.optional(v.number()),
			longitude: v.optional(v.number()),
		}),

		// Property details
		propertyType: propertyTypeValidator,
		rooms: v.object({
			bedrooms: v.number(),
			bathrooms: v.number(),
		}),
		squareMeters: v.number(),

		// Rental details
		monthlyRent: v.object({
			cold: v.optional(v.number()),
			warm: v.optional(v.number()),
		}),
		deposit: v.optional(v.number()), // Made optional for external imports
		minimumLease: v.optional(v.number()), // in months, made optional
		availableFrom: v.optional(v.number()),

		amenities: v.optional(v.array(v.string())),

		furnished: v.optional(v.boolean()), // Made optional for external imports
		petFriendly: v.optional(v.boolean()),

		imageUrls: v.optional(v.array(v.string())),

		// Owner info - made flexible for external sources
		ownerId: v.optional(v.id("users")), // Made optional for external properties
		contactEmail: v.optional(v.string()), // Made optional
		contactPhone: v.optional(v.string()),

		// External source tracking
		externalId: v.optional(v.string()), // ID from external provider
		externalSource: v.optional(externalSourceValidator),
		externalUrl: v.optional(v.string()), // Original listing URL
		lastSyncedAt: v.optional(v.number()), // Timestamp of last sync

		// Status
		status: v.union(v.literal("active"), v.literal("disabled")),
		isExternal: v.boolean(),
	})
		.index("by_status", ["status"])
		.index("by_city", ["address.city"])
		.index("by_property_type", ["propertyType"])
		.index("by_status_and_city", ["status", "address.city"])
		.index("by_status_and_property_type", ["status", "propertyType"])
		.index("by_external_id_and_source", ["externalId", "externalSource"])
		.index("by_owner", ["ownerId"]),

	savedProperties: defineTable({
		userId: v.id("users"),
		propertyId: v.id("properties"),
	})
		.index("by_user", ["userId"])
		.index("by_user_and_property", ["userId", "propertyId"]),

	savedSearches: defineTable({
		userId: v.id("users"),
		name: v.string(), // User-defined name for the search
		description: v.optional(v.string()), // Optional description
		
		// Search criteria (mirrors SearchFilters interface)
		city: v.string(),
		country: v.string(),
		propertyType: v.optional(propertyTypeValidator),
		sortBy: propertySortByValidator,
		minPrice: v.optional(v.number()),
		maxPrice: v.optional(v.number()),
		bedrooms: v.optional(v.number()),
		bathrooms: v.optional(v.number()),
		amenities: v.optional(v.array(v.string())),
		petFriendly: v.optional(v.boolean()),
		furnished: v.optional(v.boolean()),
		
		// Notification settings
		notificationsEnabled: v.boolean(),
		emailNotifications: v.boolean(),
		lastNotificationSent: v.optional(v.number()), // timestamp
		
		// Metadata
		isActive: v.boolean(), // user can disable without deleting
		createdAt: v.number(),
		lastModified: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_active", ["userId", "isActive"])
		.index("by_notifications", ["notificationsEnabled", "isActive"])
		.index("by_city_notifications", ["city", "notificationsEnabled", "isActive"]),
})
