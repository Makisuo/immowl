"use client"

import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import type { Id } from "convex/_generated/dataModel"
import { Bookmark, Search, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { PropertyCard } from "~/components/properties/PropertyCard"
import { EmptyState, ErrorState, LoadingGrid } from "~/components/properties/PropertyStates"
import { AnimatedGroup } from "~/components/ui/animated-group"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Slider } from "~/components/ui/slider"
import type { PropertyType, SavedPropertyWithDate, SortOption } from "~/types/property"
import { DEFAULT_PRICE_RANGE } from "~/types/property"

interface SavedSearchParams {
	propertyType?: PropertyType
	sortBy: SortOption
	city?: string
	minPrice?: number
	maxPrice?: number
}

export const Route = createFileRoute("/_app/_authed/saved")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SavedSearchParams => ({
		propertyType: search.propertyType as PropertyType | undefined,
		sortBy: (search.sortBy as SortOption) || "date-saved",
		city: search.city as string | undefined,
		minPrice: search.minPrice as number | undefined,
		maxPrice: search.maxPrice as number | undefined,
	}),
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
	const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | undefined>(
		searchParams.propertyType,
	)
	const [sortBy, setSortBy] = useState<SortOption>(searchParams.sortBy)

	// Update URL params when filters change
	const updateFilters = useCallback(
		(newFilters: Partial<SavedSearchParams>) => {
			navigate({
				search: {
					...searchParams,
					...newFilters,
					// Clear price filters if they're at default values
					minPrice:
						newFilters.minPrice === DEFAULT_PRICE_RANGE.min ? undefined : newFilters.minPrice,
					maxPrice:
						newFilters.maxPrice === DEFAULT_PRICE_RANGE.max ? undefined : newFilters.maxPrice,
					// Clear other filters if they're empty/default
					city: newFilters.city === "" ? undefined : newFilters.city,
					propertyType: newFilters.propertyType,
				},
			})
		},
		[navigate, searchParams],
	)

	// Apply filters when user stops interacting
	const applyPriceFilter = useCallback(() => {
		updateFilters({
			minPrice: priceRange[0],
			maxPrice: priceRange[1],
		})
	}, [priceRange, updateFilters])

	const applyCityFilter = useCallback(() => {
		updateFilters({ city: cityFilter })
	}, [cityFilter, updateFilters])

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

	const propertiesWithDate = (query.data || []) as SavedPropertyWithDate[]
	const isLoading = query.isLoading
	const hasError = false

	const getActiveFiltersCount = useMemo(() => {
		let count = 0
		if (searchParams.minPrice !== undefined && searchParams.minPrice > DEFAULT_PRICE_RANGE.min) count++
		if (searchParams.maxPrice !== undefined && searchParams.maxPrice < DEFAULT_PRICE_RANGE.max) count++
		if (searchParams.city) count++
		if (searchParams.propertyType) count++
		return count
	}, [searchParams])

	const clearFilters = useCallback(() => {
		setPriceRange([DEFAULT_PRICE_RANGE.min, DEFAULT_PRICE_RANGE.max])
		setCityFilter("")
		setPropertyTypeFilter(undefined)
		updateFilters({
			minPrice: undefined,
			maxPrice: undefined,
			city: undefined,
			propertyType: undefined,
		})
	}, [updateFilters])

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-6">
				{/* Header Skeleton */}
				<div className="mb-8">
					<Skeleton className="mb-2 h-9 w-64" />
					<Skeleton className="h-4 w-32" />
				</div>

				{/* Filters Skeleton */}
				<Card className="mb-8 border-border/40">
					<CardContent className="p-6">
						<div className="mb-6 flex flex-wrap items-center gap-4">
							<Skeleton className="h-10 w-48" />
							<Skeleton className="h-10 w-56" />
							<Skeleton className="h-10 w-60" />
						</div>
						<div className="border-t pt-6">
							<div className="mb-4 flex items-center justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-2 w-full" />
						</div>
					</CardContent>
				</Card>

				{/* Properties Grid Skeleton */}
				<LoadingGrid />
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-semibold text-foreground text-2xl sm:text-3xl">
							Saved Properties
						</h1>
						<p className="text-muted-foreground text-sm">{totalCount || 0} saved properties</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<Card className="mb-8 border-border/40">
				<CardContent className="p-6">
					<div className="mb-6 flex flex-wrap items-center gap-4">
						{/* Property Type Filter */}
						<div className="flex items-center gap-2">
							<Label className="text-muted-foreground text-sm">Type</Label>
							<Select
								value={propertyTypeFilter ?? "all"}
								onValueChange={(value) => {
									const newValue = value === "all" ? undefined : (value as PropertyType)
									setPropertyTypeFilter(newValue)
									updateFilters({
										propertyType: newValue,
									})
								}}
							>
								<SelectTrigger className="w-36 sm:w-40">
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
							<Label className="text-muted-foreground text-sm">City</Label>
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search city..."
									value={cityFilter}
									onChange={(e) => setCityFilter(e.target.value)}
									onBlur={applyCityFilter}
									onKeyDown={(e) => e.key === "Enter" && applyCityFilter()}
									className="w-40 pl-10 sm:w-48"
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
							<Label className="text-muted-foreground text-sm">Sort</Label>
							<Select
								value={sortBy}
								onValueChange={(value) => {
									const newSortBy = value as SortOption
									setSortBy(newSortBy)
									updateFilters({ sortBy: newSortBy })
								}}
							>
								<SelectTrigger className="w-44 sm:w-52">
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

						<div className="flex-1" />

						{getActiveFiltersCount > 0 && (
							<Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
								Clear all ({getActiveFiltersCount})
							</Button>
						)}
					</div>

					{/* Price Range Filter */}
					<div className="border-t pt-6">
						<div className="mb-4 flex items-center justify-between">
							<Label className="text-sm">Price Range</Label>
							<div className="text-muted-foreground text-sm">
								€{priceRange[0].toLocaleString()} - €{priceRange[1].toLocaleString()}
								{priceRange[1] === 5000 && "+"}
							</div>
						</div>
						<Slider
							value={priceRange}
							onValueChange={(value) => setPriceRange(value as [number, number])}
							onValueCommit={(value) =>
								updateFilters({
									minPrice: value[0],
									maxPrice: value[1],
								})
							}
							max={5000}
							min={0}
							step={100}
							className="w-full"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Properties Grid */}
			<PropertiesGrid
				propertiesWithDate={propertiesWithDate}
				isLoading={isLoading}
				hasError={hasError}
			/>
		</div>
	)
}

interface PropertiesGridProps {
	propertiesWithDate: SavedPropertyWithDate[]
	isLoading: boolean
	hasError: boolean
}

function PropertiesGrid({ propertiesWithDate, isLoading, hasError }: PropertiesGridProps) {
	const toggleSaveMutationFn = useConvexMutation(api.savedProperties.toggleSaveProperty)
	const toggleSave = useMutation({
		mutationFn: toggleSaveMutationFn,
	})

	const handleToggleSave = useCallback(
		async (propertyId: Id<"properties">) => {
			await toggleSave.mutateAsync({ propertyId })
		},
		[toggleSave],
	)

	if (hasError) {
		return <ErrorState error={new Error("Failed to load saved properties")} />
	}

	if (isLoading) {
		return <LoadingGrid />
	}

	if (propertiesWithDate.length === 0) {
		return (
			<EmptyState
				title="No saved properties yet"
				description="Start exploring properties and save your favorites to see them here. Use the heart icon on any property to add it to your saved list."
				icon={Bookmark}
			/>
		)
	}

	return (
		<main className="w-full">
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
					<PropertyCard
						key={item.property._id}
						property={item.property}
						savedDate={item.savedDate}
						isSaved={true}
						onToggleSave={handleToggleSave}
					/>
				))}
			</AnimatedGroup>
		</main>
	)
}
