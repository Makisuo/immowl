import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { SavedSearchWizard } from "~/components/saved-searches/SavedSearchWizard"

export const Route = createFileRoute("/_app/_authed/onboarding")({
	component: OnboardingPage,
})

function OnboardingPage() {
	const navigate = useNavigate()

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearchFromWizard),
	})

	const handleComplete = async (data: {
		criteria: {
			city: string
			country: string
			propertyType?: "apartment" | "house" | "condo" | "townhouse" | "studio"
			minPrice?: number
			maxPrice?: number
			minSquareMeters?: number
			maxSquareMeters?: number
			bedrooms?: number
			bathrooms?: number
			amenities?: string[]
			petFriendly?: boolean
			furnished?: boolean
			weights?: {
				location?: number
				price?: number
				bedrooms?: number
				bathrooms?: number
				amenities?: number
				petFriendly?: number
				furnished?: number
				propertyType?: number
			}
		}
	}) => {
		try {
			await createSavedSearch.mutateAsync({
				criteria: data.criteria,
			})

			toast.success("Welcome! Your search profile has been created.")
			navigate({ to: "/" })
		} catch (error) {
			console.error("Failed to create search profile:", error)
			toast.error("Failed to save your search profile. Please try again.")
		}
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<div className="mb-4 flex justify-center">
					<div className="rounded-full bg-blue-100 p-3">
						<Sparkles className="h-8 w-8 text-blue-600" />
					</div>
				</div>
				<h1 className="mb-2 font-bold text-3xl">Welcome to ImmOwl!</h1>
				<p className="mx-auto max-w-2xl text-muted-foreground">
					Let's set up your apartment preferences to help us find the perfect place for you. This will
					only take a few minutes.
				</p>
			</div>

			{/* Wizard */}
			<div className="mx-auto max-w-3xl">
				<SavedSearchWizard onComplete={handleComplete} />
			</div>
		</div>
	)
}