"use client"

import { Link } from "@tanstack/react-router"
import { Bath, Bed, ChevronLeft, ChevronRight, Heart, Loader2, MapPin, Square } from "lucide-react"
import { motion } from "motion/react"
import { memo, useCallback, useMemo, useState } from "react"
import type { PropertyCardProps } from "~/types/property"
import { PROPERTY_TYPE_LABELS } from "~/types/property"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { ExternalSourceIndicator } from "./ExternalSourceIndicator"

export const PropertyCard = memo(function PropertyCard({
	property,
	savedDate,
	isSaved = false,
	onToggleSave,
	onImageClick,
}: PropertyCardProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isTogglingSave, setIsTogglingSave] = useState(false)

	// Memoize calculated values
	const propertyTypeLabel = useMemo(
		() => PROPERTY_TYPE_LABELS[property.propertyType],
		[property.propertyType],
	)

	const savedDateStr = useMemo(
		() => (savedDate ? new Date(savedDate).toLocaleDateString() : undefined),
		[savedDate],
	)

	const currentImage = property.imageUrls?.[currentImageIndex]
	const hasMultipleImages = (property.imageUrls?.length || 0) > 1

	// Extract event handlers
	const handleToggleSave = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()

			if (!onToggleSave) return

			setIsTogglingSave(true)
			try {
				await onToggleSave(property._id)
			} catch (error) {
				console.error("Failed to toggle save property:", error)
			} finally {
				setIsTogglingSave(false)
			}
		},
		[onToggleSave, property._id],
	)

	const handleNavigateImage = useCallback(
		(e: React.MouseEvent, direction: "prev" | "next") => {
			e.preventDefault()
			e.stopPropagation()

			const totalImages = property.imageUrls?.length || 1
			setCurrentImageIndex((prev) => {
				if (direction === "next") {
					return prev === totalImages - 1 ? 0 : prev + 1
				}
				return prev === 0 ? totalImages - 1 : prev - 1
			})
		},
		[property.imageUrls?.length],
	)

	const handleImageClick = useCallback(
		(e: React.MouseEvent) => {
			if (onImageClick) {
				e.preventDefault()
				e.stopPropagation()
				onImageClick(currentImageIndex)
			}
		},
		[onImageClick, currentImageIndex],
	)

	const formatRoomCount = useCallback((bedrooms: number) => {
		if (bedrooms === 0) return "Studio"
		return `${bedrooms} bed`
	}, [])

	return (
		<motion.div
			whileHover={{
				scale: 1.02,
				transition: { duration: 0.2 },
			}}
			layout
		>
			<Link to="/property/$propertyId" params={{ propertyId: property._id }} className="block">
				<Card className="group h-full cursor-pointer overflow-hidden border-0 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
					<div className="relative">
						<button
							type="button"
							className="h-40 w-full sm:h-48"
							onClick={handleImageClick}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									handleImageClick(e as any)
								}
							}}
							aria-label={`View image ${currentImageIndex + 1} of ${property.imageUrls?.length || 1}`}
						>
							<img
								src={currentImage || "/placeholder.svg"}
								alt={property.title}
								className="h-full w-full object-cover transition-transform duration-300"
								loading="lazy"
							/>
						</button>

						{/* Navigation arrows for multiple images */}
						{hasMultipleImages && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 left-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
									onClick={(e) => handleNavigateImage(e, "prev")}
									aria-label="Previous image"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 hover:text-white group-hover:opacity-100"
									onClick={(e) => handleNavigateImage(e, "next")}
									aria-label="Next image"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</>
						)}

						{/* Image counter */}
						{hasMultipleImages && (
							<div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-white text-xs">
								{currentImageIndex + 1} / {property.imageUrls?.length || 0}
							</div>
						)}

						{/* Property type badge */}
						<Badge
							variant="secondary"
							className="absolute top-2 left-2 bg-white/90 text-gray-800"
						>
							{propertyTypeLabel}
						</Badge>

						{/* External source indicator */}
						{property.isExternal && property.externalSource && (
							<div className="absolute top-2 right-12 rounded-md bg-white/90 px-2 py-1 shadow-sm">
								<ExternalSourceIndicator
									source={property.externalSource}
									url={property.externalUrl}
									size="sm"
									showText={false}
								/>
							</div>
						)}

						{/* Save/Unsave button */}
						{onToggleSave && (
							<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
								<Button
									variant="ghost"
									size="icon"
									className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:bg-white"
									onClick={handleToggleSave}
									disabled={isTogglingSave}
									aria-label={isSaved ? "Unsave property" : "Save property"}
								>
									{isTogglingSave ? (
										<Loader2 className="h-4 w-4 animate-spin text-gray-600" />
									) : (
										<motion.div
											initial={{ scale: 1 }}
											animate={{ scale: isTogglingSave ? 0.8 : 1 }}
											transition={{ duration: 0.2 }}
										>
											<Heart
												className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-600"}`}
											/>
										</motion.div>
									)}
								</Button>
							</motion.div>
						)}
					</div>

					<CardContent className="space-y-3 p-4">
						<div className="space-y-1">
							<div className="flex items-start justify-between gap-2">
								<h3 className="line-clamp-2 flex-1 font-medium text-foreground leading-tight dark:text-white">
									{property.title}
								</h3>
								{property.isExternal && property.externalSource && (
									<ExternalSourceIndicator
										source={property.externalSource}
										url={property.externalUrl}
										size="sm"
										showText={false}
										className="mt-0.5 flex-shrink-0"
									/>
								)}
							</div>
							<div className="flex items-center gap-1 text-muted-foreground text-sm">
								<MapPin className="h-3 w-3" />
								<span>
									{property.address.street}, {property.address.city}
								</span>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm sm:gap-4">
							<div className="flex items-center gap-1">
								<Bed className="h-4 w-4" aria-hidden="true" />
								<span className="hidden sm:inline">
									{formatRoomCount(property.rooms.bedrooms)}
								</span>
								<span className="sm:hidden">
									{property.rooms.bedrooms === 0 ? "Studio" : property.rooms.bedrooms}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Bath className="h-4 w-4" aria-hidden="true" />
								<span className="hidden sm:inline">{property.rooms.bathrooms} bath</span>
								<span className="sm:hidden">{property.rooms.bathrooms}</span>
							</div>
							<div className="flex items-center gap-1">
								<Square className="h-4 w-4" aria-hidden="true" />
								<span className="hidden sm:inline">{property.squareMeters} m²</span>
							</div>
						</div>

						<div className="flex items-center justify-between pt-1">
							<div>
								<span className="font-semibold text-foreground text-lg dark:text-white">
									$
									{(
										property.monthlyRent.warm ||
										property.monthlyRent.cold ||
										0
									).toLocaleString()}
								</span>
								<span className="text-muted-foreground text-sm">
									{property.monthlyRent.warm
										? " (warm)"
										: property.monthlyRent.cold
											? " (cold)"
											: ""}{" "}
									/ month
								</span>
							</div>
						</div>

						{savedDateStr && (
							<div className="text-muted-foreground text-xs">Saved on {savedDateStr}</div>
						)}
					</CardContent>
				</Card>
			</Link>
		</motion.div>
	)
})
