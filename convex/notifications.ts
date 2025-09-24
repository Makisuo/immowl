import { v } from "convex/values"
import { internalAction, internalMutation } from "./_generated/server"

import type { Doc, Id } from "./_generated/dataModel"
import { internal } from "./_generated/api"
import { propertyTypeValidator } from "./validators"

// Narrowed property shape used for matching and notifications
type MatchableProperty = Pick<
	Doc<"properties">,
	"title" | "propertyType" | "amenities" | "furnished" | "petFriendly"
> & {
	address: Pick<Doc<"properties">["address"], "city" | "country">
	monthlyRent: Doc<"properties">["monthlyRent"]
	rooms: Doc<"properties">["rooms"]
}

// Check if a new property matches any saved searches
export const checkPropertyMatches = internalAction({
	args: {
		propertyId: v.id("properties"),
		property: v.object({
			title: v.string(),
			address: v.object({
				city: v.string(),
				country: v.string(),
			}),
			propertyType: propertyTypeValidator,
			monthlyRent: v.object({
				cold: v.optional(v.number()),
				warm: v.optional(v.number()),
			}),
			rooms: v.object({
				bedrooms: v.number(),
				bathrooms: v.number(),
			}),
			amenities: v.optional(v.array(v.string())),
			furnished: v.optional(v.boolean()),
			petFriendly: v.optional(v.boolean()),
		}),
	},
	returns: v.null(),
	handler: async (ctx, { propertyId, property }) => {
		// Get all active saved searches with notifications enabled
		const savedSearches = await ctx.runQuery(internal.savedSearches.getActiveSearchesForNotification)

		const matchingSearches = []

		for (const search of savedSearches) {
			if (doesPropertyMatchSearch(property, search)) {
				matchingSearches.push(search)
			}
		}

		// Send notifications for all matching searches
		if (matchingSearches.length > 0) {
			await ctx.runMutation(internal.notifications.sendPropertyMatchNotifications, {
				propertyId,
				property,
				matchingSearches,
			})
		}

		return null
	},
})

// Helper function to check if property matches search criteria
function doesPropertyMatchSearch(property: MatchableProperty, search: Doc<"savedSearches">): boolean {
	// Support new nested criteria as well as legacy flat fields
	const criteria = (search as any).criteria ?? {
		city: (search as any).city,
		country: (search as any).country,
		propertyType: (search as any).propertyType,
		minPrice: (search as any).minPrice,
		maxPrice: (search as any).maxPrice,
		bedrooms: (search as any).bedrooms,
		bathrooms: (search as any).bathrooms,
		amenities: (search as any).amenities,
		petFriendly: (search as any).petFriendly,
		furnished: (search as any).furnished,
	}

	// City match (required)
	if (property.address.city.toLowerCase() !== String(criteria.city).toLowerCase()) {
		return false
	}

	// Country match (required)
	if (property.address.country !== criteria.country) {
		return false
	}

	// Property type match (if specified)
	if (criteria.propertyType && property.propertyType !== criteria.propertyType) {
		return false
	}

	// Price range match
	const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
	if (criteria.minPrice && rent < criteria.minPrice) return false
	if (criteria.maxPrice && rent > criteria.maxPrice) return false

	// Bedroom match
	if (criteria.bedrooms !== undefined && property.rooms.bedrooms !== criteria.bedrooms) {
		return false
	}

	// Bathroom match
	if (criteria.bathrooms !== undefined && property.rooms.bathrooms < criteria.bathrooms) {
		return false
	}

	// Boolean filters
	if (criteria.furnished === true && !property.furnished) return false
	if (criteria.petFriendly === true && !property.petFriendly) return false

	// Amenities match (property must have all required amenities)
	if (criteria.amenities && criteria.amenities.length > 0) {
		const propertyAmenities = property.amenities || []
		const hasAllAmenities = (criteria.amenities as string[]).every((amenity: string) =>
			propertyAmenities.includes(amenity),
		)
		if (!hasAllAmenities) return false
	}

	return true
}

// Send notifications for property matches
export const sendPropertyMatchNotifications = internalMutation({
	args: {
		propertyId: v.id("properties"),
		property: v.any(), // Property data
		matchingSearches: v.array(v.any()), // Array of matching saved searches
	},
	returns: v.null(),
	handler: async (ctx, { propertyId, property, matchingSearches }) => {
		// Group by user to send one email per user (even if multiple searches match)
		const userNotifications = new Map<
			string,
			{ user: Doc<"users"> | null; searches: Doc<"savedSearches">[]; properties: MatchableProperty[] }
		>()

		const p = property as MatchableProperty
		const searches = matchingSearches as Doc<"savedSearches">[]

		for (const search of searches) {
			if (!userNotifications.has(search.userId)) {
				const user = await ctx.db.get(search.userId as Id<"users">)
				userNotifications.set(search.userId, {
					user,
					searches: [],
					properties: [],
				})
			}

			userNotifications.get(search.userId)!.searches.push(search)
			userNotifications.get(search.userId)!.properties.push(p)
		}

		// Send notifications
		for (const [, notification] of userNotifications) {
			if (notification.user?.email && notification.searches.length > 0) {
				// Fetch the full property document for the email
				const fullProperty = await ctx.db.get(propertyId)
				if (!fullProperty) {
					console.error("Property not found for notification:", propertyId)
					continue
				}

				// Send email notification
				await sendPropertyMatchEmail({
					to: notification.user.email,
					userName: notification.user.email.split("@")[0], // Simple name extraction
					searches: notification.searches,
					property: fullProperty,
				})

				// Update last notification timestamp for all matching searches
				const now = Date.now()
				for (const search of notification.searches) {
					await ctx.db.patch(search._id, {
						lastNotificationSent: now,
					})
				}
			}
		}

		return null
	},
})

// Send property match email
async function sendPropertyMatchEmail({
	to,
	userName,
	searches,
	property,
}: {
	to: string
	userName: string
	searches: Doc<"savedSearches">[]
	property: Doc<"properties">
}) {
	const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
	const searchNames = searches.map((s) => s.name).join(", ")

	const subject = `New Property Match: ${property.title}`

	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2563eb;">🏠 New Property Match!</h2>
			
			<p>Hi ${userName},</p>
			
			<p>Great news! We found a new property that matches your saved search${searches.length > 1 ? "es" : ""}: <strong>${searchNames}</strong></p>
			
			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f9fafb;">
				<h3 style="margin-top: 0; color: #1f2937;">${property.title}</h3>
				<p style="color: #6b7280; margin: 5px 0;">📍 ${property.address.city}, ${property.address.country}</p>
				<p style="color: #6b7280; margin: 5px 0;">🛏️ ${property.rooms.bedrooms} bed • 🛁 ${property.rooms.bathrooms} bath</p>
				<p style="font-size: 18px; font-weight: bold; color: #059669; margin: 10px 0;">€${rent.toLocaleString()}/month</p>
				
				${
					property.amenities && property.amenities.length > 0
						? `
					<p style="color: #6b7280; margin: 10px 0;">
						<strong>Amenities:</strong> ${property.amenities.join(", ")}
					</p>
				`
						: ""
				}
			</div>
			
			<div style="text-align: center; margin: 30px 0;">
				<a href="${process.env.SITE_URL}/property/${property._id}" 
				   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
					View Property Details
				</a>
			</div>
			
			<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
			
			<p style="color: #6b7280; font-size: 14px;">
				You're receiving this because you have notifications enabled for your saved searches. 
				<a href="${process.env.SITE_URL}/saved" style="color: #2563eb;">Manage your saved searches</a>
			</p>
		</div>
	`

	// TODO: Implement proper email sending using Resend
	console.log(`Would send email to ${to} with subject: ${subject}`)
	console.log(`Email content: ${html.substring(0, 200)}...`)
}
