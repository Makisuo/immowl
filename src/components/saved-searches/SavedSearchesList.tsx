import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import type { Doc, Id } from "convex/_generated/dataModel"
import { Bell, BellOff, Edit2, Eye, EyeOff, MoreVertical, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { EmptyState } from "~/components/owners/EmptyState"

interface SavedSearchesListProps {
	onEditSearch?: (search: Doc<"savedSearches">) => void
}

export function SavedSearchesList({ onEditSearch }: SavedSearchesListProps) {
	const [deletingSearch, setDeletingSearch] = useState<string | null>(null)

	const { data, isLoading, error } = useQuery(
		convexQuery(api.savedSearches.listUserSavedSearches, {
			paginationOpts: { numItems: 20, cursor: null },
		}),
	)

	const deleteSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.deleteSavedSearch),
	})

	const toggleStatus = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.toggleSavedSearchStatus),
	})

	const toggleNotifications = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.toggleNotifications),
	})

	const handleDelete = async (searchId: string) => {
		try {
			await deleteSearch.mutateAsync({ searchId: searchId as Id<"savedSearches"> })
			toast.success("Saved search deleted")
			setDeletingSearch(null)
		} catch (error) {
			toast.error("Failed to delete saved search")
			console.error(error)
		}
	}

	const handleToggleStatus = async (searchId: string, currentStatus: boolean) => {
		try {
			await toggleStatus.mutateAsync({
				searchId: searchId as Id<"savedSearches">,
				isActive: !currentStatus,
			})
			toast.success(`Search ${!currentStatus ? "activated" : "disabled"}`)
		} catch (error) {
			toast.error("Failed to update search status")
			console.error(error)
		}
	}

	const handleToggleNotifications = async (searchId: string, currentStatus: boolean) => {
		try {
			await toggleNotifications.mutateAsync({
				searchId: searchId as Id<"savedSearches">,
				notificationsEnabled: !currentStatus,
			})
			toast.success(`Notifications ${!currentStatus ? "enabled" : "disabled"}`)
		} catch (error) {
			toast.error("Failed to update notification settings")
			console.error(error)
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader>
							<div className="h-4 w-1/3 rounded bg-muted"></div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="h-3 w-2/3 rounded bg-muted"></div>
								<div className="h-3 w-1/2 rounded bg-muted"></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="py-12 text-center">
				<p className="text-destructive">Failed to load saved searches</p>
				<p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
			</div>
		)
	}

	const searches = data?.page || []

	if (searches.length === 0) {
		return (
			<EmptyState
				title="No saved searches yet"
				description="Save your search criteria to get notified when matching properties become available."
			/>
		)
	}

	return (
		<div className="space-y-4">
			{searches.map((search) => (
				<SavedSearchCard
					key={search._id}
					search={search}
					onEdit={() => onEditSearch?.(search)}
					onDelete={() => setDeletingSearch(search._id)}
					onToggleStatus={() => handleToggleStatus(search._id, search.isActive)}
					onToggleNotifications={() =>
						handleToggleNotifications(search._id, search.notificationsEnabled)
					}
				/>
			))}

			{/* Delete Confirmation Dialog */}
			{deletingSearch && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<Card className="mx-4 w-full max-w-md">
						<CardHeader>
							<CardTitle>Delete Saved Search</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="mb-4 text-muted-foreground text-sm">
								Are you sure you want to delete this saved search? This action cannot be
								undone.
							</p>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setDeletingSearch(null)}>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDelete(deletingSearch)}
									disabled={deleteSearch.isPending}
								>
									{deleteSearch.isPending ? "Deleting..." : "Delete"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}

interface SavedSearchCardProps {
	search: Doc<"savedSearches">
	onEdit: () => void
	onDelete: () => void
	onToggleStatus: () => void
	onToggleNotifications: () => void
}

function SavedSearchCard({
	search,
	onEdit,
	onDelete,
	onToggleStatus,
	onToggleNotifications,
}: SavedSearchCardProps) {
	// Get search result count
	const { data: resultCount } = useQuery(
		convexQuery(api.savedSearches.getSavedSearchCount, {
			searchId: search._id,
		}),
	)

	// Helper to get criteria from either new nested structure or legacy flat fields
	const getCriteria = () => {
		return (search as any).criteria ?? {
			city: (search as any).city,
			country: (search as any).country,
			propertyType: (search as any).propertyType,
			minPrice: (search as any).minPrice,
			maxPrice: (search as any).maxPrice,
			bedrooms: (search as any).bedrooms,
			bathrooms: (search as any).bathrooms,
			amenities: (search as any).amenities,
			petFriendly: (search as any).petFriendly,
			furnished: (search as any).furnished,
		}
	}

	const getSearchSummary = () => {
		const criteria = getCriteria()

		const parts = []

		parts.push(`${criteria.city}, ${criteria.country}`)

		if (criteria.propertyType) {
			parts.push(criteria.propertyType)
		}

		if (criteria.minPrice || criteria.maxPrice) {
			const priceRange = []
			if (criteria.minPrice) priceRange.push(`€${criteria.minPrice}+`)
			if (criteria.maxPrice) priceRange.push(`€${criteria.maxPrice}-`)
			parts.push(priceRange.join(" to "))
		}

		if (criteria.bedrooms) {
			parts.push(`${criteria.bedrooms} bed`)
		}

		if (criteria.bathrooms) {
			parts.push(`${criteria.bathrooms}+ bath`)
		}

		if (criteria.furnished) {
			parts.push("furnished")
		}

		if (criteria.petFriendly) {
			parts.push("pet-friendly")
		}

		if (criteria.amenities && criteria.amenities.length > 0) {
			parts.push(`${criteria.amenities.length} amenities`)
		}

		return parts.join(" • ")
	}

	return (
		<Card className={`relative ${!search.isActive ? "opacity-60" : ""}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-1">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Search className="h-4 w-4" />
							{search.name}
						</CardTitle>
						{search.description && (
							<p className="text-muted-foreground text-sm">{search.description}</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						{!search.isActive && (
							<Badge variant="secondary">Disabled</Badge>
						)}
						<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onEdit}>
								<Edit2 className="mr-2 h-4 w-4" />
								Edit Search
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onToggleStatus}>
								{search.isActive ? (
									<>
										<EyeOff className="mr-2 h-4 w-4" />
										Disable Search
									</>
								) : (
									<>
										<Eye className="mr-2 h-4 w-4" />
										Enable Search
									</>
								)}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onToggleNotifications}>
								{search.notificationsEnabled ? (
									<>
										<BellOff className="mr-2 h-4 w-4" />
										Disable Notifications
									</>
								) : (
									<>
										<Bell className="mr-2 h-4 w-4" />
										Enable Notifications
									</>
								)}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={onDelete} className="text-destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Search
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="text-muted-foreground text-sm">{getSearchSummary()}</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1">
							{search.notificationsEnabled ? (
								<Bell className="h-3 w-3 text-blue-600" />
							) : (
								<BellOff className="h-3 w-3 text-muted-foreground" />
							)}
							<span className="text-muted-foreground text-xs">
								{search.notificationsEnabled ? "Notifications on" : "Notifications off"}
							</span>
						</div>

						{resultCount !== undefined && (
							<span className="text-muted-foreground text-xs">
								{resultCount} {resultCount === 1 ? "property" : "properties"} found
							</span>
						)}
					</div>

					<Link
						to="/search"
						search={() => {
							const criteria = getCriteria()
							return {
								city: criteria.city,
								country: criteria.country,
								propertyType: criteria.propertyType,
								sortBy: search.sortBy,
								minPrice: criteria.minPrice,
								maxPrice: criteria.maxPrice,
								bedrooms: criteria.bedrooms,
								bathrooms: criteria.bathrooms,
								amenities: criteria.amenities,
								petFriendly: criteria.petFriendly,
								furnished: criteria.furnished,
							}
						}}
						className="text-blue-600 text-xs hover:underline"
					>
						View Results →
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
