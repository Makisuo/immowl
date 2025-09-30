import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { Plus, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { SearchProfileWizardModal } from "~/components/saved-searches/SearchProfileWizardModal"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { calculateProfileCompletion } from "~/lib/profile-utils"

const AMENITIES = [
	"Pool",
	"Gym",
	"Parking",
	"Concierge Service",
	"Balcony",
	"Air Conditioning",
	"Heating",
	"Laundry",
	"Dishwasher",
	"Elevator",
	"Security",
	"Storage",
]

type PropertyType = "apartment" | "house" | "condo" | "studio" | "townhouse"

export const Route = createFileRoute("/_app/_authed/search-profile")({
	component: SearchRequestsPage,
})

function SearchRequestsPage() {
	const [isModalOpen, setIsModalOpen] = useState(false)

	const { data, isLoading, error } = useQuery(
		convexQuery(api.savedSearches.listUserSavedSearches, {
			paginationOpts: { numItems: 1, cursor: null },
		}),
	)

	const existingSearch = data?.page?.[0] as any | undefined

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearchFromWizard),
	})
	const updateSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.updateSavedSearch),
	})

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		city: "",
		country: "",
		propertyType: undefined as PropertyType | undefined,
		minPrice: undefined as number | undefined,
		maxPrice: undefined as number | undefined,
		bedrooms: undefined as number | undefined,
		bathrooms: undefined as number | undefined,
		minSquareMeters: undefined as number | undefined,
		maxSquareMeters: undefined as number | undefined,
		amenities: [] as string[],
		petFriendly: undefined as boolean | undefined,
		furnished: undefined as boolean | undefined,
	})

	// Initialize form data when existingSearch loads
	useEffect(() => {
		if (existingSearch) {
			const criteria = existingSearch.criteria || existingSearch
			setFormData({
				name: existingSearch.name || "",
				description: existingSearch.description || "",
				city: criteria.city || "",
				country: criteria.country || "",
				propertyType: criteria.propertyType,
				minPrice: criteria.minPrice,
				maxPrice: criteria.maxPrice,
				bedrooms: criteria.bedrooms,
				bathrooms: criteria.bathrooms,
				minSquareMeters: criteria.minSquareMeters,
				maxSquareMeters: criteria.maxSquareMeters,
				amenities: criteria.amenities || [],
				petFriendly: criteria.petFriendly,
				furnished: criteria.furnished,
			})
		}
	}, [existingSearch])

	const handleModalSubmit = async (payload: any) => {
		try {
			if (existingSearch?._id) {
				// Map nested payload from wizard to flat update args
				await updateSavedSearch.mutateAsync({
					searchId: existingSearch._id,
					name: payload.name,
					description: payload.description,
					city: payload.criteria.city,
					country: payload.criteria.country,
					propertyType: payload.criteria.propertyType,
					minPrice: payload.criteria.minPrice,
					maxPrice: payload.criteria.maxPrice,
					bedrooms: payload.criteria.bedrooms,
					bathrooms: payload.criteria.bathrooms,
					amenities: payload.criteria.amenities,
					petFriendly: payload.criteria.petFriendly,
					furnished: payload.criteria.furnished,
					weights: payload.criteria.weights,
				})
				toast.success("Search profile updated")
			} else {
				await createSavedSearch.mutateAsync(payload)
				toast.success("Search profile created")
			}
		} catch (e) {
			console.error(e)
			toast.error("Failed to save search profile")
		}
	}

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			await updateSavedSearch.mutateAsync({
				searchId: existingSearch._id,
				name: formData.name,
				description: formData.description,
				city: formData.city,
				country: formData.country,
				propertyType: formData.propertyType,
				minPrice: formData.minPrice,
				maxPrice: formData.maxPrice,
				bedrooms: formData.bedrooms,
				bathrooms: formData.bathrooms,
				amenities: formData.amenities,
				petFriendly: formData.petFriendly,
				furnished: formData.furnished,
				weights: existingSearch?.criteria?.weights || existingSearch?.weights,
			})
			toast.success("Profile saved successfully")
		} catch (e) {
			console.error(e)
			toast.error("Failed to save profile")
		}
	}

	const toggleAmenity = (amenity: string) => {
		setFormData((prev) => ({
			...prev,
			amenities: prev.amenities.includes(amenity)
				? prev.amenities.filter((a) => a !== amenity)
				: [...prev.amenities, amenity],
		}))
	}

	const completion = calculateProfileCompletion({ ...existingSearch, ...formData })

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* Header */}
			<div className="mb-12">
				<div className="space-y-1">
					<h1 className="font-light text-3xl tracking-tight">Search Profile</h1>
					<p className="text-muted-foreground text-sm">
						{existingSearch
							? "Your personalized search preferences for finding properties"
							: "Create your search profile to find the perfect property"}
					</p>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && <div className="text-muted-foreground text-sm">Loading your search profile...</div>}

			{/* Error State */}
			{error && <div className="text-destructive text-sm">Failed to load your search profile.</div>}

			{/* Empty State */}
			{!isLoading && !error && !existingSearch && (
				<Card className="mx-auto max-w-2xl">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<div className="mb-4 rounded-full bg-blue-50 p-4">
							<Sparkles className="h-8 w-8 text-blue-600" />
						</div>
						<h3 className="mb-2 font-semibold text-lg">No Search Profile Yet</h3>
						<p className="mb-6 text-muted-foreground text-sm">
							Create your search profile to get personalized property matches and notifications.
						</p>
						<Button onClick={() => setIsModalOpen(true)} size="lg">
							<Plus className="mr-2 h-4 w-4" />
							Create Search Profile
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Profile Form */}
			{!isLoading && !error && existingSearch && (
				<form onSubmit={handleFormSubmit} className="space-y-16">
					{/* Profile Completion */}
					<section className="space-y-6">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-sm">Profile Completion</h3>
									<p className="mt-0.5 text-muted-foreground text-xs">
										{completion === 100
											? "Your profile is complete!"
											: "Complete your profile to get better matches"}
									</p>
								</div>
								<div className="font-light text-2xl tabular-nums">{completion}%</div>
							</div>
							<div className="relative h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out"
									style={{ width: `${completion}%` }}
								/>
							</div>
						</div>
					</section>

					<div className="border-border/50 border-t" />

					{/* Basic Information */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">About You</h2>
							<p className="text-muted-foreground text-sm">Let's start with the basics</p>
						</div>

						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="name" className="font-normal text-sm">
									Full Name
								</Label>
								<Input
									id="name"
									placeholder="Enter your name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="border-border/50 transition-colors focus:border-primary"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description" className="font-normal text-sm">
									Tell us about yourself
								</Label>
								<Textarea
									id="description"
									placeholder="Share a bit about your lifestyle, work, or what you're looking for..."
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									rows={4}
									className="resize-none border-border/50 transition-colors focus:border-primary"
								/>
							</div>
						</div>
					</section>

					<div className="border-border/50 border-t" />

					{/* Location */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">Location</h2>
							<p className="text-muted-foreground text-sm">Where would you like to live?</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="city" className="font-normal text-sm">
									City
								</Label>
								<Input
									id="city"
									placeholder="e.g., Berlin"
									value={formData.city}
									onChange={(e) => setFormData({ ...formData, city: e.target.value })}
									className="border-border/50 transition-colors focus:border-primary"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="country" className="font-normal text-sm">
									Country
								</Label>
								<Input
									id="country"
									placeholder="e.g., Germany"
									value={formData.country}
									onChange={(e) => setFormData({ ...formData, country: e.target.value })}
									className="border-border/50 transition-colors focus:border-primary"
								/>
							</div>
						</div>
					</section>

					<div className="border-border/50 border-t" />

					{/* Budget */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">Budget</h2>
							<p className="text-muted-foreground text-sm">What's your monthly rent range?</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="minPrice" className="font-normal text-sm">
									Minimum
								</Label>
								<div className="relative">
									<span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
										€
									</span>
									<Input
										id="minPrice"
										type="number"
										placeholder="500"
										value={formData.minPrice || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												minPrice: e.target.value ? Number.parseInt(e.target.value) : undefined,
											})
										}
										className="border-border/50 pl-7 transition-colors focus:border-primary"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maxPrice" className="font-normal text-sm">
									Maximum
								</Label>
								<div className="relative">
									<span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
										€
									</span>
									<Input
										id="maxPrice"
										type="number"
										placeholder="2000"
										value={formData.maxPrice || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												maxPrice: e.target.value ? Number.parseInt(e.target.value) : undefined,
											})
										}
										className="border-border/50 pl-7 transition-colors focus:border-primary"
									/>
								</div>
							</div>
						</div>
					</section>

					<div className="border-border/50 border-t" />

					{/* Property Details */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">Property Details</h2>
							<p className="text-muted-foreground text-sm">What type of space are you looking for?</p>
						</div>

						<div className="space-y-8">
							<div className="space-y-4">
								<Label className="font-normal text-sm">Property Type</Label>
								<RadioGroup
									value={formData.propertyType}
									onValueChange={(value) =>
										setFormData({ ...formData, propertyType: value as PropertyType })
									}
									className="grid gap-3 md:grid-cols-3"
								>
									{(["apartment", "house", "condo", "studio", "townhouse"] as PropertyType[]).map(
										(type) => (
											<label
												key={type}
												className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
											>
												<RadioGroupItem value={type} id={type} />
												<span className="capitalize text-sm">{type}</span>
											</label>
										),
									)}
								</RadioGroup>
							</div>

							<div className="grid gap-8 md:grid-cols-2">
								<div className="space-y-4">
									<Label className="font-normal text-sm">Bedrooms</Label>
									<RadioGroup
										value={formData.bedrooms?.toString()}
										onValueChange={(value) =>
											setFormData({ ...formData, bedrooms: Number.parseInt(value) })
										}
										className="flex gap-3"
									>
										{[1, 2, 3, 4, 5].map((num) => (
											<label
												key={num}
												className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
											>
												<RadioGroupItem value={num.toString()} id={`bed-${num}`} className="sr-only" />
												<span className="font-medium text-sm">{num}+</span>
											</label>
										))}
									</RadioGroup>
								</div>

								<div className="space-y-4">
									<Label className="font-normal text-sm">Bathrooms</Label>
									<RadioGroup
										value={formData.bathrooms?.toString()}
										onValueChange={(value) =>
											setFormData({ ...formData, bathrooms: Number.parseInt(value) })
										}
										className="flex gap-3"
									>
										{[1, 2, 3, 4].map((num) => (
											<label
												key={num}
												className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
											>
												<RadioGroupItem
													value={num.toString()}
													id={`bath-${num}`}
													className="sr-only"
												/>
												<span className="font-medium text-sm">{num}+</span>
											</label>
										))}
									</RadioGroup>
								</div>
							</div>

							<div className="grid gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="minSqm" className="font-normal text-sm">
										Minimum Size (m²)
									</Label>
									<Input
										id="minSqm"
										type="number"
										placeholder="40"
										value={formData.minSquareMeters || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												minSquareMeters: e.target.value ? Number.parseInt(e.target.value) : undefined,
											})
										}
										className="border-border/50 transition-colors focus:border-primary"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="maxSqm" className="font-normal text-sm">
										Maximum Size (m²)
									</Label>
									<Input
										id="maxSqm"
										type="number"
										placeholder="120"
										value={formData.maxSquareMeters || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												maxSquareMeters: e.target.value ? Number.parseInt(e.target.value) : undefined,
											})
										}
										className="border-border/50 transition-colors focus:border-primary"
									/>
								</div>
							</div>

							<div className="grid gap-6 md:grid-cols-2">
								<div className="space-y-4">
									<Label className="font-normal text-sm">Pet Friendly</Label>
									<RadioGroup
										value={formData.petFriendly?.toString()}
										onValueChange={(value) =>
											setFormData({ ...formData, petFriendly: value === "true" })
										}
										className="flex gap-3"
									>
										<label className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50">
											<RadioGroupItem value="true" id="pet-yes" className="sr-only" />
											<span className="text-sm">Yes</span>
										</label>
										<label className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50">
											<RadioGroupItem value="false" id="pet-no" className="sr-only" />
											<span className="text-sm">No</span>
										</label>
									</RadioGroup>
								</div>

								<div className="space-y-4">
									<Label className="font-normal text-sm">Furnished</Label>
									<RadioGroup
										value={formData.furnished?.toString()}
										onValueChange={(value) =>
											setFormData({ ...formData, furnished: value === "true" })
										}
										className="flex gap-3"
									>
										<label className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50">
											<RadioGroupItem value="true" id="furn-yes" className="sr-only" />
											<span className="text-sm">Yes</span>
										</label>
										<label className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50">
											<RadioGroupItem value="false" id="furn-no" className="sr-only" />
											<span className="text-sm">No</span>
										</label>
									</RadioGroup>
								</div>
							</div>
						</div>
					</section>

					<div className="border-border/50 border-t" />

					{/* Amenities */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">Amenities & Features</h2>
							<p className="text-muted-foreground text-sm">Select what matters to you</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{AMENITIES.map((amenity) => (
								<label
									key={amenity}
									className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
								>
									<Checkbox
										id={amenity}
										checked={formData.amenities.includes(amenity)}
										onCheckedChange={() => toggleAmenity(amenity)}
									/>
									<span className="text-sm">{amenity}</span>
								</label>
							))}
						</div>
					</section>

					{/* Submit Buttons */}
					<div className="flex justify-end gap-4 pt-8">
						<Button type="button" variant="outline" size="lg" className="bg-transparent font-normal">
							Save Draft
						</Button>
						<Button type="submit" size="lg" className="font-normal">
							Save Profile
						</Button>
					</div>
				</form>
			)}

			{/* Wizard Modal */}
			<SearchProfileWizardModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				onComplete={handleModalSubmit}
				initialData={
					existingSearch
						? {
								name: existingSearch.name,
								description: existingSearch.description,
								criteria: existingSearch.criteria ?? {
									city: (existingSearch as any).city,
									country: (existingSearch as any).country,
									propertyType: (existingSearch as any).propertyType,
									minPrice: (existingSearch as any).minPrice,
									bedrooms: (existingSearch as any).bedrooms,
									bathrooms: (existingSearch as any).bathrooms,
									amenities: (existingSearch as any).amenities,
									petFriendly: (existingSearch as any).petFriendly,
									furnished: (existingSearch as any).furnished,
									weights:
										(existingSearch as any).criteria?.weights ?? (existingSearch as any).weights,
								},
							}
						: undefined
				}
			/>
		</div>
	)
}

export default SearchRequestsPage
