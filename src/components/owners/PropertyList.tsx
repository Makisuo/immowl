import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import type { Id } from "convex/_generated/dataModel"
import { Loader2, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { EmptyState } from "./EmptyState"
import { OwnerPropertyCard } from "./OwnerPropertyCard"
import { PropertyFormWizard } from "./PropertyFormWizard"

export function PropertyList() {
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all")
	const [searchQuery, setSearchQuery] = useState("")
	const [editingProperty, setEditingProperty] = useState<string | null>(null)
	const [deletingProperty, setDeletingProperty] = useState<string | null>(null)

	const { data, isLoading, error } = useQuery(
		convexQuery(api.ownerProperties.getOwnerProperties, {
			status: statusFilter === "all" ? undefined : statusFilter,
			paginationOpts: { numItems: 20, cursor: null },
		}),
	)

	const deleteProperty = useMutation({
		mutationFn: useConvexMutation(api.ownerProperties.deleteOwnerProperty),
	})
	const toggleStatus = useMutation({
		mutationFn: useConvexMutation(api.ownerProperties.togglePropertyStatus),
	})

	const handleDelete = async (propertyId: string) => {
		try {
			await deleteProperty.mutateAsync({ propertyId: propertyId as Id<"properties"> })
			toast.success("Property deleted successfully")
			setDeletingProperty(null)
		} catch (error) {
			toast.error("Failed to delete property")
			console.error(error)
		}
	}

	const handleToggleStatus = async (propertyId: string, currentStatus: string) => {
		const newStatus = currentStatus === "active" ? "disabled" : "active"
		try {
			await toggleStatus.mutateAsync({
				propertyId: propertyId as Id<"properties">,
				status: newStatus,
			})
			toast.success(`Property ${newStatus === "active" ? "activated" : "disabled"} successfully`)
		} catch (error) {
			toast.error("Failed to update property status")
			console.error(error)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="py-12 text-center">
				<p className="text-destructive">Failed to load properties</p>
				<p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
			</div>
		)
	}

	const properties = data?.page || []
	const filteredProperties = properties.filter(
		(property) =>
			property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			property.address.city.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	if (editingProperty) {
		const property = properties.find((p) => p._id === editingProperty)
		if (property) {
			return (
				<div className="space-y-4">
					<Button variant="ghost" onClick={() => setEditingProperty(null)} className="mb-4">
						← Back to Properties
					</Button>
					<PropertyFormWizard
						mode="edit"
						propertyId={editingProperty}
						initialData={property as any}
						onSuccess={() => setEditingProperty(null)}
					/>
				</div>
			)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by title or location..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Properties</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="disabled">Disabled</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{filteredProperties.length === 0 ? (
				<EmptyState
					title="No properties found"
					description={
						searchQuery || statusFilter !== "all"
							? "Try adjusting your filters"
							: "Start by adding your first property"
					}
				/>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredProperties.map((property) => (
						<OwnerPropertyCard
							key={property._id}
							property={property as any}
							onEdit={() => setEditingProperty(property._id)}
							onDelete={() => setDeletingProperty(property._id)}
							onToggleStatus={() => handleToggleStatus(property._id, property.status)}
						/>
					))}
				</div>
			)}

			{data?.isDone === false && (
				<div className="flex justify-center pt-4">
					<Button variant="outline">Load More</Button>
				</div>
			)}

			<DeleteConfirmDialog
				open={!!deletingProperty}
				onOpenChange={(open) => !open && setDeletingProperty(null)}
				onConfirm={() => deletingProperty && handleDelete(deletingProperty)}
				propertyTitle={properties.find((p) => p._id === deletingProperty)?.title || ""}
			/>
		</div>
	)
}
