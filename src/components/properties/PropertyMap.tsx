import { AlertCircle, Loader2, MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useMapKit } from "~/hooks/use-mapkit"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

interface PropertyMapProps {
	latitude?: number | null
	longitude?: number | null
	address: {
		street: string
		city: string
		state?: string | null
		zipCode?: string | null
	}
	title: string
	className?: string
}

export function PropertyMap({ latitude, longitude, address, title, className = "" }: PropertyMapProps) {
	const mapRef = useRef<HTMLDivElement>(null)
	const mapInstanceRef = useRef<any>(null)
	const [mapError, setMapError] = useState<string | null>(null)
	const [isMapReady, setIsMapReady] = useState(false)

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

	useEffect(() => {
		// Only initialize if we have coordinates and MapKit is loaded
		if (!isLoaded || !mapkit || !mapRef.current || !latitude || !longitude) {
			return
		}

		// Avoid re-initializing if map already exists
		if (mapInstanceRef.current) {
			return
		}

		try {
			// Create coordinate from latitude and longitude
			const coordinate = new mapkit.Coordinate(latitude, longitude)

			// Create the map
			const map = new mapkit.Map(mapRef.current, {
				center: coordinate,
				region: new mapkit.CoordinateRegion(
					coordinate,
					new mapkit.CoordinateSpan(0.01, 0.01), // Zoom level
				),
				showsCompass: mapkit.FeatureVisibility.Adaptive,
				showsMapTypeControl: false,
				showsZoomControl: true,
				showsUserLocation: false,
				colorScheme: mapkit.Map.ColorSchemes.Light,
			})

			// Create a marker annotation for the property
			const marker = new mapkit.MarkerAnnotation(coordinate, {
				title: title,
				subtitle: `${address.street}, ${address.city}`,
				color: "#ef4444", // Red color for the pin
				glyphText: "🏠",
			})

			// Add the marker to the map
			map.addAnnotation(marker)

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
	}, [isLoaded, mapkit, latitude, longitude, title, address])

	// Don't render anything if no coordinates
	if (!latitude || !longitude) {
		console.log("No coordinates")
		return null
	}

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
	if (!isLoaded) {
		return (
			<Card className={className}>
				<CardContent className="p-0">
					<div className="relative h-[400px] w-full rounded-lg bg-muted">
						<div className="flex h-full items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={"overflow-hidden p-0"}>
			<CardContent className="p-0">
				<div className="relative">
					{/* Map container */}
					<div ref={mapRef} className="h-[400px] w-full rounded-lg" />

					{/* Loading overlay while map initializes */}
					{!isMapReady && (
						<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/50">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}

					{/* Address overlay */}
					<div className="pointer-events-none absolute top-4 right-4 left-4">
						<div className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">
								{address.street}, {address.city}
								{address.state && `, ${address.state}`}
								{address.zipCode && ` ${address.zipCode}`}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Skeleton component for loading state
export function PropertyMapSkeleton({ className = "" }: { className?: string }) {
	return (
		<Card className={className}>
			<CardContent className="p-0">
				<Skeleton className="h-[400px] w-full rounded-lg" />
			</CardContent>
		</Card>
	)
}
