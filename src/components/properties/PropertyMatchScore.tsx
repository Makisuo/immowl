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
import {
	calculateMatchScore,
	getMatchQuality,
	type UserPreferences,
	type CriteriaWeights,
} from "~/utils/propertyMatching"

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
	const preferences: UserPreferences = {
		maxBudget: (criteria?.maxPrice as number | undefined) ?? null,
		minBudget: (criteria?.minPrice as number | undefined) ?? null,
		desiredBedrooms: (criteria?.bedrooms as number | undefined) ?? null,
		desiredBathrooms: (criteria?.bathrooms as number | undefined) ?? null,
		preferredCity: (criteria?.city as string | undefined) ?? null,
		preferredLatitude: null, // Could be added to saved search in future
		preferredLongitude: null,
		maxDistanceKm: 30, // Default 30km radius
		preferredPropertyType: (criteria?.propertyType as string | undefined) ?? null,
		requiresPetFriendly: criteria?.petFriendly === true,
		prefersFurnished: criteria?.furnished === true,
		desiredAmenities: (criteria?.amenities as string[] | undefined) ?? [],
		minSquareMeters: (criteria?.minSquareMeters as number | undefined) ?? null,
		maxSquareMeters: (criteria?.maxSquareMeters as number | undefined) ?? null,
	}

	// Extract weights from saved search (0-100 integers)
	const rawWeights = (criteria?.weights as any) ?? {}
	const userWeights: Partial<CriteriaWeights> = {
		price: rawWeights.price,
		location: rawWeights.location,
		bedrooms: rawWeights.bedrooms,
		bathrooms: rawWeights.bathrooms,
		propertyType: rawWeights.propertyType,
		petFriendly: rawWeights.petFriendly,
		furnished: rawWeights.furnished,
		amenities: rawWeights.amenities,
		size: rawWeights.size,
	}

	const { isAuthenticated } = useAuth()

	// Calculate match score using the new utility
	const matchScore = calculateMatchScore(property, preferences, userWeights)
	const { overall: overallScore, breakdown } = matchScore

	// Get individual scores for display (use 0 for null scores in UI)
	const priceScore = breakdown.price ?? 0
	const sizeScore = breakdown.size ?? 0
	const bedroomScore = breakdown.bedrooms ?? 0
	const locationScore = breakdown.location ?? 0

	// Determine match quality
	const matchQualityData = getMatchQuality(overallScore)
	const getMatchIcon = (label: string) => {
		if (label === "Excellent Match") return CheckCircle2
		if (label === "Good Match") return TrendingUp
		if (label === "Fair Match") return AlertCircle
		return XCircle
	}
	const MatchIcon = getMatchIcon(matchQualityData.label)

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
					<Badge variant="secondary" className={`${matchQualityData.color} border-0 text-white`}>
						<MatchIcon className="mr-1 h-3 w-3" />
						{matchQualityData.label}
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
									rent <= (preferences.maxBudget ?? Infinity)
										? "text-green-600"
										: "text-orange-600"
								}
							>
								€{rent} / €{preferences.maxBudget ?? "-"}
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
						{preferences.maxBudget != null && rent <= preferences.maxBudget && (
							<Badge variant="outline" className="border-green-200 text-green-600">
								Within Budget
							</Badge>
						)}
						{preferences.desiredBedrooms != null &&
							property.rooms.bedrooms === preferences.desiredBedrooms && (
								<Badge variant="outline" className="border-blue-200 text-blue-600">
									Desired Rooms
								</Badge>
							)}
						{property.furnished && preferences.prefersFurnished && (
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
