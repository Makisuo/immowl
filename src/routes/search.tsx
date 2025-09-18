import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { api } from "convex/_generated/api"
import { useState } from "react"
import { ApartmentGrid } from "~/components/apartment-grid"
import { FilterDropdown } from "~/components/filter-dropdown"
import { useInfiniteQuery } from "~/hooks/use-infinite-query"

const searchSchema = type({
	city: "string = 'Berlin'",
	country: "string = 'DE'",
	propertyType: "string = 'apartment'",
	"ammenities?": "string[]",
})

export const Route = createFileRoute("/search")({
	component: RouteComponent,
	validateSearch: searchSchema,
})

function RouteComponent() {
	const { city, country, propertyType } = Route.useSearch()
	const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "newest" | "available">("newest")

	// Use infinite query for properties
	const { query } = useInfiniteQuery(
		api.properties.listProperties,
		{
			city,
			country,
			propertyType: propertyType as "apartment",
			sortBy,
		},
		{ initialNumItems: 24 },
	)

	const { data: totalCount } = useQuery(
		convexQuery(api.properties.getTotalCount, {
			city,
			country,
			propertyType: propertyType as "apartment",
		}),
	)

	const properties = query.results || []
	const isLoading = query.status === "LoadingFirstPage"
	const canLoadMore = query.status === "CanLoadMore"

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="font-semibold text-foreground text-xl">Available Properties in {city}</h1>
					<span className="text-muted-foreground text-sm">
						{isLoading ? "Loading..." : `${totalCount || 0} results`}
					</span>
				</div>
				<FilterDropdown />
			</div>
			<main className="w-full">
				<ApartmentGrid
					properties={properties}
					isLoading={isLoading}
					sortBy={sortBy}
					onSortChange={setSortBy}
					totalCount={totalCount || 0}
					canLoadMore={canLoadMore}
					loadMore={() => query.loadMore(24)}
				/>
			</main>
		</div>
	)
}
