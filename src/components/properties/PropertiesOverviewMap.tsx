"use client"

import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useMapKit } from "~/hooks/use-mapkit"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent } from "../ui/card"

interface PropertiesOverviewMapProps {
	city?: string
	className?: string
}

export function PropertiesOverviewMap({ city = "Berlin", className = "" }: PropertiesOverviewMapProps) {
	const mapRef = useRef<HTMLDivElement>(null)
	const mapInstanceRef = useRef<any>(null)
	const [mapError, setMapError] = useState<string | null>(null)
	const [isMapReady, setIsMapReady] = useState(false)
	const navigate = useNavigate()

	const {
		isLoaded,
		error: mapKitError,
		mapkit,
	} = useMapKit({
		onError: (error) => {
			console.error("MapKit loading error:", error)
			setMapError("Failed to load map service")
		},
	})

	// Fetch properties with coordinates
	const { data: properties, isLoading: isLoadingProperties } = useQuery(
		convexQuery(api.properties.getPropertiesForMap, { city }),
	)

	useEffect(() => {
		// Only initialize if we have coordinates, MapKit is loaded, and properties are loaded
		if (!isLoaded || !mapkit || !mapRef.current || !properties || properties.length === 0) {
			return
		}

		// Avoid re-initializing if map already exists
		if (mapInstanceRef.current) {
			return
		}

		try {
			// Calculate center of Berlin (default coordinates)
			const berlinCenter = new mapkit.Coordinate(52.52, 13.405)

			// Create the map
			const map = new mapkit.Map(mapRef.current, {
				center: berlinCenter,
				region: new mapkit.CoordinateRegion(
					berlinCenter,
					new mapkit.CoordinateSpan(0.15, 0.15), // Wider zoom to show more of Berlin
				),
				showsCompass: mapkit.FeatureVisibility.Adaptive,
				showsMapTypeControl: false,
				showsZoomControl: true,
				showsUserLocation: false,
				colorScheme: mapkit.Map.ColorSchemes.Light,
			})

			// Create markers for all properties
			const annotations: any[] = []

			for (const property of properties) {
				const coordinate = new mapkit.Coordinate(
					property.address.latitude,
					property.address.longitude,
				)

				// Calculate rent display
				const rent = property.monthlyRent.warm || property.monthlyRent.cold
				const rentText = rent ? `€${rent.toLocaleString()}/mo` : "Price on request"

				// Create marker annotation
				const marker = new mapkit.MarkerAnnotation(coordinate, {
					title: rentText,
					subtitle: `${property.rooms.bedrooms} bed`,
					color: "#ef4444", // Red color for the pin
					glyphText: "🏠",
					// Add custom data for click handling
					data: {
						propertyId: property._id,
					},
				})

				annotations.push(marker)
			}

			// Add all markers to the map
			map.addAnnotations(annotations)

			// Add click handler for markers
			map.addEventListener("select", (event: any) => {
				const annotation = event.annotation
				if (annotation?.data?.propertyId) {
					// Navigate to property detail page
					navigate({
						to: "/property/$propertyId",
						params: { propertyId: annotation.data.propertyId },
					})
				}
			})

			// Store map instance for cleanup
			mapInstanceRef.current = map
			setIsMapReady(true)
		} catch (error) {
			console.error("Error creating map:", error)
			setMapError("Failed to display map")
		}

		// Cleanup function
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.destroy()
				mapInstanceRef.current = null
			}
		}
	}, [isLoaded, mapkit, properties, navigate])

	// Error state
	if (mapKitError || mapError) {
		return (
			<Card className={className}>
				<CardContent className="pt-6">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>Unable to load map. Please try again later.</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		)
	}

	// Loading state
	if (!isLoaded || isLoadingProperties) {
		return (
			<Card className={className}>
				<CardContent className="p-0">
					<div className="relative h-[500px] w-full rounded-lg bg-muted">
						<div className="flex h-full items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	// No properties with coordinates
	if (!properties || properties.length === 0) {
		return (
			<Card className={className}>
				<CardContent className="pt-6">
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>No properties available to display on the map.</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={"overflow-hidden p-0"}>
			<CardContent className="p-0">
				<div className="relative">
					{/* Map container */}
					<div ref={mapRef} className="h-[500px] w-full rounded-lg" />

					{/* Loading overlay while map initializes */}
					{!isMapReady && (
						<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/50">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}

					{/* Property count overlay */}
					<div className="pointer-events-none absolute top-4 right-4 left-4">
						<div className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
							<span className="font-medium text-sm">
								{properties.length} {properties.length === 1 ? "Property" : "Properties"} in{" "}
								{city}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Skeleton component for loading state
export function PropertiesOverviewMapSkeleton({ className = "" }: { className?: string }) {
	return (
		<Card className={className}>
			<CardContent className="p-0">
				<div className="h-[500px] w-full animate-pulse rounded-lg bg-muted" />
			</CardContent>
		</Card>
	)
}
