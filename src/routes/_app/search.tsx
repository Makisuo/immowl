import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { api } from "convex/_generated/api"
import { ApartmentGrid } from "~/components/apartment-grid"
import { FilterDropdown } from "~/components/filter-dropdown"
import { useInfiniteQuery } from "~/hooks/use-infinite-query"
import { useSavedSearch } from "~/hooks/use-saved-search"
import { useSearchFilters } from "~/hooks/use-search-params"

const searchSchema = type({
	city: "string = 'Berlin'",
	country: "string = 'DE'",
	"propertyType?": "'apartment' | 'house' | 'condo' | 'townhouse' | 'studio'",
	sortBy: "'price-low' | 'price-high' | 'newest' | 'available' = 'newest'",
	"minPrice?": "number",
	"maxPrice?": "number",
	"bedrooms?": "number",
	"bathrooms?": "number",
	"amenities?": "string[]",
	"petFriendly?": "boolean",
	"furnished?": "boolean",
})

export const Route = createFileRoute("/_app/search")({
	component: RouteComponent,
	validateSearch: searchSchema,
})

function RouteComponent() {
	const { searchParams, uiFilters, updateFilters } = useSearchFilters()
	const { useAutoSave } = useSavedSearch()

	// Automatically save search params to localStorage when they change
	useAutoSave(searchParams)

	// Use infinite query for properties
	// Note: The API currently only supports basic filters
	const { query } = useInfiniteQuery(
		api.properties.listProperties,
		{
			city: searchParams.city,
			country: searchParams.country,
			propertyType: searchParams.propertyType,
			sortBy: searchParams.sortBy,
			// TODO: Add these filters to the backend API
			// minPrice: searchParams.minPrice,
			// maxPrice: searchParams.maxPrice,
			// bedrooms: searchParams.bedrooms,
			// bathrooms: searchParams.bathrooms,
			// amenities: searchParams.amenities,
			// petFriendly: searchParams.petFriendly,
			// furnished: searchParams.furnished,
		},
		{ initialNumItems: 24 },
	)

	const { data: totalCount } = useQuery(
		convexQuery(api.properties.getTotalCount, {
			city: searchParams.city,
			country: searchParams.country,
			propertyType: searchParams.propertyType,
			// TODO: Add these filters to the backend API
			// minPrice: searchParams.minPrice,
			// maxPrice: searchParams.maxPrice,
			// bedrooms: searchParams.bedrooms,
			// bathrooms: searchParams.bathrooms,
			// amenities: searchParams.amenities,
			// petFriendly: searchParams.petFriendly,
			// furnished: searchParams.furnished,
		}),
	)

	const properties = query.results || []
	const isLoading = query.status === "LoadingFirstPage"
	const isLoadingMore = query.status === "LoadingMore"
	const canLoadMore = query.status === "CanLoadMore"

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="font-semibold text-foreground text-xl">
						Available Properties in {searchParams.city}
					</h1>
					<span className="text-muted-foreground text-sm">
						{isLoading ? "Loading..." : `${totalCount || 0} results`}
					</span>
				</div>
				<FilterDropdown
					priceRange={uiFilters.priceRange}
					setPriceRange={(range) => updateFilters({ priceRange: range })}
					selectedAmenities={uiFilters.amenities}
					setSelectedAmenities={(amenities) => updateFilters({ amenities })}
					selectedBedrooms={uiFilters.bedrooms}
					setSelectedBedrooms={(bedrooms) => updateFilters({ bedrooms })}
					selectedBathrooms={uiFilters.bathrooms}
					setSelectedBathrooms={(bathrooms) => updateFilters({ bathrooms })}
					selectedPropertyType={uiFilters.propertyType}
					setSelectedPropertyType={(type) => updateFilters({ propertyType: type })}
					selectedPetPolicy={uiFilters.petFriendly}
					setSelectedPetPolicy={(policy) => updateFilters({ petFriendly: policy })}
					selectedFurnished={uiFilters.furnished}
					setSelectedFurnished={(furnished) => updateFilters({ furnished })}
				/>
			</div>
			<main className="w-full">
				<ApartmentGrid
					properties={properties}
					isLoading={isLoading}
					isLoadingMore={isLoadingMore}
					sortBy={searchParams.sortBy}
					onSortChange={(sortBy) => updateFilters({ sortBy })}
					canLoadMore={canLoadMore}
					loadMore={() => query.loadMore(24)}
				/>
			</main>
		</div>
	)
}
