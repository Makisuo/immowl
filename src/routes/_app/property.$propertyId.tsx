import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import type { Id } from "convex/_generated/dataModel"
import {
	ArrowLeft,
	Bath,
	Bed,
	Building2,
	Calendar,
	Check,
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Expand,
	ExternalLink,
	FileText,
	Heart,
	Home,
	Mail,
	MapPin,
	Phone,
	Share2,
	Square,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ImageGallery } from "~/components/ImageGallery"
import { ExternalSourceIndicator } from "~/components/properties/ExternalSourceIndicator"
import { PropertyInsights } from "~/components/properties/PropertyInsights"
import { PropertyMap } from "~/components/properties/PropertyMap"
import { PropertyMatchScore } from "~/components/properties/PropertyMatchScore"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { useSavedSearch } from "~/hooks/use-saved-search"
import { getSourceDisplayName } from "~/utils/externalSources"

export const Route = createFileRoute("/_app/property/$propertyId")({
	component: PropertyDetails,
})

function PropertyDetails() {
	const { propertyId } = Route.useParams()
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isGalleryOpen, setIsGalleryOpen] = useState(false)
	const { getSavedSearchParams } = useSavedSearch()

	// Get saved search params for back navigation
	const savedSearchParams = getSavedSearchParams()
	const backToSearchParams = savedSearchParams || {
		city: "Berlin",
		country: "DE",
		sortBy: "newest" as const,
	}

	const { data: property, isLoading } = useQuery(
		convexQuery(api.properties.getPropertyById, {
			propertyId: propertyId as Id<"properties">,
		}),
	)

	const { data: isSaved } = useQuery(
		convexQuery(api.savedProperties.isSaved, {
			propertyId: propertyId as Id<"properties">,
		}),
	)

	const toggleSaveMutation = useMutation({
		mutationFn: useConvexMutation(api.savedProperties.toggleSaveProperty),
	})

	const handleToggleSave = async () => {
		try {
			const result = await toggleSaveMutation.mutateAsync({
				propertyId: propertyId as Id<"properties">,
			})
			if (result.saved) {
				toast.success("Property saved to your list")
			} else {
				toast.success("Property removed from saved list")
			}
		} catch (_error) {
			toast.error("Failed to save property. Please try again.")
		}
	}

	if (isLoading) {
		return <PropertyDetailsSkeleton />
	}

	if (!property) {
		return (
			<div className="container mx-auto flex h-[60vh] flex-col items-center justify-center px-4 py-6">
				<h1 className="mb-4 font-bold text-3xl">Property Not Found</h1>
				<p className="mb-8 text-muted-foreground">
					The property you're looking for doesn't exist or has been removed.
				</p>
				<Link to="/search" search={backToSearchParams}>
					<Button>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Search
					</Button>
				</Link>
			</div>
		)
	}

	const images = property.imageUrls || []
	const hasMultipleImages = images.length > 1

	const navigateImage = (direction: "prev" | "next") => {
		if (direction === "next") {
			setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
		} else {
			setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
		}
	}

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Available Now"
		const date = new Date(timestamp)
		if (date <= new Date()) return "Available Now"
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		})
	}

	const propertyTypeLabel = property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)

	return (
		<>
			{/* Fixed action buttons */}
			<div className="fixed top-24 right-4 z-[30] flex items-center gap-2 md:top-36 md:right-8">
				<Button
					variant="outline"
					size="icon"
					onClick={handleToggleSave}
					disabled={toggleSaveMutation.isPending}
					className="bg-background shadow-md transition-colors hover:shadow-lg"
				>
					<Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
				</Button>
				<Button variant="outline" size="icon" className="bg-background shadow-md hover:shadow-lg">
					<Share2 className="h-4 w-4" />
				</Button>
			</div>

			<div className="container mx-auto px-4 py-6">
				{/* Header Navigation */}
				<div className="mb-6">
					<Link to="/search" search={backToSearchParams}>
						<Button variant="ghost" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Search
						</Button>
					</Link>
				</div>

				<div>
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Left Column - Images & Details */}
						<div className="lg:col-span-2">
							{/* Image Gallery */}
							<div className="mb-6">
								<div className="relative aspect-[4/3] overflow-hidden rounded-xl">
									{images.length > 0 ? (
										<>
											<button
												type="button"
												className="h-full w-full cursor-pointer"
												onClick={() => setIsGalleryOpen(true)}
												aria-label="Open gallery"
											>
												<img
													src={images[currentImageIndex]}
													alt={`${property.title} - View ${currentImageIndex + 1}`}
													className="h-full w-full object-cover"
												/>
											</button>
											{hasMultipleImages && (
												<>
													<Button
														variant="ghost"
														size="icon"
														className="-translate-y-1/2 absolute top-1/2 left-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
														onClick={() => navigateImage("prev")}
													>
														<ChevronLeft className="h-5 w-5" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="-translate-y-1/2 absolute top-1/2 right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
														onClick={() => navigateImage("next")}
													>
														<ChevronRight className="h-5 w-5" />
													</Button>
												</>
											)}
											<Button
												variant="ghost"
												size="sm"
												className="absolute right-4 bottom-4 bg-black/50 text-white hover:bg-black/70"
												onClick={() => setIsGalleryOpen(true)}
											>
												<Expand className="mr-2 h-4 w-4" />
												View All {images.length} Photos
											</Button>
										</>
									) : (
										<div className="flex h-full items-center justify-center bg-muted">
											<Home className="h-16 w-16 text-muted-foreground" />
										</div>
									)}
								</div>

								{/* Thumbnail Strip */}
								{images.length > 1 && (
									<div className="mt-4 flex gap-2 overflow-x-auto pb-2">
										{images.slice(0, 8).map((image, index) => (
											<button
												key={index}
												type="button"
												className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all ${
													currentImageIndex === index
														? "ring-2 ring-primary"
														: "opacity-70 hover:opacity-100"
												}`}
												onClick={() => setCurrentImageIndex(index)}
											>
												<img
													src={image}
													alt={`Thumbnail ${index + 1}`}
													className="h-20 w-28 object-cover"
												/>
											</button>
										))}
										{images.length > 8 && (
											<button
												type="button"
												className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
												onClick={() => setIsGalleryOpen(true)}
											>
												<span className="font-medium text-sm">
													+{images.length - 8} more
												</span>
											</button>
										)}
									</div>
								)}
							</div>

							{/* Property Info */}
							<div className="mb-6">
								<div className="mb-2 flex items-start justify-between gap-4">
									<h1 className="flex-1 font-bold text-3xl">{property.title}</h1>
									{property.isExternal && property.externalSource && (
										<ExternalSourceIndicator
											source={property.externalSource}
											url={property.externalUrl}
											size="lg"
											showText={true}
											className="mt-1"
										/>
									)}
								</div>
								<div className="mb-4 flex items-center gap-2 text-muted-foreground">
									<MapPin className="h-4 w-4" />
									<span>
										{property.address.street}, {property.address.city},{" "}
										{property.address.state} {property.address.zipCode}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-4">
									<Badge variant="secondary" className="px-3 py-1">
										<Building2 className="mr-1 h-3 w-3" />
										{propertyTypeLabel}
									</Badge>
									<div className="flex items-center gap-1">
										<Bed className="h-4 w-4 text-muted-foreground" />
										<span>
											{property.rooms.bedrooms === 0
												? "Studio"
												: `${property.rooms.bedrooms} Bedroom${property.rooms.bedrooms !== 1 ? "s" : ""}`}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Bath className="h-4 w-4 text-muted-foreground" />
										<span>
											{property.rooms.bathrooms} Bathroom
											{property.rooms.bathrooms !== 1 ? "s" : ""}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Square className="h-4 w-4 text-muted-foreground" />
										<span>{property.squareMeters} m²</span>
									</div>
								</div>
							</div>

							{/* Description */}
							{property.description && (
								<Card className="mb-6">
									<CardContent className="pt-6">
										<h2 className="mb-4 font-semibold text-xl">Description</h2>
										<p className="text-muted-foreground leading-relaxed">
											{property.description}
										</p>
									</CardContent>
								</Card>
							)}

							{/* Amenities */}
							{property.amenities && property.amenities.length > 0 && (
								<Card className="mb-6">
									<CardContent className="pt-6">
										<h2 className="mb-4 font-semibold text-xl">Amenities</h2>
										<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
											{property.amenities.map((amenity) => (
												<div key={amenity} className="flex items-center gap-2">
													<Check className="h-4 w-4 text-green-600" />
													<span className="text-sm">{amenity}</span>
												</div>
											))}
										</div>
										{property.petFriendly !== undefined && (
											<div className="mt-4 flex items-center gap-4 border-t pt-4">
												<Badge
													variant={property.petFriendly ? "default" : "secondary"}
												>
													{property.petFriendly ? "Pet Friendly" : "No Pets"}
												</Badge>
												{property.furnished !== undefined && (
													<Badge
														variant={property.furnished ? "default" : "secondary"}
													>
														{property.furnished ? "Furnished" : "Unfurnished"}
													</Badge>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Property Map */}
							<PropertyMap
								latitude={property.address.latitude}
								longitude={property.address.longitude}
								address={property.address}
								title={property.title}
							/>
						</div>

						{/* Right Column - Match Score, Insights, Pricing & Contact */}
						<div className="lg:col-span-1">
							<div className="sticky top-28 space-y-6">
								{/* Match Score */}
								<PropertyMatchScore property={property} />

								{/* Property Insights */}
								<PropertyInsights property={property} />

								{/* Pricing Card */}
								<Card>
									<CardContent className="pt-6">
										<div className="mb-6">
											<div className="mb-2 flex items-baseline gap-1">
												<span className="font-bold text-3xl">
													€
													{(
														property.monthlyRent.warm ||
														property.monthlyRent.cold ||
														0
													).toLocaleString()}
												</span>
												<span className="text-muted-foreground">
													{property.monthlyRent.warm
														? " (warm)"
														: property.monthlyRent.cold
															? " (cold)"
															: ""}
													/month
												</span>
											</div>
											<Badge variant="outline" className="mb-4">
												<Calendar className="mr-1 h-3 w-3" />
												{formatDate(property.availableFrom)}
											</Badge>
										</div>

										<Separator className="my-4" />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="flex items-center gap-2 text-muted-foreground">
													<DollarSign className="h-4 w-4" />
													Deposit
												</span>
												<span className="font-medium">
													€
													{(
														property.deposit ||
														property.monthlyRent.warm ||
														property.monthlyRent.cold ||
														0
													).toLocaleString()}
												</span>
											</div>
											{property.minimumLease && (
												<div className="flex items-center justify-between">
													<span className="flex items-center gap-2 text-muted-foreground">
														<FileText className="h-4 w-4" />
														Minimum Lease
													</span>
													<span className="font-medium">
														{property.minimumLease} months
													</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Contact Card - Only show for non-external properties */}
								{!property.isExternal && (
									<Card>
										<CardContent className="pt-6">
											<h3 className="mb-4 font-semibold text-lg">
												Contact Information
											</h3>
											<div className="space-y-3">
												{property.contactEmail && (
													<a
														href={`mailto:${property.contactEmail}?subject=Inquiry about ${property.title}`}
														className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
													>
														<Mail className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm">
															{property.contactEmail}
														</span>
													</a>
												)}
												{property.contactPhone && (
													<a
														href={`tel:${property.contactPhone}`}
														className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
													>
														<Phone className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm">
															{property.contactPhone}
														</span>
													</a>
												)}
											</div>
											<div className="mt-6 space-y-3">
												<Button className="w-full" size="lg">
													Schedule a Viewing
												</Button>
												<Button variant="outline" className="w-full" size="lg">
													Ask a Question
												</Button>
											</div>
										</CardContent>
									</Card>
								)}

								{/* External Link - Show prominently for external properties */}
								{property.isExternal && property.externalUrl && (
									<Card className="border-primary/20 bg-primary/5">
										<CardContent className="pt-6">
											<div className="mb-4 flex items-center gap-2">
												<ExternalSourceIndicator
													source={property.externalSource}
													url={property.externalUrl}
													size="md"
													showText={false}
												/>
												<div className="flex-1">
													<p className="font-medium text-sm">View Full Listing</p>
													<p className="text-muted-foreground text-xs">
														Contact & apply on{" "}
														{getSourceDisplayName(property.externalSource)}
													</p>
												</div>
											</div>
											<a
												href={property.externalUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Button className="w-full" size="lg">
													<ExternalLink className="mr-2 h-4 w-4" />
													View on {getSourceDisplayName(property.externalSource)}
												</Button>
											</a>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Full Screen Gallery Modal */}
				<ImageGallery
					images={images}
					title={property.title}
					open={isGalleryOpen}
					onOpenChange={setIsGalleryOpen}
					initialIndex={currentImageIndex}
				/>
			</div>
		</>
	)
}

function PropertyDetailsSkeleton() {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6 flex items-center justify-between">
				<Skeleton className="h-9 w-32" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-9" />
					<Skeleton className="h-9 w-9" />
				</div>
			</div>

			<div>
				<div className="grid gap-8 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<Skeleton className="mb-6 aspect-[4/3] rounded-xl" />
						<div className="mb-4 flex gap-2">
							{[...Array(4)].map((_, i) => (
								<Skeleton key={i} className="h-20 w-28 rounded-lg" />
							))}
						</div>
						<Skeleton className="mb-2 h-10 w-3/4" />
						<Skeleton className="mb-4 h-5 w-1/2" />
						<div className="mb-6 flex gap-4">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-24" />
						</div>
						<Card>
							<CardContent className="pt-6">
								<Skeleton className="mb-4 h-7 w-32" />
								<Skeleton className="mb-2 h-4 w-full" />
								<Skeleton className="mb-2 h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</CardContent>
						</Card>
					</div>
					<div className="lg:col-span-1">
						<Card>
							<CardContent className="pt-6">
								<Skeleton className="mb-2 h-10 w-32" />
								<Skeleton className="mb-4 h-6 w-24" />
								<Skeleton className="mb-4 h-px w-full" />
								<div className="space-y-3">
									<Skeleton className="h-5 w-full" />
									<Skeleton className="h-5 w-full" />
								</div>
								<Skeleton className="mt-6 h-12 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
