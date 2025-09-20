import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
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
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { ImageGallery } from "~/components/ImageGallery"
import { Skeleton } from "~/components/ui/skeleton"

export const Route = createFileRoute("/property/$propertyId")({
	component: PropertyDetails,
})

function PropertyDetails() {
	const { propertyId } = Route.useParams()
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isGalleryOpen, setIsGalleryOpen] = useState(false)
	const [isFavorite, setIsFavorite] = useState(false)

	const { data: property, isLoading } = useQuery(
		convexQuery(api.properties.getPropertyById, {
			propertyId: propertyId as Id<"properties">,
		}),
	)

	if (isLoading) {
		return <PropertyDetailsSkeleton />
	}

	if (!property) {
		return (
			<div className="container mx-auto flex h-[60vh] flex-col items-center justify-center px-4">
				<h1 className="mb-4 font-bold text-3xl">Property Not Found</h1>
				<p className="mb-8 text-muted-foreground">
					The property you're looking for doesn't exist or has been removed.
				</p>
				<Link to="/search">
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
	const squareFeet = Math.round(property.squareMeters * 10.764)

	return (
		<div className="min-h-screen bg-background">
			{/* Header Navigation */}
			<div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<Link to="/search">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Search
						</Button>
					</Link>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsFavorite(!isFavorite)}
							className="transition-colors"
						>
							<Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
						</Button>
						<Button variant="outline" size="icon">
							<Share2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
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
							<h1 className="mb-2 font-bold text-3xl">{property.title}</h1>
							<div className="mb-4 flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span>
									{property.address}, {property.city}, {property.state} {property.zipCode}
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
									<span>{squareFeet} sqft</span>
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
							<Card>
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
											<Badge variant={property.petFriendly ? "default" : "secondary"}>
												{property.petFriendly ? "Pet Friendly" : "No Pets"}
											</Badge>
											{property.furnished !== undefined && (
												<Badge variant={property.furnished ? "default" : "secondary"}>
													{property.furnished ? "Furnished" : "Unfurnished"}
												</Badge>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column - Pricing & Contact */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 space-y-6">
							{/* Pricing Card */}
							<Card>
								<CardContent className="pt-6">
									<div className="mb-6">
										<div className="mb-2 flex items-baseline gap-1">
											<span className="font-bold text-3xl">
												${property.monthlyRent.toLocaleString()}
											</span>
											<span className="text-muted-foreground">/month</span>
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
												${(property.deposit || property.monthlyRent).toLocaleString()}
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

							{/* Contact Card */}
							<Card>
								<CardContent className="pt-6">
									<h3 className="mb-4 font-semibold text-lg">Contact Information</h3>
									<div className="space-y-3">
										{property.contactEmail && (
											<a
												href={`mailto:${property.contactEmail}?subject=Inquiry about ${property.title}`}
												className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
											>
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">{property.contactEmail}</span>
											</a>
										)}
										{property.contactPhone && (
											<a
												href={`tel:${property.contactPhone}`}
												className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
											>
												<Phone className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">{property.contactPhone}</span>
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

							{/* External Link */}
							{property.externalUrl && (
								<Card>
									<CardContent className="pt-6">
										<p className="mb-3 text-muted-foreground text-sm">
											This property is listed on {property.externalSource}
										</p>
										<a
											href={property.externalUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Button variant="outline" className="w-full">
												View Original Listing
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
	)
}

function PropertyDetailsSkeleton() {
	return (
		<div className="min-h-screen bg-background">
			<div className="sticky top-0 z-40 border-b bg-background">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<Skeleton className="h-9 w-32" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-9" />
						<Skeleton className="h-9 w-9" />
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
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
