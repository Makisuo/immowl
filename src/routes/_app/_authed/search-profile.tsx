import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { SavedSearchWizard } from "~/components/saved-searches/SavedSearchWizard"

export const Route = createFileRoute("/_app/_authed/search-profile")({
	component: SearchRequestsPage,
})

function SearchRequestsPage() {
	const { data, isLoading, error } = useQuery(
		convexQuery(api.savedSearches.listUserSavedSearches, {
			paginationOpts: { numItems: 1, cursor: null },
		}),
	)

	const existingSearch = data?.page?.[0] as any | undefined

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearchFromWizard),
	})
	const updateSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.updateSavedSearch),
	})

	const handleSubmit = async (payload: any) => {
		try {
			if (existingSearch?._id) {
				// Map nested payload from wizard to flat update args
				await updateSavedSearch.mutateAsync({
					searchId: existingSearch._id,
					name: payload.name,
					description: payload.description,
					city: payload.criteria.city,
					country: payload.criteria.country,
					propertyType: payload.criteria.propertyType,
					minPrice: payload.criteria.minPrice,
					maxPrice: payload.criteria.maxPrice,
					bedrooms: payload.criteria.bedrooms,
					bathrooms: payload.criteria.bathrooms,
					amenities: payload.criteria.amenities,
					petFriendly: payload.criteria.petFriendly,
					furnished: payload.criteria.furnished,
					weights: payload.criteria.weights,
				})
				toast.success("Search profile updated")
			} else {
				await createSavedSearch.mutateAsync(payload)
				toast.success("Search profile created")
			}
		} catch (e) {
			console.error(e)
			toast.error("Failed to save search profile")
		}
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<Search className="h-6 w-6 text-blue-600" />
								<h1 className="font-semibold text-foreground text-xl sm:text-2xl">
									Search Profile
								</h1>
							</div>
							<span className="text-muted-foreground text-sm">
								Create or edit your single search profile. We’ll match properties and notify
								you.
							</span>
						</div>
					</div>
					{/* Intentionally no Create button — wizard is embedded below and only one profile is allowed. */}
					<div />
				</div>
			</div>

			{/* Embedded Wizard (create if none exists, otherwise edit) */}
			{!isLoading && !error && (
				<SavedSearchWizard
					onComplete={handleSubmit}
					initialData={
						existingSearch
							? {
									name: existingSearch.name,
									description: existingSearch.description,
									criteria: existingSearch.criteria ?? {
										city: (existingSearch as any).city,
										country: (existingSearch as any).country,
										propertyType: (existingSearch as any).propertyType,
										minPrice: (existingSearch as any).minPrice,
										bedrooms: (existingSearch as any).bedrooms,
										bathrooms: (existingSearch as any).bathrooms,
										amenities: (existingSearch as any).amenities,
										petFriendly: (existingSearch as any).petFriendly,
										furnished: (existingSearch as any).furnished,
										weights:
											(existingSearch as any).criteria?.weights ??
											(existingSearch as any).weights,
									},
								}
							: undefined
					}
				/>
			)}

			{isLoading && <div className="text-muted-foreground text-sm">Loading your search profile...</div>}

			{error && <div className="text-destructive text-sm">Failed to load your search profile.</div>}
		</div>
	)
}

export default SearchRequestsPage
