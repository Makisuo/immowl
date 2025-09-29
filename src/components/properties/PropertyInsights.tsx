import type { Doc } from "convex/_generated/dataModel"
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Heart,
	Home,
	MapPin,
	Sparkles,
	TrendingUp,
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
	formatAmenityDistance,
	formatLastUpdated,
	getAmenityDisplayName,
	getAmenityIcon,
	getPriorityAmenityCategories,
} from "~/utils/amenities"

interface PropertyInsightsProps {
	property: Doc<"properties">
}

export function PropertyInsights({ property }: PropertyInsightsProps) {
	const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
	const pricePerSqM = rent / property.squareMeters

	// Mock market average for Berlin/Munich/Hamburg
	const marketAvgPerSqM =
		property.address.city === "Berlin"
			? 18
			: property.address.city === "Munich"
				? 22
				: property.address.city === "Hamburg"
					? 19
					: 16

	const priceComparison = (((pricePerSqM - marketAvgPerSqM) / marketAvgPerSqM) * 100).toFixed(0)
	const isGoodDeal = Number(priceComparison) <= 0

	// Calculate availability
	const getAvailabilityStatus = () => {
		if (!property.availableFrom || property.availableFrom <= Date.now()) {
			return { label: "Available Now", color: "text-green-600", icon: CheckCircle }
		}
		const daysUntil = Math.ceil((property.availableFrom - Date.now()) / (1000 * 60 * 60 * 24))
		if (daysUntil <= 30) {
			return { label: `Available in ${daysUntil} days`, color: "text-blue-600", icon: Clock }
		}
		return {
			label: `Available from ${new Date(property.availableFrom).toLocaleDateString()}`,
			color: "text-orange-600",
			icon: Calendar,
		}
	}

	const availability = getAvailabilityStatus()
	const AvailabilityIcon = availability.icon

	// Generate insights based on property features
	const insights = []

	// Price insight
	if (isGoodDeal) {
		insights.push({
			icon: TrendingUp,
			label: "Good Value",
			description: `${Math.abs(Number(priceComparison))}% below market average`,
			color: "text-green-600",
		})
	} else if (Number(priceComparison) > 20) {
		insights.push({
			icon: AlertCircle,
			label: "Above Market",
			description: `${priceComparison}% above average for the area`,
			color: "text-orange-600",
		})
	}

	// Size insight
	if (property.squareMeters > 80) {
		insights.push({
			icon: Home,
			label: "Spacious",
			description: `${property.squareMeters}m² - Great for families or roommates`,
			color: "text-blue-600",
		})
	} else if (property.squareMeters < 40) {
		insights.push({
			icon: Sparkles,
			label: "Compact Living",
			description: "Perfect for minimalists or single professionals",
			color: "text-purple-600",
		})
	}

	// Location insights (mock data)
	if (["Berlin", "Munich", "Hamburg"].includes(property.address.city)) {
		insights.push({
			icon: MapPin,
			label: "Major City",
			description: "Access to extensive public transport and amenities",
			color: "text-blue-600",
		})
	}

	// Amenities insights
	if (property.furnished) {
		insights.push({
			icon: Heart,
			label: "Move-in Ready",
			description: "Fully furnished - no need to buy furniture",
			color: "text-purple-600",
		})
	}

	if (property.petFriendly) {
		insights.push({
			icon: Heart,
			label: "Pet Friendly",
			description: "Your furry friends are welcome",
			color: "text-green-600",
		})
	}

	// Get real neighborhood amenities from OpenStreetMap data
	const nearbyAmenities = property.nearbyAmenities
	const hasAmenityData = nearbyAmenities !== undefined

	// Filter and format amenity data for display
	const neighborhoodFeatures = hasAmenityData
		? getPriorityAmenityCategories()
				.map((category) => {
					const amenityData = nearbyAmenities[category as keyof typeof nearbyAmenities]
					if (!amenityData || typeof amenityData === "number") return null

					const { count, closest } = amenityData as {
						count: number
						closest?: { name?: string; distance: number; amenityType: string }
					}

					if (count === 0) return null

					return {
						icon: getAmenityIcon(category),
						label: getAmenityDisplayName(category),
						distance: closest ? formatAmenityDistance(closest.distance) : undefined,
						count,
						closestName: closest?.name,
					}
				})
				.filter(Boolean)
				.slice(0, 8) // Show top 8 amenities
		: []

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Property Insights</CardTitle>
					<div className={`flex items-center gap-1.5 ${availability.color}`}>
						<AvailabilityIcon className="h-4 w-4" />
						<span className="font-medium text-sm">{availability.label}</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Key Insights */}
				<div className="space-y-3">
					{insights.slice(0, 4).map((insight, index) => {
						const Icon = insight.icon
						return (
							<div key={index} className="flex gap-3">
								<div className={`mt-0.5 ${insight.color}`}>
									<Icon className="h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm">{insight.label}</p>
									<p className="text-muted-foreground text-xs">{insight.description}</p>
								</div>
							</div>
						)
					})}
				</div>

				{/* Market Comparison */}
				<div className="space-y-2 rounded-lg bg-muted/50 p-3">
					<p className="font-medium text-sm">Market Comparison</p>
					<div className="flex items-baseline justify-between">
						<span className="text-muted-foreground text-xs">€{pricePerSqM.toFixed(2)}/m²</span>
						<Badge
							variant={isGoodDeal ? "default" : "secondary"}
							className={isGoodDeal ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
						>
							{isGoodDeal ? "Below" : "Above"} Market ({Math.abs(Number(priceComparison))}%)
						</Badge>
					</div>
				</div>

				{/* Neighborhood Amenities - only show if data exists */}
				{hasAmenityData && (
					<div className="border-t pt-4">
						<div className="mb-3 flex items-center justify-between">
							<p className="font-medium text-sm">Nearby Amenities</p>
							{nearbyAmenities.lastUpdated && (
								<span className="text-muted-foreground text-xs">
									{formatLastUpdated(nearbyAmenities.lastUpdated)}
								</span>
							)}
						</div>
						{neighborhoodFeatures.length > 0 ? (
							<div className="space-y-2">
								{neighborhoodFeatures.map((feature, index) => {
									if (!feature) return null
									const Icon = feature.icon
									return (
										<div key={index} className="flex items-start gap-2 text-xs">
											<Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
											<div className="min-w-0 flex-1">
												<div className="flex items-baseline justify-between gap-2">
													<span className="font-medium">{feature.label}</span>
													{feature.distance && (
														<span className="whitespace-nowrap text-muted-foreground">
															{feature.distance}
														</span>
													)}
												</div>
												{feature.closestName && (
													<p className="truncate text-muted-foreground">
														{feature.closestName}
													</p>
												)}
												{!feature.closestName && feature.count > 0 && (
													<p className="text-muted-foreground">
														{feature.count} nearby
													</p>
												)}
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<div className="py-4 text-center text-muted-foreground text-xs">
								<MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" />
								<p>No amenities data available</p>
							</div>
						)}
					</div>
				)}

				{/* Quick Stats */}
				<div className="flex justify-around border-t pt-4 text-center">
					<div>
						<p className="font-bold text-lg">{property.rooms.bedrooms || "Studio"}</p>
						<p className="text-muted-foreground text-xs">Bedrooms</p>
					</div>
					<div>
						<p className="font-bold text-lg">{property.rooms.bathrooms}</p>
						<p className="text-muted-foreground text-xs">Bathrooms</p>
					</div>
					<div>
						<p className="font-bold text-lg">{property.squareMeters}</p>
						<p className="text-muted-foreground text-xs">m²</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
