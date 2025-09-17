"use client"

import { Bath, Bed, Heart, LogOut, MapPin, Square, Star } from "lucide-react"
import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useAuth } from "~/hooks/use-auth"

// Mock apartment data
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
		image: "/modern-apartment.png",
		amenities: ["Pet Friendly", "Gym", "Parking"],
		available: "Available Now",
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
		image: "/cozy-studio-apartment.png",
		amenities: ["Laundry", "Balcony"],
		available: "Dec 1st",
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
		image: "/luxury-city-view-apartment.png",
		amenities: ["Pool", "Doorman", "Gym", "Parking"],
		available: "Available Now",
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
		image: "/garden-apartment-patio.png",
		amenities: ["Pet Friendly", "Parking", "Balcony"],
		available: "Jan 15th",
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
		image: "/industrial-loft-apartment-exposed-brick.jpg",
		amenities: ["Gym", "Laundry", "Air Conditioning"],
		available: "Available Now",
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
		image: "/bright-sunny-apartment-large-windows.jpg",
		amenities: ["Pool", "Parking", "Dishwasher"],
		available: "Feb 1st",
	},
]

export function ApartmentGrid() {
	const [favorites, setFavorites] = useState<number[]>([])
	const [sortBy, setSortBy] = useState("price-low")
	const router = useRouter()
	const { user, signOut } = useAuth()

	const toggleFavorite = (id: number) => {
		setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
	}

	const handleSignOut = async () => {
		await signOut()
		router.navigate({ to: "/sign-in" })
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-4">
					{user && (
						<span className="text-sm text-muted-foreground">
							Welcome, {user.name || user.email}
						</span>
					)}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleSignOut}
					className="flex items-center gap-2"
				>
					<LogOut className="h-4 w-4" />
					Sign Out
				</Button>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-balance font-semibold text-2xl text-foreground">
						Stay in San Francisco
					</h1>
					<p className="mt-1 text-muted-foreground">{apartments.length} stays</p>
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

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{sortedApartments.map((apartment) => (
					<Card
						key={apartment.id}
						className="group cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
					>
						<div className="relative">
							<img
								src={apartment.image || "/placeholder.svg"}
								alt={apartment.title}
								className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							/>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-3 right-3 rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
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

						<CardContent className="space-y-3 p-4">
							<div className="space-y-1">
								<div className="flex items-start justify-between">
									<h3 className="text-balance font-medium text-foreground leading-tight dark:text-white">
										{apartment.title}
									</h3>
									<div className="ml-2 flex items-center gap-1">
										<Star className="h-3 w-3 fill-black text-black dark:fill-white dark:text-white" />
										<span className="font-medium text-sm dark:text-white">
											{apartment.rating}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-1 text-gray-800 text-sm dark:text-gray-200">
									<MapPin className="h-3 w-3" />
									{apartment.address}
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

							<div className="flex items-center justify-between pt-1">
								<div>
									<span className="font-semibold text-foreground text-lg dark:text-white">
										${apartment.price.toLocaleString()}
									</span>
									<span className="text-gray-700 text-sm dark:text-gray-300"> / month</span>
								</div>
								<Badge
									variant="outline"
									className="border-border text-xs dark:border-gray-600 dark:text-gray-200"
								>
									{apartment.available}
								</Badge>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex justify-center pt-8">
				<Button
					variant="outline"
					size="lg"
					className="rounded-lg border-2 border-foreground bg-transparent px-8 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-900"
				>
					Show more
				</Button>
			</div>
		</div>
	)
}
