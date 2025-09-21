"use client"

import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { type } from "arktype"
import { api } from "convex/_generated/api"
import type { Doc } from "convex/_generated/dataModel"
import {
	AlertCircle,
	Bath,
	Bed,
	Bookmark,
	ChevronLeft,
	ChevronRight,
	Heart,
	Loader2,
	MapPin,
	Search,
	Square,
	X,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { AnimatedGroup } from "~/components/ui/animated-group"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Slider } from "~/components/ui/slider"

const savedSchema = type({
	"propertyType?": "'apartment' | 'house' | 'condo' | 'townhouse' | 'studio'",
	sortBy: "'date-saved' | 'price-low' | 'price-high' | 'newest' = 'date-saved'",
	"city?": "string",
	"minPrice?": "number",
	"maxPrice?": "number",
})

export const Route = createFileRoute("/_app/_authed/saved")({
	component: RouteComponent,
	validateSearch: savedSchema,
})

function RouteComponent() {
	const searchParams = Route.useSearch()
	const navigate = Route.useNavigate()

	// Filter states
	const [priceRange, setPriceRange] = useState<[number, number]>([
		searchParams.minPrice ?? 0,
		searchParams.maxPrice ?? 5000,
	])
	const [cityFilter, setCityFilter] = useState(searchParams.city ?? "")
	const [propertyTypeFilter, setPropertyTypeFilter] = useState<string | undefined>(searchParams.propertyType)
	const [sortBy, setSortBy] = useState(searchParams.sortBy)

	// Update URL params when filters change
	const updateFilters = (newFilters: Partial<typeof searchParams>) => {
		navigate({
			search: {
				...searchParams,
				...newFilters,
				// Clear price filters if they're at default values
				minPrice: newFilters.minPrice === 0 ? undefined : newFilters.minPrice,
				maxPrice: newFilters.maxPrice === 5000 ? undefined : newFilters.maxPrice,
				// Clear other filters if they're empty/default
				city: newFilters.city === "" ? undefined : newFilters.city,
				propertyType: newFilters.propertyType,
			},
		})
	}

	// Apply filters when user stops interacting
	const applyPriceFilter = () => {
		updateFilters({
			minPrice: priceRange[0],
			maxPrice: priceRange[1],
		})
	}

	const applyCityFilter = () => {
		updateFilters({ city: cityFilter })
	}

	// Use infinite query for saved properties
	const query = useSuspenseQuery(
		convexQuery(api.savedProperties.listSavedProperties, {
			propertyType: searchParams.propertyType,
			city: searchParams.city,
			minPrice: searchParams.minPrice,
			maxPrice: searchParams.maxPrice,
			sortBy: sortBy,
		}),
	)

	const { data: totalCount } = useQuery(convexQuery(api.savedProperties.getSavedCount, {}))

	type SavedPropertyWithDate = {
		property: Doc<"properties">
		savedDate: number
	}

	const propertiesWithDate = (query.data || []) as SavedPropertyWithDate[]
	const isLoading = query.isLoading
	const hasError = false

	const getActiveFiltersCount = () => {
		let count = 0
		if (searchParams.minPrice !== undefined && searchParams.minPrice > 0) count++
		if (searchParams.maxPrice !== undefined && searchParams.maxPrice < 5000) count++
		if (searchParams.city) count++
		if (searchParams.propertyType) count++
		return count
	}

	const clearFilters = () => {
		setPriceRange([0, 5000])
		setCityFilter("")
		setPropertyTypeFilter(undefined)
		updateFilters({
			minPrice: undefined,
			maxPrice: undefined,
			city: undefined,
			propertyType: undefined,
		})
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
						<div className="flex items-center gap-2">
							<Bookmark className="h-6 w-6 text-blue-600" />
							<h1 className="font-semibold text-foreground text-xl sm:text-2xl">
								Saved Properties
							</h1>
						</div>
						<span className="text-muted-foreground text-sm">
							{isLoading ? "Loading..." : `${totalCount || 0} saved`}
						</span>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
					{/* Property Type Filter */}
					<div className="flex items-center gap-2">
						<Label className="font-medium text-sm">Type:</Label>
						<Select
							value={propertyTypeFilter ?? "all"}
							onValueChange={(value) => {
								const newValue = value === "all" ? undefined : value
								setPropertyTypeFilter(newValue as any)
								updateFilters({
									propertyType: newValue as any,
								})
							}}
						>
							<SelectTrigger className="w-32 sm:w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="apartment">Apartment</SelectItem>
								<SelectItem value="house">House</SelectItem>
								<SelectItem value="condo">Condo</SelectItem>
								<SelectItem value="townhouse">Townhouse</SelectItem>
								<SelectItem value="studio">Studio</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* City Filter */}
					<div className="flex items-center gap-2">
						<Label className="font-medium text-sm">City:</Label>
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Enter city..."
								value={cityFilter}
								onChange={(e) => setCityFilter(e.target.value)}
								onBlur={applyCityFilter}
								onKeyDown={(e) => e.key === "Enter" && applyCityFilter()}
								className="w-36 pl-10 sm:w-48"
							/>
							{cityFilter && (
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6"
									onClick={() => {
										setCityFilter("")
										updateFilters({ city: undefined })
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							)}
						</div>
					</div>

					{/* Sort Filter */}
					<div className="flex items-center gap-2">
						<Label className="font-medium text-sm">Sort by:</Label>
						<Select
							value={sortBy}
							onValueChange={(value) => {
								setSortBy(value as any)
								updateFilters({ sortBy: value as any })
							}}
						>
							<SelectTrigger className="w-40 sm:w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date-saved">Date Saved</SelectItem>
								<SelectItem value="price-low">Price: Low to High</SelectItem>
								<SelectItem value="price-high">Price: High to Low</SelectItem>
								<SelectItem value="newest">Newest First</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{getActiveFiltersCount() > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={clearFilters}
							className="w-full sm:w-auto"
						>
							Clear Filters ({getActiveFiltersCount()})
						</Button>
					)}
				</div>

				{/* Price Range Filter */}
				<Card className="p-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label className="font-medium text-sm">Price Range</Label>
							<Button
								variant="ghost"
								size="sm"
								onClick={applyPriceFilter}
								className="text-xs underline"
							>
								Apply
							</Button>
						</div>
						<div className="px-2">
							<Slider
								value={priceRange}
								onValueChange={(value) => setPriceRange(value as [number, number])}
								max={5000}
								min={0}
								step={100}
								className="w-full"
							/>
						</div>
						<div className="flex items-center justify-between text-muted-foreground text-sm">
							<span>${priceRange[0].toLocaleString()}</span>
							<span>${priceRange[1].toLocaleString()}+</span>
						</div>
					</div>
				</Card>
			</div>

			{/* Properties Grid */}
			<main className="w-full">
				{hasError ? (
					<ErrorState error={new Error("Failed to load saved properties")} />
				) : isLoading ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
						{[...Array(8)].map((_, index) => (
							<PropertyCardSkeleton key={`skeleton-${index}`} />
						))}
					</div>
				) : propertiesWithDate.length === 0 ? (
					<EmptyState />
				) : (
					<AnimatedGroup
						preset="blur-slide"
						className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
						variants={{
							container: {
								visible: {
									transition: {
										staggerChildren: 0.08,
										delayChildren: 0.1,
									},
								},
							},
							item: {
								hidden: {
									opacity: 0,
									y: 30,
									filter: "blur(8px)",
								},
								visible: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
									transition: {
										duration: 0.5,
										ease: "easeOut",
									},
								},
							},
						}}
					>
						{propertiesWithDate.map((item) => (
							<PropertyCard key={item.property._id} property={item.property} savedDate={item.savedDate} />
						))}
					</AnimatedGroup>
				)}
			</main>
		</div>
	)
}

function PropertyCard({ property, savedDate }: { property: Doc<"properties">; savedDate: number }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isUnsaving, setIsUnsaving] = useState(false)

	const toggleSaveMutationFn = useConvexMutation(api.savedProperties.toggleSaveProperty)
	const toggleSave = useMutation({
		mutationFn: toggleSaveMutationFn,
		onSuccess: () => {
			// The query will automatically update due to Convex reactivity
		},
		onError: (error) => {
			console.error("Failed to unsave property:", error)
			// You could add a toast notification here
		},
	})

	const handleUnsave = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		setIsUnsaving(true)
		try {
			await toggleSave.mutateAsync({ propertyId: property._id })
		} catch (error) {
			console.error("Failed to unsave property:", error)
			// Error is already handled by onError callback
		} finally {
			setIsUnsaving(false)
		}
	}

	const currentImage = property.imageUrls?.[currentImageIndex]
	const hasMultipleImages = (property.imageUrls?.length || 0) > 1

	// Format property data for display
	const propertyTypeLabel = property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
	const sqft = Math.round(property.squareMeters * 10.764)
	const savedDateStr = new Date(savedDate).toLocaleDateString()

	return (
		<motion.div
			whileHover={{
				scale: 1.02,
				transition: { duration: 0.2 },
			}}
			layout
		>
			<Link to="/property/$propertyId" params={{ propertyId: property._id }} className="block">
				<Card className="group h-full cursor-pointer overflow-hidden border-0 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
					<div className="relative">
						<img
							src={currentImage || "/placeholder.svg"}
							alt={property.title}
							className="h-40 w-full object-cover transition-transform duration-300 sm:h-48"
						/>

						{/* Navigation arrows for multiple images */}
						{hasMultipleImages && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 left-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										const newIndex =
											currentImageIndex === 0
												? (property.imageUrls?.length || 1) - 1
												: currentImageIndex - 1
										setCurrentImageIndex(newIndex)
									}}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										const newIndex =
											currentImageIndex === (property.imageUrls?.length || 1) - 1
												? 0
												: currentImageIndex + 1
										setCurrentImageIndex(newIndex)
									}}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</>
						)}

						{/* Image counter */}
						{hasMultipleImages && (
							<div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
								{currentImageIndex + 1} / {property.imageUrls?.length || 0}
							</div>
						)}

						{/* Property type badge */}
						<Badge
							variant="secondary"
							className="absolute top-2 left-2 bg-white/90 text-gray-800"
						>
							{propertyTypeLabel}
						</Badge>

						{/* Unsave button */}
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:bg-white"
								onClick={handleUnsave}
								disabled={isUnsaving}
							>
								{isUnsaving ? (
									<Loader2 className="h-4 w-4 animate-spin text-gray-600" />
								) : (
									<motion.div
										initial={{ scale: 1 }}
										animate={{ scale: isUnsaving ? 0.8 : 1 }}
										transition={{ duration: 0.2 }}
									>
										<Heart className="h-4 w-4 fill-red-500 text-red-500" />
									</motion.div>
								)}
							</Button>
						</motion.div>
					</div>

					<CardContent className="space-y-3 p-4">
						<div className="space-y-1">
							<h3 className="line-clamp-2 font-medium text-foreground leading-tight dark:text-white">
								{property.title}
							</h3>
							<div className="flex items-center gap-1 text-muted-foreground text-sm">
								<MapPin className="h-3 w-3" />
								{property.address}, {property.city}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm sm:gap-4">
							<div className="flex items-center gap-1">
								<Bed className="h-4 w-4" />
								<span className="hidden sm:inline">
									{property.rooms.bedrooms === 0
										? "Studio"
										: `${property.rooms.bedrooms} bed`}
								</span>
								<span className="sm:hidden">
									{property.rooms.bedrooms === 0 ? "Studio" : property.rooms.bedrooms}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Bath className="h-4 w-4" />
								<span className="hidden sm:inline">{property.rooms.bathrooms} bath</span>
								<span className="sm:hidden">{property.rooms.bathrooms}</span>
							</div>
							<div className="flex items-center gap-1">
								<Square className="h-4 w-4" />
								<span className="hidden sm:inline">{sqft} sqft</span>
								<span className="sm:hidden">{sqft}</span>
							</div>
						</div>

						<div className="flex items-center justify-between pt-1">
							<div>
								<span className="font-semibold text-foreground text-lg dark:text-white">
									${property.monthlyRent.toLocaleString()}
								</span>
								<span className="text-muted-foreground text-sm"> / month</span>
							</div>
						</div>

						<div className="text-muted-foreground text-xs">Saved on {savedDateStr}</div>
					</CardContent>
				</Card>
			</Link>
		</motion.div>
	)
}

function PropertyCardSkeleton() {
	return (
		<Card className="h-full overflow-hidden border-0 bg-white p-0 shadow-sm dark:bg-gray-800">
			<div className="relative">
				<Skeleton className="h-40 w-full rounded-none sm:h-48" />
				<div className="absolute bottom-2 left-2">
					<Skeleton className="h-4 w-8 rounded" />
				</div>
				<div className="absolute top-2 left-2">
					<Skeleton className="h-6 w-16 rounded-full" />
				</div>
				<div className="absolute top-2 right-2">
					<Skeleton className="h-9 w-9 rounded-full" />
				</div>
			</div>
			<CardContent className="space-y-3 p-4">
				<div className="space-y-1">
					<Skeleton className="h-5 w-3/4" />
					<div className="flex items-center gap-1">
						<Skeleton className="h-3 w-3 rounded-full" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>
				<div className="flex items-center justify-between pt-1">
					<div>
						<Skeleton className="inline h-6 w-16" />
						<Skeleton className="ml-1 inline h-4 w-12" />
					</div>
				</div>
				<Skeleton className="h-3 w-24" />
			</CardContent>
		</Card>
	)
}

function EmptyState() {
	return (
		<motion.div
			className="flex flex-col items-center justify-center py-16 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
				<Bookmark className="h-12 w-12 text-blue-500" />
			</div>
			<h3 className="mb-2 font-semibold text-foreground text-xl">No saved properties yet</h3>
			<p className="mb-6 max-w-md text-muted-foreground">
				Start exploring properties and save your favorites to see them here. Use the heart icon on any
				property to add it to your saved list.
			</p>
			<Link to="/search">
				<Button>
					<Search className="mr-2 h-4 w-4" />
					Browse Properties
				</Button>
			</Link>
		</motion.div>
	)
}

function ErrorState({ error }: { error: any }) {
	return (
		<motion.div
			className="flex flex-col items-center justify-center py-16 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="mb-4 rounded-full bg-red-50 p-4 dark:bg-red-900/20">
				<AlertCircle className="h-12 w-12 text-red-500" />
			</div>
			<h3 className="mb-2 font-semibold text-foreground text-xl">Something went wrong</h3>
			<p className="mb-6 max-w-md text-muted-foreground">
				We're having trouble loading your saved properties. Please try refreshing the page or check
				your connection.
			</p>
			{error && (
				<details className="mb-4 text-muted-foreground text-sm">
					<summary className="cursor-pointer">Technical details</summary>
					<pre className="mt-2 max-w-lg overflow-auto rounded bg-gray-100 p-2 text-left text-xs dark:bg-gray-800">
						{error.toString()}
					</pre>
				</details>
			)}
			<Button onClick={() => window.location.reload()}>Try Again</Button>
		</motion.div>
	)
}
