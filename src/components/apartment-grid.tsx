"use client"

import { Link } from "@tanstack/react-router"
import type { Id } from "convex/_generated/dataModel"
import { Bath, Bed, ChevronLeft, ChevronRight, Heart, Loader2, MapPin, Square } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { AnimatedGroup } from "~/components/ui/animated-group"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"

interface Property {
	_id: Id<"properties">
	title: string
	address: string
	city: string
	state: string
	zipCode: string
	monthlyRent: number
	rooms: {
		bedrooms: number
		bathrooms: number
	}
	squareMeters: number
	imageUrls?: string[]
	amenities?: string[]
	availableFrom?: number
	minimumLease?: number
	deposit?: number
	propertyType: "apartment" | "house" | "condo" | "townhouse" | "studio"
}

interface ApartmentGridProps {
	properties: Property[]
	isLoading?: boolean
	isLoadingMore?: boolean
	sortBy: "price-low" | "price-high" | "newest" | "available"
	onSortChange: (value: "price-low" | "price-high" | "newest" | "available") => void
	canLoadMore: boolean
	loadMore: () => void
}

export function ApartmentGrid({
	properties,
	isLoading,
	isLoadingMore,
	sortBy,
	onSortChange,
	canLoadMore,
	loadMore,
}: ApartmentGridProps) {
	const [favorites, setFavorites] = useState<string[]>([])
	const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})

	const toggleFavorite = (id: string) => {
		setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
	}

	const navigateImage = (apartmentId: string, direction: "prev" | "next", totalImages: number) => {
		setCurrentImageIndex((prev) => {
			const current = prev[apartmentId] || 0
			let newIndex: number
			if (direction === "next") {
				newIndex = current === totalImages - 1 ? 0 : current + 1
			} else {
				newIndex = current === 0 ? totalImages - 1 : current - 1
			}
			return { ...prev, [apartmentId]: newIndex }
		})
	}

	const setImage = (apartmentId: string, index: number) => {
		setCurrentImageIndex((prev) => ({ ...prev, [apartmentId]: index }))
	}

	// Convert properties to display format
	const apartments = properties.map((property) => ({
		id: property._id,
		title: property.title,
		address: property.address,
		city: property.city,
		state: property.state,
		zipCode: property.zipCode,
		price: property.monthlyRent,
		bedrooms: property.rooms.bedrooms,
		bathrooms: property.rooms.bathrooms,
		sqft: Math.round(property.squareMeters * 10.764), // Convert square meters to sqft
		images: property.imageUrls || [],
		amenities: property.amenities || [],
		available: property.availableFrom
			? property.availableFrom <= Date.now()
				? "Available Now"
				: new Date(property.availableFrom).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})
			: "Available Now",
		leaseTerms: property.minimumLease ? `${property.minimumLease}+ months` : "Flexible",
		deposit: property.deposit || property.monthlyRent,
	}))

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-sm">Sort by:</span>
					<Select value={sortBy} onValueChange={(value) => onSortChange(value as any)}>
						<SelectTrigger className="w-40 border-border">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="price-low">Price: Low to High</SelectItem>
							<SelectItem value="price-high">Price: High to Low</SelectItem>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="available">Available Soon</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{[...Array(6)].map((_, index) => (
						<Card
							key={`skeleton-${index}`}
							className="overflow-hidden border-0 bg-white shadow-sm dark:bg-gray-800"
						>
							<div className="relative">
								<Skeleton className="h-96 w-full rounded-none" />
							</div>
							<CardContent className="space-y-3 p-4">
								<div className="space-y-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</div>
								<div className="flex items-center gap-4">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="space-y-2 pt-1">
									<div className="flex items-center justify-between">
										<Skeleton className="h-6 w-24" />
										<Skeleton className="h-5 w-20 rounded-full" />
									</div>
									<div className="flex items-center justify-between">
										<Skeleton className="h-3 w-24" />
										<Skeleton className="h-3 w-28" />
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : apartments.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12">
					<p className="text-lg text-muted-foreground">No properties found</p>
					<p className="mt-2 text-muted-foreground text-sm">Try adjusting your search filters</p>
				</div>
			) : (
				<AnimatedGroup
					preset="blur-slide"
					className="grid grid-cols-1 gap-8 lg:grid-cols-2"
					variants={{
						container: {
							visible: {
								transition: {
									staggerChildren: 0.08,
									delayChildren: 0.1,
								},
							},
						},
						item: {
							hidden: {
								opacity: 0,
								y: 30,
								filter: "blur(8px)",
							},
							visible: {
								opacity: 1,
								y: 0,
								filter: "blur(0px)",
								transition: {
									duration: 0.5,
									ease: "easeOut",
								},
							},
						},
					}}
				>
					{apartments.map((apartment) => {
						const currentIndex = currentImageIndex[apartment.id] || 0
						const currentImage = apartment.images[currentIndex]
						const hasMultipleImages = apartment.images.length > 1
						const showThumbnails = apartment.images.length > 3

						return (
							<motion.div
								key={apartment.id}
								whileHover={{
									scale: 1.02,
									transition: { duration: 0.2 },
								}}
								whileInView={{
									opacity: 1,
									y: 0,
									filter: "blur(0px)",
								}}
								initial={{
									opacity: 0,
									y: 20,
									filter: "blur(4px)",
								}}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.4, ease: "easeOut" }}
							>
								<Link
									to="/property/$propertyId"
									params={{ propertyId: apartment.id }}
									className="block"
								>
									<Card className="group h-full cursor-pointer overflow-hidden border-0 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
										<div className="relative">
											<div className="flex">
												<div
													className={`${showThumbnails ? "flex-1" : "w-full"} relative`}
												>
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
																className="-translate-y-1/2 absolute top-1/2 left-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
																onClick={(e) => {
																	e.preventDefault()
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
																className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
																onClick={(e) => {
																	e.preventDefault()
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
																type="button"
																key={index}
																className={`w-24 flex-1 border-white/20 border-l bg-center bg-cover transition-opacity hover:opacity-80 ${
																	currentIndex === index + 1
																		? "ring-2 ring-accent"
																		: ""
																}`}
																style={{ backgroundImage: `url(${image})` }}
																onClick={(e) => {
																	e.preventDefault()
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
															{apartment.address}, {apartment.city}
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="ml-2 flex-shrink-0 rounded-full bg-gray-50 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
														onClick={(e) => {
															e.preventDefault()
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
													{apartment.bedrooms === 0
														? "Studio"
														: `${apartment.bedrooms} bed`}
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
													<span>
														Deposit: ${apartment.deposit.toLocaleString()}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						)
					})}
				</AnimatedGroup>
			)}

			{canLoadMore && (
				<motion.div
					className="flex items-center justify-center pt-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					<Button
						variant="outline"
						size="lg"
						onClick={loadMore}
						className="px-8"
						disabled={isLoadingMore}
					>
						{isLoadingMore ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</>
						) : (
							"Show More"
						)}
					</Button>
				</motion.div>
			)}
		</div>
	)
}
