import type { Doc } from "convex/_generated/dataModel"
import { Link } from "@tanstack/react-router"
import { AlertCircle, CheckCircle2, DollarSign, Home, MapPin, Ruler, TrendingUp, XCircle } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { useAuth } from "~/hooks/use-auth"

interface PropertyMatchScoreProps {
	property: Doc<"properties">
}

// Mock user preferences for demonstration
const MOCK_USER_PREFERENCES = {
	maxBudget: 2000,
	minBedrooms: 2,
	maxBedrooms: 3,
	minSquareMeters: 60,
	maxSquareMeters: 80,
	preferredCities: ["Berlin", "Munich", "Hamburg"],
	requiresPetFriendly: false,
	prefersFurnished: true,
}

export function PropertyMatchScore({ property }: PropertyMatchScoreProps) {
	const { isAuthenticated } = useAuth()

	// Calculate individual scores
	const calculatePriceScore = () => {
		const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
		if (rent === 0) return 0
		if (rent <= MOCK_USER_PREFERENCES.maxBudget) {
			// Perfect if under budget, scale down as it approaches budget
			return Math.min(100, 100 - (rent / MOCK_USER_PREFERENCES.maxBudget - 0.7) * 100)
		}
		// Over budget - reduce score proportionally
		const overBudgetPercent =
			((rent - MOCK_USER_PREFERENCES.maxBudget) / MOCK_USER_PREFERENCES.maxBudget) * 100
		return Math.max(0, 100 - overBudgetPercent * 2)
	}

	const calculateSizeScore = () => {
		const size = property.squareMeters
		const { minSquareMeters, maxSquareMeters } = MOCK_USER_PREFERENCES

		if (size >= minSquareMeters && size <= maxSquareMeters) {
			return 100 // Perfect match
		}

		if (size < minSquareMeters) {
			const deficit = minSquareMeters - size
			return Math.max(0, 100 - (deficit / minSquareMeters) * 100)
		}

		if (size > maxSquareMeters) {
			const excess = size - maxSquareMeters
			return Math.max(50, 100 - (excess / maxSquareMeters) * 50) // Less penalty for too big
		}

		return 50
	}

	const calculateBedroomScore = () => {
		const bedrooms = property.rooms.bedrooms
		const { minBedrooms, maxBedrooms } = MOCK_USER_PREFERENCES

		if (bedrooms >= minBedrooms && bedrooms <= maxBedrooms) {
			return 100
		}

		if (bedrooms < minBedrooms) {
			return bedrooms === 0 ? 40 : 70 // Studio gets lower score
		}

		if (bedrooms > maxBedrooms) {
			return 80 // Not bad to have more rooms
		}

		return 50
	}

	const calculateLocationScore = () => {
		const city = property.address.city
		if (MOCK_USER_PREFERENCES.preferredCities.includes(city)) {
			return 100
		}
		// Could enhance with distance calculation in real implementation
		return 60
	}

	const calculateAmenitiesScore = () => {
		let score = 70 // Base score

		if (MOCK_USER_PREFERENCES.prefersFurnished && property.furnished) {
			score += 15
		}

		if (MOCK_USER_PREFERENCES.requiresPetFriendly && !property.petFriendly) {
			score -= 30
		} else if (property.petFriendly) {
			score += 5 // Bonus even if not required
		}

		// Bonus for amenities count
		if (property.amenities && property.amenities.length > 0) {
			score += Math.min(10, property.amenities.length * 2)
		}

		return Math.min(100, Math.max(0, score))
	}

	// Calculate scores
	const priceScore = calculatePriceScore()
	const sizeScore = calculateSizeScore()
	const bedroomScore = calculateBedroomScore()
	const locationScore = calculateLocationScore()
	const amenitiesScore = calculateAmenitiesScore()

	// Calculate overall score (weighted average)
	const overallScore = Math.round(
		priceScore * 0.35 + // Price is most important
			sizeScore * 0.2 +
			bedroomScore * 0.2 +
			locationScore * 0.15 +
			amenitiesScore * 0.1,
	)

	// Determine match quality
	const getMatchQuality = (score: number) => {
		if (score >= 85) return { label: "Excellent Match", color: "bg-green-500", icon: CheckCircle2 }
		if (score >= 70) return { label: "Good Match", color: "bg-blue-500", icon: TrendingUp }
		if (score >= 50) return { label: "Fair Match", color: "bg-yellow-500", icon: AlertCircle }
		return { label: "Poor Match", color: "bg-red-500", icon: XCircle }
	}

	const matchQuality = getMatchQuality(overallScore)
	const MatchIcon = matchQuality.icon

	const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0

	return (
		<Card className="relative overflow-hidden">
			{!isAuthenticated && (
				<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="text-center space-y-4 px-6">
						<p className="font-semibold text-lg">Login to unlock your match score</p>
						<Link to="/sign-in">
							<Button>Sign In</Button>
						</Link>
					</div>
				</div>
			)}
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Match Score</CardTitle>
					<Badge variant="secondary" className={`${matchQuality.color} text-white border-0`}>
						<MatchIcon className="mr-1 h-3 w-3" />
						{matchQuality.label}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Overall Score */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-2xl font-bold">{overallScore}%</span>
						<span className="text-sm text-muted-foreground">Overall Match</span>
					</div>
					<Progress value={overallScore} className="h-3" />
				</div>

				{/* Breakdown */}
				<div className="space-y-3 pt-2 border-t">
					{/* Price */}
					<div className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5">
								<DollarSign className="h-3.5 w-3.5" />
								Price
							</span>
							<span
								className={
									rent <= MOCK_USER_PREFERENCES.maxBudget
										? "text-green-600"
										: "text-orange-600"
								}
							>
								${rent} / ${MOCK_USER_PREFERENCES.maxBudget}
							</span>
						</div>
						<Progress value={priceScore} className="h-1.5" />
					</div>

					{/* Size */}
					<div className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5">
								<Ruler className="h-3.5 w-3.5" />
								Size
							</span>
							<span>{Math.round(property.squareMeters)} m²</span>
						</div>
						<Progress value={sizeScore} className="h-1.5" />
					</div>

					{/* Bedrooms */}
					<div className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5">
								<Home className="h-3.5 w-3.5" />
								Bedrooms
							</span>
							<span>{property.rooms.bedrooms === 0 ? "Studio" : property.rooms.bedrooms}</span>
						</div>
						<Progress value={bedroomScore} className="h-1.5" />
					</div>

					{/* Location */}
					<div className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5">
								<MapPin className="h-3.5 w-3.5" />
								Location
							</span>
							<span>{property.address.city}</span>
						</div>
						<Progress value={locationScore} className="h-1.5" />
					</div>
				</div>

				{/* Quick Insights */}
				<div className="pt-2 border-t">
					<div className="flex flex-wrap gap-1.5">
						{rent <= MOCK_USER_PREFERENCES.maxBudget && (
							<Badge variant="outline" className="text-green-600 border-green-200">
								Within Budget
							</Badge>
						)}
						{property.rooms.bedrooms >= MOCK_USER_PREFERENCES.minBedrooms &&
							property.rooms.bedrooms <= MOCK_USER_PREFERENCES.maxBedrooms && (
								<Badge variant="outline" className="text-blue-600 border-blue-200">
									Ideal Size
								</Badge>
							)}
						{property.furnished && MOCK_USER_PREFERENCES.prefersFurnished && (
							<Badge variant="outline" className="text-purple-600 border-purple-200">
								Furnished
							</Badge>
						)}
						{!property.availableFrom ||
							(property.availableFrom <= Date.now() && (
								<Badge variant="outline" className="text-green-600 border-green-200">
									Available Now
								</Badge>
							))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
