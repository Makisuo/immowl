import type { Doc } from "convex/_generated/dataModel"
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Coffee,
	Heart,
	Home,
	MapPin,
	ShoppingBag,
	Sparkles,
	Train,
	TrendingUp,
	Users,
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface PropertyInsightsProps {
	property: Doc<"properties">
}

export function PropertyInsights({ property }: PropertyInsightsProps) {
	const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
	const squareFeet = Math.round(property.squareMeters * 10.764)
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

	// Mock neighborhood features
	const neighborhoodFeatures = [
		{ icon: Train, label: "U-Bahn", time: "5 min walk" },
		{ icon: Coffee, label: "Cafés", time: "2 min walk" },
		{ icon: ShoppingBag, label: "Supermarket", time: "3 min walk" },
		{ icon: Users, label: "Family Area", time: "Quiet neighborhood" },
	]

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Property Insights</CardTitle>
					<div className={`flex items-center gap-1.5 ${availability.color}`}>
						<AvailabilityIcon className="h-4 w-4" />
						<span className="text-sm font-medium">{availability.label}</span>
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
								<div className="flex-1 min-w-0">
									<p className="font-medium text-sm">{insight.label}</p>
									<p className="text-xs text-muted-foreground">{insight.description}</p>
								</div>
							</div>
						)
					})}
				</div>

				{/* Market Comparison */}
				<div className="rounded-lg bg-muted/50 p-3 space-y-2">
					<p className="font-medium text-sm">Market Comparison</p>
					<div className="flex items-baseline justify-between">
						<span className="text-xs text-muted-foreground">€{pricePerSqM.toFixed(2)}/m²</span>
						<Badge
							variant={isGoodDeal ? "default" : "secondary"}
							className={isGoodDeal ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
						>
							{isGoodDeal ? "Below" : "Above"} Market ({Math.abs(Number(priceComparison))}%)
						</Badge>
					</div>
				</div>

				{/* Neighborhood */}
				<div className="border-t pt-4">
					<p className="font-medium text-sm mb-3">Neighborhood Amenities</p>
					<div className="grid grid-cols-2 gap-2">
						{neighborhoodFeatures.map((feature, index) => {
							const Icon = feature.icon
							return (
								<div key={index} className="flex items-center gap-2 text-xs">
									<Icon className="h-3.5 w-3.5 text-muted-foreground" />
									<span>{feature.label}</span>
									<span className="text-muted-foreground ml-auto">{feature.time}</span>
								</div>
							)
						})}
					</div>
				</div>

				{/* Quick Stats */}
				<div className="border-t pt-4 flex justify-around text-center">
					<div>
						<p className="font-bold text-lg">{property.rooms.bedrooms || "Studio"}</p>
						<p className="text-xs text-muted-foreground">Bedrooms</p>
					</div>
					<div>
						<p className="font-bold text-lg">{property.rooms.bathrooms}</p>
						<p className="text-xs text-muted-foreground">Bathrooms</p>
					</div>
					<div>
						<p className="font-bold text-lg">{squareFeet}</p>
						<p className="text-xs text-muted-foreground">Sq ft</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
