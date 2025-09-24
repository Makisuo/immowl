import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import type { Id } from "convex/_generated/dataModel"
import {
	Bath,
	Bed,
	Calendar,
	Edit,
	Eye,
	Home,
	MapPin,
	MoreHorizontal,
	Plus,
	Power,
	Search,
	Square,
	Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { PropertyFormWizard } from "./PropertyFormWizard"

const statusColors = {
	active: "bg-success text-success-foreground",
	disabled: "bg-muted text-muted-foreground",
}

const statusLabels = {
	active: "Active",
	disabled: "Disabled",
}

export function PropertyDashboard() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all")
	const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all")
	const [editingProperty, setEditingProperty] = useState<string | null>(null)
	const [deletingProperty, setDeletingProperty] = useState<string | null>(null)
	const [showAddProperty, setShowAddProperty] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [editDialogProperty, setEditDialogProperty] = useState<any>(null)

	const { data, isLoading, error } = useQuery(
		convexQuery(api.ownerProperties.getOwnerProperties, {
			status: statusFilter === "all" ? undefined : statusFilter,
			paginationOpts: { numItems: 50, cursor: null },
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

	const properties = data?.page || []

	const filteredProperties = useMemo(() => {
		return properties.filter((property) => {
			const matchesSearch =
				property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
				property.address.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				false

			const matchesStatus = statusFilter === "all" || property.status === statusFilter
			const matchesType = propertyTypeFilter === "all" || property.propertyType === propertyTypeFilter

			return matchesSearch && matchesStatus && matchesType
		})
	}, [searchTerm, statusFilter, propertyTypeFilter, properties])

	const propertyTypes = Array.from(new Set(properties.map((p) => p.propertyType).filter(Boolean)))

	const handleEditProperty = (propertyId: string) => {
		const property = properties.find((p) => p._id === propertyId)
		if (property) {
			setEditDialogProperty(property)
			setEditingProperty(propertyId)
			setShowEditDialog(true)
		}
	}

	const handleCloseEditDialog = () => {
		setShowEditDialog(false)
		setEditingProperty(null)
		setEditDialogProperty(null)
	}

	const handleCloseAddDialog = () => {
		setShowAddProperty(false)
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
						<h1 className="font-semibold text-foreground text-xl sm:text-2xl">My Properties</h1>
						<span className="text-muted-foreground text-sm">
							{isLoading ? "Loading..." : `${properties.length} properties`}
						</span>
					</div>
					<Button className="w-full sm:w-auto" onClick={() => setShowAddProperty(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Property
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
				</div>
			) : error ? (
				<div className="py-12 text-center">
					<p className="text-destructive">Failed to load properties</p>
					<p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
				</div>
			) : (
				<>
					{/* Filters */}
					<div className="mb-6 space-y-4">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<div className="relative flex-1 sm:max-w-xs">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
								<Input
									placeholder="Search properties..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>

							<Select
								value={statusFilter}
								onValueChange={(value) => setStatusFilter(value as any)}
							>
								<SelectTrigger className="w-full sm:w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="disabled">Disabled</SelectItem>
								</SelectContent>
							</Select>

							<Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
								<SelectTrigger className="w-full sm:w-40">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{propertyTypes.map((type) => (
										<SelectItem key={type} value={type} className="capitalize">
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Results Header */}
					{filteredProperties.length !== properties.length && (
						<div className="mb-4 flex items-center justify-between">
							<p className="text-muted-foreground text-sm">
								Showing {filteredProperties.length} of {properties.length} properties
							</p>
						</div>
					)}

					{filteredProperties.length === 0 ? (
						<div className="py-16 text-center">
							<div className="mx-auto max-w-md">
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
									<Home className="h-8 w-8 text-muted-foreground" />
								</div>
								<h3 className="mb-3 font-semibold text-foreground text-lg">
									{searchTerm || statusFilter !== "all" || propertyTypeFilter !== "all"
										? "No properties match your filters"
										: "No properties yet"}
								</h3>
								<p className="mb-6 text-pretty text-muted-foreground text-sm">
									{searchTerm || statusFilter !== "all" || propertyTypeFilter !== "all"
										? "Try adjusting your search criteria or filters to find what you're looking for."
										: "Get started by adding your first property listing to the platform."}
								</p>
								<div className="flex flex-col justify-center gap-3 sm:flex-row">
									{(searchTerm ||
										statusFilter !== "all" ||
										propertyTypeFilter !== "all") && (
										<Button
											variant="outline"
											onClick={() => {
												setSearchTerm("")
												setStatusFilter("all")
												setPropertyTypeFilter("all")
											}}
											className="w-full sm:w-auto"
										>
											Clear Filters
										</Button>
									)}
									<Button
										onClick={() => setShowAddProperty(true)}
										className="w-full sm:w-auto"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Your First Property
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
							{filteredProperties.map((property) => (
								<Card
									key={property._id}
									className="border-border bg-card pt-0 transition-colors hover:border-border/80"
								>
									<div className="relative">
										{property.imageUrls && property.imageUrls.length > 0 ? (
											<img
												src={property.imageUrls[0]}
												alt={property.title}
												className="h-40 w-full rounded-t-lg object-cover sm:h-48"
											/>
										) : (
											<div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-muted sm:h-48">
												<Home className="h-12 w-12 text-muted-foreground/50" />
											</div>
										)}
										<Badge
											className={`absolute top-3 left-3 text-xs ${statusColors[property.status]}`}
										>
											{statusLabels[property.status]}
										</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="absolute top-3 right-3 h-8 w-8 bg-background/80 p-0 hover:bg-background"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="border-border bg-popover"
											>
												<DropdownMenuItem
													className="text-foreground hover:bg-accent"
													onClick={() => handleEditProperty(property._id)}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit Listing
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-foreground hover:bg-accent"
													onClick={() =>
														handleToggleStatus(property._id, property.status)
													}
												>
													<Power className="mr-2 h-4 w-4" />
													{property.status === "active" ? "Disable" : "Activate"}
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive hover:bg-destructive/10"
													onClick={() => setDeletingProperty(property._id)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<CardContent className="p-4 sm:p-6">
										<div className="space-y-3 sm:space-y-4">
											<div>
												<h3 className="mb-1 text-balance font-semibold text-base text-foreground sm:text-lg">
													{property.title}
												</h3>
												<div className="flex items-center text-muted-foreground text-sm">
													<MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
													<span className="truncate">
														{property.address.street &&
															`${property.address.street}, `}
														{property.address.city}
													</span>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<div className="font-bold text-foreground text-xl sm:text-2xl">
													€
													{property.monthlyRent?.warm?.toLocaleString() ||
														property.monthlyRent?.cold?.toLocaleString() ||
														0}
													<span className="font-normal text-muted-foreground text-sm">
														/month
													</span>
												</div>
												{property.propertyType && (
													<Badge
														variant="outline"
														className="border-border text-muted-foreground text-xs capitalize"
													>
														{property.propertyType}
													</Badge>
												)}
											</div>

											<div className="flex items-center gap-4 text-muted-foreground text-sm">
												{property.rooms?.bedrooms && (
													<div className="flex items-center gap-1">
														<Bed className="h-4 w-4" />
														{property.rooms.bedrooms}
													</div>
												)}
												{property.rooms?.bathrooms && (
													<div className="flex items-center gap-1">
														<Bath className="h-4 w-4" />
														{property.rooms.bathrooms}
													</div>
												)}
												{property.squareMeters && (
													<div className="flex items-center gap-1">
														<Square className="h-4 w-4" />
														{property.squareMeters}m²
													</div>
												)}
											</div>

											<div className="flex items-center justify-between border-border border-t pt-3 sm:pt-4">
												<div className="flex items-center gap-4 text-muted-foreground text-sm">
													{property.availableFrom && (
														<div className="flex items-center gap-1">
															<span className="text-xs">Available from:</span>
															<span className="text-xs">
																{new Date(
																	property.availableFrom,
																).toLocaleDateString("en-US", {
																	month: "short",
																	year: "numeric",
																})}
															</span>
														</div>
													)}
												</div>
												<div className="flex items-center gap-1 text-muted-foreground text-xs">
													<Calendar className="h-3 w-3" />
													<span>
														{new Date(property._creationTime).toLocaleDateString(
															"en-US",
															{
																month: "short",
																day: "numeric",
															},
														)}
													</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Load More Button */}
					{data?.isDone === false && filteredProperties.length > 0 && (
						<div className="flex justify-center pt-8">
							<Button variant="outline">Load More</Button>
						</div>
					)}

					{/* Delete Confirmation Dialog */}
					<DeleteConfirmDialog
						open={!!deletingProperty}
						onOpenChange={(open) => !open && setDeletingProperty(null)}
						onConfirm={() => deletingProperty && handleDelete(deletingProperty)}
						propertyTitle={properties.find((p) => p._id === deletingProperty)?.title || ""}
					/>

					{/* Add Property Dialog */}
					<Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
						<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
							<PropertyFormWizard mode="create" onSuccess={handleCloseAddDialog} />
						</DialogContent>
					</Dialog>

					{/* Edit Property Dialog */}
					<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
						<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
							{editDialogProperty && editingProperty && (
								<PropertyFormWizard
									mode="edit"
									propertyId={editingProperty}
									initialData={editDialogProperty}
									onSuccess={handleCloseEditDialog}
								/>
							)}
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	)
}
