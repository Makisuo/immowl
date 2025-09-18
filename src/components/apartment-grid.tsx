"use client"

import { Bath, Bed, ChevronLeft, ChevronRight, Heart, MapPin, Square } from "lucide-react"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

const apartments = [
	{
		id: 1,
		title: "Modern Downtown Loft",
		address: "123 Main St, Downtown",
		price: 2400,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1200,
		rating: 4.8,
		reviews: 24,
		images: [
			"/placeholder/modern-apartment.png",
			"/placeholder/luxury-city-view-apartment.png",
			"/placeholder/bright-sunny-apartment-large-windows.jpg",
			"/placeholder/industrial-loft-apartment-exposed-brick.jpg",
		],
		amenities: ["Pet Friendly", "Gym", "Parking"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 2400,
	},
	{
		id: 2,
		title: "Cozy Studio Apartment",
		address: "456 Oak Ave, Midtown",
		price: 1800,
		bedrooms: 0,
		bathrooms: 1,
		sqft: 650,
		rating: 4.5,
		reviews: 18,
		images: [
			"/placeholder/cozy-studio-apartment.png",
			"/placeholder/urban-studio-apartment-modern.jpg",
			"/placeholder/minimalist-studio-apartment-clean.jpg",
		],
		amenities: ["Laundry", "Balcony"],
		available: "Dec 1st",
		leaseTerms: "6+ months",
		deposit: 1800,
	},
	{
		id: 3,
		title: "Luxury High-Rise Unit",
		address: "789 Park Blvd, Uptown",
		price: 3200,
		bedrooms: 3,
		bathrooms: 2,
		sqft: 1800,
		rating: 4.9,
		reviews: 42,
		images: [
			"/placeholder/luxury-city-view-apartment.png",
			"/placeholder/modern-penthouse-city-view.png",
			"/placeholder/executive-apartment-suite-modern.jpg",
			"/placeholder/waterfront-apartment-with-harbor-view.jpg",
			"/placeholder/modern-tech-apartment-smart-home.jpg",
		],
		amenities: ["Pool", "Doorman", "Gym", "Parking"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 3200,
	},
	{
		id: 4,
		title: "Charming Garden Apartment",
		address: "321 Elm St, Riverside",
		price: 2100,
		bedrooms: 2,
		bathrooms: 1,
		sqft: 1000,
		rating: 4.6,
		reviews: 31,
		images: ["/placeholder/garden-apartment-patio.png", "/placeholder/cozy-cottage-garden.png"],
		amenities: ["Pet Friendly", "Parking", "Balcony"],
		available: "Jan 15th",
		leaseTerms: "12+ months",
		deposit: 2100,
	},
	{
		id: 5,
		title: "Industrial Converted Loft",
		address: "654 Factory Rd, Arts District",
		price: 2800,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1400,
		rating: 4.7,
		reviews: 19,
		images: [
			"/placeholder/industrial-loft-apartment-exposed-brick.jpg",
			"/placeholder/artist-loft-with-high-ceilings.jpg",
			"/placeholder/vintage-apartment-with-character.jpg",
			"/placeholder/modern-apartment.png",
		],
		amenities: ["Gym", "Laundry", "Air Conditioning"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 2800,
	},
	{
		id: 6,
		title: "Sunny Corner Unit",
		address: "987 Sunset Dr, Westside",
		price: 2600,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1300,
		rating: 4.4,
		reviews: 27,
		images: [
			"/placeholder/bright-sunny-apartment-large-windows.jpg",
			"/placeholder/modern-apartment.png",
		],
		amenities: ["Pool", "Parking", "Dishwasher"],
		available: "Feb 1st",
		leaseTerms: "12+ months",
		deposit: 2600,
	},
	{
		id: 7,
		title: "Spacious Family Home",
		address: "111 Maple St, Suburbs",
		price: 3500,
		bedrooms: 4,
		bathrooms: 3,
		sqft: 2200,
		rating: 4.8,
		reviews: 35,
		images: [
			"/placeholder/spacious-family-home-with-yard.jpg",
			"/placeholder/family-duplex-with-yard.jpg",
			"/placeholder/cozy-cottage-garden.png",
			"/placeholder/garden-apartment-patio.png",
		],
		amenities: ["Pet Friendly", "Parking", "Yard", "Storage"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 3500,
	},
	{
		id: 8,
		title: "Historic Brownstone",
		address: "222 Heritage Ave, Old Town",
		price: 2900,
		bedrooms: 3,
		bathrooms: 2,
		sqft: 1600,
		rating: 4.6,
		reviews: 28,
		images: [
			"/placeholder/historic-brownstone-apartment.jpg",
			"/placeholder/vintage-apartment-with-character.jpg",
			"/placeholder/artist-loft-with-high-ceilings.jpg",
		],
		amenities: ["Hardwood Floors", "Fireplace", "Parking"],
		available: "Dec 15th",
		leaseTerms: "12+ months",
		deposit: 2900,
	},
	{
		id: 9,
		title: "Modern Penthouse",
		address: "333 Sky Tower, Financial District",
		price: 4200,
		bedrooms: 3,
		bathrooms: 3,
		sqft: 2000,
		rating: 4.9,
		reviews: 52,
		images: [
			"/placeholder/modern-penthouse-city-view.png",
			"/placeholder/luxury-city-view-apartment.png",
			"/placeholder/executive-apartment-suite-modern.jpg",
			"/placeholder/waterfront-apartment-with-harbor-view.jpg",
			"/placeholder/modern-tech-apartment-smart-home.jpg",
		],
		amenities: ["Pool", "Gym", "Doorman", "Parking", "Balcony"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 4200,
	},
	{
		id: 10,
		title: "Cozy Cottage",
		address: "444 Garden Lane, Quiet Neighborhood",
		price: 2200,
		bedrooms: 2,
		bathrooms: 1,
		sqft: 900,
		rating: 4.5,
		reviews: 22,
		images: ["/placeholder/cozy-cottage-garden.png", "/placeholder/garden-apartment-patio.png"],
		amenities: ["Pet Friendly", "Yard", "Parking"],
		available: "Jan 1st",
		leaseTerms: "12+ months",
		deposit: 2200,
	},
	{
		id: 11,
		title: "Urban Studio",
		address: "555 City Center, Downtown Core",
		price: 1900,
		bedrooms: 0,
		bathrooms: 1,
		sqft: 550,
		rating: 4.3,
		reviews: 16,
		images: [
			"/placeholder/urban-studio-apartment-modern.jpg",
			"/placeholder/cozy-studio-apartment.png",
			"/placeholder/minimalist-studio-apartment-clean.jpg",
			"/placeholder/modern-apartment.png",
		],
		amenities: ["Gym", "Laundry", "Rooftop"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 1900,
	},
	{
		id: 12,
		title: "Waterfront Apartment",
		address: "666 Harbor View, Marina District",
		price: 3800,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1500,
		rating: 4.8,
		reviews: 41,
		images: [
			"/placeholder/waterfront-apartment-with-harbor-view.jpg",
			"/placeholder/luxury-city-view-apartment.png",
			"/placeholder/modern-penthouse-city-view.png",
		],
		amenities: ["Pool", "Gym", "Parking", "Balcony"],
		available: "Feb 15th",
		leaseTerms: "12+ months",
		deposit: 3800,
	},
	{
		id: 13,
		title: "Artist Loft",
		address: "777 Creative St, Arts Quarter",
		price: 2500,
		bedrooms: 1,
		bathrooms: 1,
		sqft: 1100,
		rating: 4.7,
		reviews: 33,
		images: [
			"/placeholder/artist-loft-with-high-ceilings.jpg",
			"/placeholder/industrial-loft-apartment-exposed-brick.jpg",
			"/placeholder/vintage-apartment-with-character.jpg",
			"/placeholder/bright-sunny-apartment-large-windows.jpg",
		],
		amenities: ["High Ceilings", "Natural Light", "Storage"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 2500,
	},
	{
		id: 14,
		title: "Family Duplex",
		address: "888 Residential Blvd, Family Area",
		price: 3100,
		bedrooms: 3,
		bathrooms: 2,
		sqft: 1700,
		rating: 4.6,
		reviews: 29,
		images: [
			"/placeholder/family-duplex-with-yard.jpg",
			"/placeholder/spacious-family-home-with-yard.jpg",
			"/placeholder/cozy-cottage-garden.png",
		],
		amenities: ["Pet Friendly", "Yard", "Parking", "Storage"],
		available: "Jan 30th",
		leaseTerms: "12+ months",
		deposit: 3100,
	},
	{
		id: 15,
		title: "Executive Suite",
		address: "999 Business Plaza, Corporate District",
		price: 3600,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1400,
		rating: 4.8,
		reviews: 38,
		images: [
			"/placeholder/executive-apartment-suite-modern.jpg",
			"/placeholder/modern-tech-apartment-smart-home.jpg",
			"/placeholder/luxury-city-view-apartment.png",
			"/placeholder/modern-penthouse-city-view.png",
		],
		amenities: ["Gym", "Doorman", "Parking", "Business Center"],
		available: "Available Now",
		leaseTerms: "12+ months",
		deposit: 3600,
	},
	{
		id: 16,
		title: "Vintage Charm Apartment",
		address: "101 Antique Row, Historic District",
		price: 2300,
		bedrooms: 2,
		bathrooms: 1,
		sqft: 1050,
		rating: 4.4,
		reviews: 25,
		images: [
			"/placeholder/vintage-apartment-with-character.jpg",
			"/placeholder/historic-brownstone-apartment.jpg",
		],
		amenities: ["Hardwood Floors", "Original Details", "Parking"],
		available: "Dec 30th",
		leaseTerms: "12+ months",
		deposit: 2300,
	},
	{
		id: 17,
		title: "Tech Hub Apartment",
		address: "202 Innovation Dr, Tech District",
		price: 3300,
		bedrooms: 2,
		bathrooms: 2,
		sqft: 1350,
		rating: 4.7,
		reviews: 44,
		images: [
			"/placeholder/modern-tech-apartment-smart-home.jpg",
			"/placeholder/executive-apartment-suite-modern.jpg",
			"/placeholder/modern-apartment.png",
			"/placeholder/luxury-city-view-apartment.png",
		],
		amenities: ["Smart Home", "Gym", "Parking", "High-Speed Internet"],
		available: "Available Now",
		leaseTerms: "6+ months",
		deposit: 3300,
	},
	{
		id: 18,
		title: "Minimalist Studio",
		address: "303 Clean St, Modern Quarter",
		price: 2000,
		bedrooms: 0,
		bathrooms: 1,
		sqft: 600,
		rating: 4.5,
		reviews: 19,
		images: [
			"/placeholder/minimalist-studio-apartment-clean.jpg",
			"/placeholder/urban-studio-apartment-modern.jpg",
			"/placeholder/cozy-studio-apartment.png",
		],
		amenities: ["Modern Appliances", "Laundry", "Storage"],
		available: "Jan 10th",
		leaseTerms: "6+ months",
		deposit: 2000,
	},
]

export function ApartmentGrid() {
	const [favorites, setFavorites] = useState<number[]>([])
	const [sortBy, setSortBy] = useState("price-low")
	const [currentPage, setCurrentPage] = useState(1)
	const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({})
	const itemsPerPage = 8

	const toggleFavorite = (id: number) => {
		setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
	}

	const navigateImage = (apartmentId: number, direction: "prev" | "next", totalImages: number) => {
		setCurrentImageIndex((prev) => {
			const current = prev[apartmentId] || 0
			let newIndex
			if (direction === "next") {
				newIndex = current === totalImages - 1 ? 0 : current + 1
			} else {
				newIndex = current === 0 ? totalImages - 1 : current - 1
			}
			return { ...prev, [apartmentId]: newIndex }
		})
	}

	const setImage = (apartmentId: number, index: number) => {
		setCurrentImageIndex((prev) => ({ ...prev, [apartmentId]: index }))
	}

	const sortedApartments = [...apartments].sort((a, b) => {
		switch (sortBy) {
			case "price-low":
				return a.price - b.price
			case "price-high":
				return b.price - a.price
			case "rating":
				return b.rating - a.rating
			case "newest":
				return b.id - a.id
			default:
				return 0
		}
	})

	const totalPages = Math.ceil(sortedApartments.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const currentApartments = sortedApartments.slice(startIndex, endIndex)

	const goToPage = (page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-balance font-semibold text-2xl text-foreground">
						Apartments for Rent in San Francisco
					</h1>
					<p className="mt-1 text-muted-foreground">{apartments.length} apartments available</p>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-sm">Sort by:</span>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-40 border-border">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="price-low">Price: Low to High</SelectItem>
							<SelectItem value="price-high">Price: High to Low</SelectItem>
							<SelectItem value="rating">Highest Rated</SelectItem>
							<SelectItem value="newest">Newest First</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{currentApartments.map((apartment) => {
					const currentIndex = currentImageIndex[apartment.id] || 0
					const currentImage = apartment.images[currentIndex]
					const hasMultipleImages = apartment.images.length > 1
					const showThumbnails = apartment.images.length > 3

					return (
						<Card
							key={apartment.id}
							className="group cursor-pointer overflow-hidden border-0 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
						>
							<div className="relative">
								<div className="flex">
									<div className={`${showThumbnails ? "flex-1" : "w-full"} relative`}>
										<img
											src={currentImage || "/placeholder.svg"}
											alt={apartment.title}
											className="h-96 w-full object-cover transition-transform duration-300"
										/>

										{/* Navigation arrows for multiple images */}
										{hasMultipleImages && (
											<>
												<Button
													variant="ghost"
													size="icon"
													className="-translate-y-1/2 absolute top-1/2 left-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
													onClick={(e) => {
														e.stopPropagation()
														navigateImage(
															apartment.id,
															"prev",
															apartment.images.length,
														)
													}}
												>
													<ChevronLeft className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
													onClick={(e) => {
														e.stopPropagation()
														navigateImage(
															apartment.id,
															"next",
															apartment.images.length,
														)
													}}
												>
													<ChevronRight className="h-4 w-4" />
												</Button>
											</>
										)}

										{/* Image counter */}
										{hasMultipleImages && (
											<div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
												{currentIndex + 1} / {apartment.images.length}
											</div>
										)}
									</div>

									{showThumbnails && (
										<div className="flex h-96 w-24 flex-col">
											{apartment.images.slice(1, 4).map((image, index) => (
												<button
													key={index}
													className={`w-24 flex-1 border-white/20 border-l bg-center bg-cover transition-opacity hover:opacity-80 ${
														currentIndex === index + 1
															? "ring-2 ring-blue-500"
															: ""
													}`}
													style={{ backgroundImage: `url(${image})` }}
													onClick={(e) => {
														e.stopPropagation()
														setImage(apartment.id, index + 1)
													}}
												/>
											))}
										</div>
									)}
								</div>
							</div>

							<CardContent className="space-y-3 p-4">
								<div className="space-y-1">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="text-balance font-medium text-foreground leading-tight dark:text-white">
												{apartment.title}
											</h3>
											<div className="mt-1 flex items-center gap-1 text-gray-800 text-sm dark:text-gray-200">
												<MapPin className="h-3 w-3" />
												{apartment.address}
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="ml-2 flex-shrink-0 rounded-full bg-gray-50 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
											onClick={(e) => {
												e.stopPropagation()
												toggleFavorite(apartment.id)
											}}
										>
											<Heart
												className={`h-4 w-4 ${
													favorites.includes(apartment.id)
														? "fill-red-500 text-red-500"
														: "text-gray-600 dark:text-gray-300"
												}`}
											/>
										</Button>
									</div>
								</div>

								<div className="flex items-center gap-4 text-gray-700 text-sm dark:text-gray-300">
									<div className="flex items-center gap-1">
										<Bed className="h-4 w-4" />
										{apartment.bedrooms === 0 ? "Studio" : `${apartment.bedrooms} bed`}
									</div>
									<div className="flex items-center gap-1">
										<Bath className="h-4 w-4" />
										{apartment.bathrooms} bath
									</div>
									<div className="flex items-center gap-1">
										<Square className="h-4 w-4" />
										{apartment.sqft} sqft
									</div>
								</div>

								<div className="space-y-2 pt-1">
									<div className="flex items-center justify-between">
										<div>
											<span className="font-semibold text-foreground text-lg dark:text-white">
												${apartment.price.toLocaleString()}
											</span>
											<span className="text-gray-700 text-sm dark:text-gray-300">
												{" "}
												/ month
											</span>
										</div>
										<Badge
											variant="outline"
											className="border-border text-xs dark:border-gray-600 dark:text-gray-200"
										>
											{apartment.available}
										</Badge>
									</div>
									<div className="flex items-center justify-between text-gray-600 text-xs dark:text-gray-400">
										<span>Lease: {apartment.leaseTerms}</span>
										<span>Deposit: ${apartment.deposit.toLocaleString()}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 pt-8">
					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						className="flex items-center gap-1"
					>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>

					<div className="flex items-center gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => goToPage(page)}
								className="h-10 w-10"
							>
								{page}
							</Button>
						))}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="flex items-center gap-1"
					>
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	)
}
