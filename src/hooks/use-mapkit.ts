import { useEffect, useState } from "react"

declare global {
	interface Window {
		mapkit: any
	}
}

interface UseMapKitOptions {
	onLoad?: () => void
	onError?: (error: Error) => void
}

export function useMapKit({ onLoad, onError }: UseMapKitOptions = {}) {
	const [isLoaded, setIsLoaded] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		// Only run on client side
		if (typeof window === "undefined") {
			return
		}

		// Check if MapKit is already loaded
		if (window.mapkit?.Map) {
			setIsLoaded(true)
			onLoad?.()
			return
		}

		// Function to initialize MapKit after script loads
		const initializeMapKit = async () => {
			try {
				// Get Convex URL from environment variable
				const convexUrl = import.meta.env.VITE_CONVEX_SITE_URL
				if (!convexUrl) {
					throw new Error("Convex URL not configured")
				}

				// Fetch JWT token from our backend
				const tokenUrl = new URL("/mapkit-token", convexUrl)
				const response = await fetch(tokenUrl.toString())

				if (!response.ok) {
					throw new Error("Failed to fetch MapKit token")
				}

				const { token } = await response.json()

				// Initialize MapKit with the token
				window.mapkit.init({
					authorizationCallback: (done: (token: string) => void) => {
						done(token)
					},
					language: "en",
				})

				setIsLoaded(true)
				onLoad?.()
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to initialize MapKit")
				setError(error)
				onError?.(error)
			}
		}

		// Load MapKit JS script
		const script = document.createElement("script")
		script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
		script.crossOrigin = "anonymous"
		script.async = true

		// Set up event listeners
		script.addEventListener("load", initializeMapKit)

		script.addEventListener("error", () => {
			const error = new Error("Failed to load MapKit script")
			setError(error)
			onError?.(error)
		})

		document.head.appendChild(script)

		// Cleanup
		return () => {
			script.removeEventListener("load", initializeMapKit)
			// Note: We don't remove the script as it might be used by other components
		}
	}, [onLoad, onError])

	return { isLoaded, error, mapkit: typeof window !== "undefined" ? window.mapkit : undefined }
}
