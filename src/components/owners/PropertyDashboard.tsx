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
import { Dialog, DialogContent } from "~/components/ui/dialog"
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

	const stats = useMemo(() => {
		const activeCount = properties.filter((p) => p.status === "active").length
		const disabledCount = properties.filter((p) => p.status === "disabled").length
		const totalRevenue = properties
			.filter((p) => p.status === "active")
			.reduce((sum, p) => sum + (p.monthlyRent?.warm || p.monthlyRent?.cold || 0), 0)

		return {
			total: properties.length,
			active: activeCount,
			disabled: disabledCount,
			revenue: totalRevenue,
		}
	}, [properties])

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
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Home className="h-6 w-6 text-blue-600" />
							<h1 className="font-semibold text-foreground text-xl sm:text-2xl">My Properties</h1>
						</div>
						<span className="text-muted-foreground text-sm">
							Manage your property listings and track their performance
						</span>
					</div>
					<Button className="w-full sm:w-auto" onClick={() => setShowAddProperty(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Property
					</Button>
				</div>
			</div>

			{isLoading ? (
				<>
					{/* Loading Stats Skeleton */}
					<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<Card key={i} className="border-border bg-card">
								<CardContent className="p-4 sm:p-6">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
											<div className="h-8 w-16 animate-pulse rounded bg-muted" />
										</div>
										<div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Loading Property Cards Skeleton */}
					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Card key={i} className="overflow-hidden border-border bg-card pt-0">
								<div className="h-48 w-full animate-pulse bg-muted sm:h-52" />
								<CardContent className="p-5 sm:p-6">
									<div className="space-y-4">
										<div>
											<div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
											<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
										</div>
										<div className="flex items-center justify-between border-border border-t pt-3">
											<div className="h-8 w-24 animate-pulse rounded bg-muted" />
											<div className="h-6 w-16 animate-pulse rounded bg-muted" />
										</div>
										<div className="flex gap-5 border-border border-t pt-3">
											<div className="h-4 w-12 animate-pulse rounded bg-muted" />
											<div className="h-4 w-12 animate-pulse rounded bg-muted" />
											<div className="h-4 w-12 animate-pulse rounded bg-muted" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			) : error ? (
				<div className="py-12 text-center">
					<p className="text-destructive">Failed to load properties</p>
					<p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
				</div>
			) : (
				<>
					{/* Stats Overview */}
					<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
						<Card className="border-border bg-card">
							<CardContent className="p-4 sm:p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-muted-foreground text-sm">Total Properties</p>
										<p className="mt-1 font-bold text-2xl text-foreground">{stats.total}</p>
									</div>
									<div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
										<Home className="h-5 w-5 text-blue-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-border bg-card">
							<CardContent className="p-4 sm:p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-muted-foreground text-sm">Active Listings</p>
										<p className="mt-1 font-bold text-2xl text-foreground">{stats.active}</p>
									</div>
									<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
										<Eye className="h-5 w-5 text-green-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-border bg-card">
							<CardContent className="p-4 sm:p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-muted-foreground text-sm">Disabled</p>
										<p className="mt-1 font-bold text-2xl text-foreground">{stats.disabled}</p>
									</div>
									<div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900/20">
										<Power className="h-5 w-5 text-gray-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-border bg-card">
							<CardContent className="p-4 sm:p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-muted-foreground text-sm">Monthly Revenue</p>
										<p className="mt-1 font-bold text-2xl text-foreground">
											€{stats.revenue.toLocaleString()}
										</p>
									</div>
									<div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/20">
										<Calendar className="h-5 w-5 text-emerald-600" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
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
									className="group overflow-hidden border-border bg-card pt-0 transition-all duration-200 hover:shadow-lg hover:border-border/80"
								>
									<div className="relative overflow-hidden">
										{property.imageUrls && property.imageUrls.length > 0 ? (
											<img
												src={property.imageUrls[0]}
												alt={property.title}
												className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52"
											/>
										) : (
											<div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 sm:h-52">
												<Home className="h-16 w-16 text-muted-foreground/30" />
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
										<Badge
											className={`absolute top-3 left-3 text-xs shadow-md ${statusColors[property.status]}`}
										>
											{statusLabels[property.status]}
										</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="absolute top-3 right-3 h-8 w-8 bg-background/90 p-0 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
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

									<CardContent className="p-5 sm:p-6">
										<div className="space-y-4">
											<div>
												<h3 className="mb-2 line-clamp-2 text-balance font-semibold text-base text-foreground sm:text-lg">
													{property.title}
												</h3>
												<div className="flex items-center gap-1 text-muted-foreground text-sm">
													<MapPin className="h-4 w-4 flex-shrink-0" />
													<span className="truncate">
														{property.address.street &&
															`${property.address.street}, `}
														{property.address.city}
													</span>
												</div>
											</div>

											<div className="flex items-center justify-between border-border border-t pt-3">
												<div className="font-bold text-foreground text-xl sm:text-2xl">
													€
													{property.monthlyRent?.warm?.toLocaleString() ||
														property.monthlyRent?.cold?.toLocaleString() ||
														0}
													<span className="font-normal text-muted-foreground text-sm">
														/mo
													</span>
												</div>
												{property.propertyType && (
													<Badge
														variant="outline"
														className="border-border/60 bg-muted/30 text-muted-foreground text-xs capitalize"
													>
														{property.propertyType}
													</Badge>
												)}
											</div>

											<div className="flex items-center gap-5 border-border border-t pt-3 text-muted-foreground text-sm">
												{property.rooms?.bedrooms && (
													<div className="flex items-center gap-1.5">
														<Bed className="h-4 w-4" />
														<span className="font-medium">{property.rooms.bedrooms}</span>
													</div>
												)}
												{property.rooms?.bathrooms && (
													<div className="flex items-center gap-1.5">
														<Bath className="h-4 w-4" />
														<span className="font-medium">{property.rooms.bathrooms}</span>
													</div>
												)}
												{property.squareMeters && (
													<div className="flex items-center gap-1.5">
														<Square className="h-4 w-4" />
														<span className="font-medium">{property.squareMeters}m²</span>
													</div>
												)}
											</div>

											<div className="flex items-center justify-between border-border border-t pt-3 text-muted-foreground text-xs">
												{property.availableFrom ? (
													<div className="flex items-center gap-1.5">
														<Calendar className="h-3.5 w-3.5" />
														<span>
															Available{" "}
															{new Date(property.availableFrom).toLocaleDateString(
																"en-US",
																{
																	month: "short",
																	year: "numeric",
																},
															)}
														</span>
													</div>
												) : (
													<div />
												)}
												<div className="text-muted-foreground/60">
													Listed{" "}
													{new Date(property._creationTime).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
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
