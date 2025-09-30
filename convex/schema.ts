import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { externalSourceValidator, propertyTypeValidator } from "./validators"

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

		// Nearby amenities from OpenStreetMap (cached)
		nearbyAmenities: v.optional(
			v.object({
				lastUpdated: v.number(),
				radius: v.number(), // search radius in meters
				summary: v.object({
					totalCount: v.number(),
					categoryCounts: v.record(v.string(), v.number()),
				}),
				restaurants: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				publicTransit: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				trainStations: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				airports: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				shopping: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				healthcare: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				financial: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				education: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				recreation: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				sports: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				parks: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				services: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
				worship: v.object({
					count: v.number(),
					closest: v.optional(
						v.object({
							name: v.optional(v.string()),
							distance: v.number(),
							amenityType: v.string(),
						}),
					),
				}),
			}),
		),
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

		// Search criteria grouped under a single object for extensibility
		criteria: v.object({
			city: v.string(),
			country: v.string(),
			propertyType: v.optional(propertyTypeValidator),
			minPrice: v.optional(v.number()),
			maxPrice: v.optional(v.number()),
			bedrooms: v.optional(v.number()),
			bathrooms: v.optional(v.number()),
			amenities: v.optional(v.array(v.string())),
			petFriendly: v.optional(v.boolean()),
			furnished: v.optional(v.boolean()),
			// Grouped weights for criteria importance (0-100 integers)
			weights: v.optional(
				v.object({
					location: v.optional(v.number()),
					price: v.optional(v.number()),
					bedrooms: v.optional(v.number()),
					bathrooms: v.optional(v.number()),
					amenities: v.optional(v.number()),
					petFriendly: v.optional(v.number()),
					furnished: v.optional(v.number()),
					propertyType: v.optional(v.number()),
				}),
			),
		}),

		// Metadata
		isActive: v.boolean(), // user can disable without deleting
		createdAt: v.number(),
		lastModified: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_user_active", ["userId", "isActive"]),

	userProfiles: defineTable({
		userId: v.id("users"),

		// User's apartment preferences with importance weights
		preferences: v.object({
			// Location preferences
			city: v.optional(v.string()),
			country: v.optional(v.string()),
			locationImportance: v.number(), // 0-100

			// Property details
			propertyType: v.optional(propertyTypeValidator),
			propertyTypeImportance: v.number(), // 0-100
			bedrooms: v.optional(v.number()),
			bedroomsImportance: v.number(), // 0-100
			bathrooms: v.optional(v.number()),
			bathroomsImportance: v.number(), // 0-100
			minSquareMeters: v.optional(v.number()),
			squareMetersImportance: v.number(), // 0-100

			// Price range
			minPrice: v.optional(v.number()),
			maxPrice: v.optional(v.number()),
			priceImportance: v.number(), // 0-100

			// Lifestyle
			petFriendly: v.optional(v.boolean()),
			petFriendlyImportance: v.number(), // 0-100
			furnished: v.optional(v.boolean()),
			furnishedImportance: v.number(), // 0-100
			amenities: v.optional(v.array(v.string())),
			amenitiesImportance: v.number(), // 0-100
		}),

		// Metadata
		lastModified: v.number(),
	}).index("by_user", ["userId"]),
})
