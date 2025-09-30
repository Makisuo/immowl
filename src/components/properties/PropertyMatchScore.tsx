import type { Doc } from "convex/_generated/dataModel"
import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
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

export function PropertyMatchScore({ property }: PropertyMatchScoreProps) {
	// Fetch user's first saved search (single profile model)
	const { data: savedSearchData } = useQuery(
		convexQuery(api.savedSearches.listUserSavedSearches, {
			paginationOpts: { numItems: 1, cursor: null },
		}),
	)

	const saved = savedSearchData?.page?.[0] as any | undefined
	const criteria =
		saved?.criteria ??
		(saved
			? {
					city: (saved as any).city,
					country: (saved as any).country,
					propertyType: (saved as any).propertyType,
					minPrice: (saved as any).minPrice,
					maxPrice: (saved as any).maxPrice,
					bedrooms: (saved as any).bedrooms,
					bathrooms: (saved as any).bathrooms,
					amenities: (saved as any).amenities,
					petFriendly: (saved as any).petFriendly,
					furnished: (saved as any).furnished,
				}
			: undefined)

	// Derived preferences used by scoring functions
	const prefs = {
		maxBudget: (criteria?.maxPrice as number | undefined) ?? null,
		minBudget: (criteria?.minPrice as number | undefined) ?? null,
		desiredBedrooms: (criteria?.bedrooms as number | undefined) ?? null,
		desiredBathrooms: (criteria?.bathrooms as number | undefined) ?? null,
		preferredCity: (criteria?.city as string | undefined) ?? null,
		preferredPropertyType: (criteria?.propertyType as string | undefined) ?? null,
		requiresPetFriendly: criteria?.petFriendly === true,
		prefersFurnished: criteria?.furnished === true,
		desiredAmenities: (criteria?.amenities as string[] | undefined) ?? [],
		minSquareMeters: (criteria?.minSquareMeters as number | undefined) ?? null,
		maxSquareMeters: (criteria?.maxSquareMeters as number | undefined) ?? null,
	}

	// Extract weights from saved search (0-100 integers)
	const rawWeights = (criteria?.weights as any) ?? {}
	const { isAuthenticated } = useAuth()

	// Calculate individual scores
	const calculatePriceScore = () => {
		const rent = property.monthlyRent.warm || property.monthlyRent.cold || 0
		if (rent === 0) return 0
		if (!prefs.maxBudget) return 70 // Neutral score when no budget specified
		if (rent <= prefs.maxBudget) {
			// Perfect if under budget, scale down as it approaches budget
			return Math.min(100, 100 - (rent / prefs.maxBudget - 0.7) * 100)
		}
		// Over budget - reduce score proportionally
		const overBudgetPercent = ((rent - prefs.maxBudget) / prefs.maxBudget) * 100
		return Math.max(0, 100 - overBudgetPercent * 2)
	}

	const calculateSizeScore = () => {
		const size = property.squareMeters
		const minSM = prefs.minSquareMeters
		const maxSM = prefs.maxSquareMeters

		// If no size preferences, neutral score
		if (minSM == null && maxSM == null) return 70

		// Only min specified
		if (minSM != null && maxSM == null) {
			if (size >= minSM) return 100
			const deficit = minSM - size
			return Math.max(0, 100 - (deficit / Math.max(1, minSM)) * 100)
		}

		// Only max specified
		if (minSM == null && maxSM != null) {
			if (size <= maxSM) return 100
			const excess = size - maxSM
			return Math.max(50, 100 - (excess / Math.max(1, maxSM)) * 50)
		}

		// Both specified
		if (minSM != null && maxSM != null) {
			if (size >= minSM && size <= maxSM) return 100
			if (size < minSM) {
				const deficit = minSM - size
				return Math.max(0, 100 - (deficit / Math.max(1, minSM)) * 100)
			}
			if (size > maxSM) {
				const excess = size - maxSM
				return Math.max(50, 100 - (excess / Math.max(1, maxSM)) * 50)
			}
		}

		return 70
	}

	const calculateBedroomScore = () => {
		const bedrooms = property.rooms.bedrooms
		const desired = prefs.desiredBedrooms
		if (desired == null) return 70 // Neutral when not specified
		if (bedrooms === desired) return 100
		if (bedrooms > desired) return 80 // More rooms is often acceptable
		// Fewer than desired
		return bedrooms === 0 ? 40 : 60
	}

	const calculateBathroomScore = () => {
		const bathrooms = property.rooms.bathrooms
		const desired = prefs.desiredBathrooms
		if (desired == null) return 70 // Neutral when not specified
		if (bathrooms >= desired) return 100 // More is fine
		// Fewer than desired
		const deficit = desired - bathrooms
		return Math.max(40, 100 - deficit * 30)
	}

	const calculateLocationScore = () => {
		const city = property.address.city
		if (prefs.preferredCity && prefs.preferredCity === city) {
			return 100
		}
		// Could enhance with distance calculation in real implementation
		return 60
	}

	const calculatePropertyTypeScore = () => {
		if (!prefs.preferredPropertyType) return 70 // Neutral when not specified
		if (property.propertyType === prefs.preferredPropertyType) return 100
		return 50 // Mismatch
	}

	const calculatePetFriendlyScore = () => {
		if (!prefs.requiresPetFriendly) return 70 // Neutral when not required
		if (property.petFriendly) return 100
		return 0 // Required but not available
	}

	const calculateFurnishedScore = () => {
		if (!prefs.prefersFurnished) return 70 // Neutral when not preferred
		if (property.furnished) return 100
		return 50 // Preferred but not available
	}

	const calculateAmenitiesScore = () => {
		let score = 70 // Base score

		// Only count amenity overlap (pet/furnished handled separately)
		if (prefs.desiredAmenities.length > 0 && property.amenities && property.amenities.length > 0) {
			const matches = property.amenities.filter((a) => prefs.desiredAmenities.includes(a)).length
			const matchRate = matches / prefs.desiredAmenities.length
			score = 70 + matchRate * 30 // Scale from 70 to 100 based on match rate
		}

		return Math.min(100, Math.max(0, score))
	}

	// Calculate all scores
	const priceScore = calculatePriceScore()
	const sizeScore = calculateSizeScore()
	const bedroomScore = calculateBedroomScore()
	const bathroomScore = calculateBathroomScore()
	const locationScore = calculateLocationScore()
	const propertyTypeScore = calculatePropertyTypeScore()
	const petFriendlyScore = calculatePetFriendlyScore()
	const furnishedScore = calculateFurnishedScore()
	const amenitiesScore = calculateAmenitiesScore()

	// Build weight map with user weights or defaults
	const weightMap: Record<string, number> = {
		price: rawWeights.price ?? 35,
		location: rawWeights.location ?? 15,
		bedrooms: rawWeights.bedrooms ?? 20,
		bathrooms: rawWeights.bathrooms ?? 10,
		propertyType: rawWeights.propertyType ?? 5,
		petFriendly: rawWeights.petFriendly ?? 5,
		furnished: rawWeights.furnished ?? 5,
		amenities: rawWeights.amenities ?? 5,
	}

	// Add size weight only if size criteria is set
	if (prefs.minSquareMeters != null || prefs.maxSquareMeters != null) {
		weightMap.size = 15
	}

	// Normalize weights to sum to 1
	const totalWeight = Object.values(weightMap).reduce((sum, w) => sum + w, 0)
	const normalizedWeights: Record<string, number> = {}
	for (const [key, weight] of Object.entries(weightMap)) {
		normalizedWeights[key] = totalWeight > 0 ? weight / totalWeight : 0
	}

	// Calculate weighted overall score
	const scoreMap: Record<string, number> = {
		price: priceScore,
		location: locationScore,
		bedrooms: bedroomScore,
		bathrooms: bathroomScore,
		propertyType: propertyTypeScore,
		petFriendly: petFriendlyScore,
		furnished: furnishedScore,
		amenities: amenitiesScore,
	}
	if (weightMap.size) {
		scoreMap.size = sizeScore
	}

	let overallScore = 0
	for (const [key, score] of Object.entries(scoreMap)) {
		overallScore += score * (normalizedWeights[key] ?? 0)
	}
	overallScore = Math.round(overallScore)

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
					<div className="space-y-4 px-6 text-center">
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
					<Badge variant="secondary" className={`${matchQuality.color} border-0 text-white`}>
						<MatchIcon className="mr-1 h-3 w-3" />
						{matchQuality.label}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Overall Score */}
				<div>
					<div className="mb-2 flex items-center justify-between">
						<span className="font-bold text-2xl">{overallScore}%</span>
						<span className="text-muted-foreground text-sm">Overall Match</span>
					</div>
					<Progress value={overallScore} className="h-3" />
				</div>

				{/* Breakdown */}
				<div className="space-y-3 border-t pt-2">
					{/* Price */}
					<div className="space-y-1">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5">
								<DollarSign className="h-3.5 w-3.5" />
								Price
							</span>
							<span
								className={
									rent <= (prefs.maxBudget ?? Infinity)
										? "text-green-600"
										: "text-orange-600"
								}
							>
								${rent} / ${prefs.maxBudget ?? "-"}
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
				<div className="border-t pt-2">
					<div className="flex flex-wrap gap-1.5">
						{prefs.maxBudget != null && rent <= prefs.maxBudget && (
							<Badge variant="outline" className="border-green-200 text-green-600">
								Within Budget
							</Badge>
						)}
						{prefs.desiredBedrooms != null &&
							property.rooms.bedrooms === prefs.desiredBedrooms && (
								<Badge variant="outline" className="border-blue-200 text-blue-600">
									Desired Rooms
								</Badge>
							)}
						{property.furnished && prefs.prefersFurnished && (
							<Badge variant="outline" className="border-purple-200 text-purple-600">
								Furnished
							</Badge>
						)}
						{(!property.availableFrom || property.availableFrom <= Date.now()) && (
							<Badge variant="outline" className="border-green-200 text-green-600">
								Available Now
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
