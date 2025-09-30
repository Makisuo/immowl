import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { Filter, Plus, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { SearchProfileWizardModal } from "~/components/saved-searches/SearchProfileWizardModal"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
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

	// Get initial values from existing search
	const initialValues = useMemo(() => {
		if (existingSearch) {
			const criteria = existingSearch.criteria || existingSearch
			return {
				name: existingSearch.name || "",
				description: existingSearch.description || "",
				city: criteria.city || "",
				country: criteria.country || "",
				propertyType: criteria.propertyType as PropertyType | undefined,
				minPrice: criteria.minPrice as number | undefined,
				maxPrice: criteria.maxPrice as number | undefined,
				bedrooms: criteria.bedrooms as number | undefined,
				bathrooms: criteria.bathrooms as number | undefined,
				minSquareMeters: criteria.minSquareMeters as number | undefined,
				maxSquareMeters: criteria.maxSquareMeters as number | undefined,
				amenities: (criteria.amenities || []) as string[],
				petFriendly: criteria.petFriendly as boolean | undefined,
				furnished: criteria.furnished as boolean | undefined,
			}
		}
		return {
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
		}
	}, [existingSearch])

	// TanStack Form
	const form = useForm({
		defaultValues: initialValues,
		onSubmit: async ({ value }) => {
			try {
				await updateSavedSearch.mutateAsync({
					searchId: existingSearch._id,
					name: value.name,
					description: value.description,
					city: value.city,
					country: value.country,
					propertyType: value.propertyType,
					minPrice: value.minPrice,
					maxPrice: value.maxPrice,
					bedrooms: value.bedrooms,
					bathrooms: value.bathrooms,
					amenities: value.amenities,
					petFriendly: value.petFriendly,
					furnished: value.furnished,
					weights: existingSearch?.criteria?.weights || existingSearch?.weights,
				})
				toast.success("Profile saved successfully")
			} catch (e) {
				console.error(e)
				toast.error("Failed to save profile")
			}
		},
	})

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

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* Header */}
			<div className="mb-12">
				<div className="flex items-center gap-3">
					<Filter className="h-6 w-6 text-blue-600" />
					<div>
						<h1 className="font-light text-2xl tracking-tight sm:text-3xl">Search Profile</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							{existingSearch
								? "Your personalized search preferences for finding properties"
								: "Create your search profile to find the perfect property"}
						</p>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="space-y-4">
					{/* Profile Completion Skeleton */}
					<Card className="animate-pulse">
						<CardContent className="pt-6">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-4 w-32 rounded bg-muted"></div>
										<div className="h-3 w-48 rounded bg-muted"></div>
									</div>
									<div className="h-8 w-12 rounded bg-muted"></div>
								</div>
								<div className="h-2 rounded-full bg-muted"></div>
							</div>
						</CardContent>
					</Card>

					{/* Form Sections Skeleton */}
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-6 w-1/3 rounded bg-muted"></div>
								<div className="mt-2 h-4 w-2/3 rounded bg-muted"></div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="h-10 rounded bg-muted"></div>
										<div className="h-10 rounded bg-muted"></div>
									</div>
									<div className="h-10 rounded bg-muted"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

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
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="space-y-16 pb-28"
				>
					{/* Profile Completion - Sticky */}
					<form.Subscribe
						selector={(state) => state.values}
						children={(values) => {
							const completion = calculateProfileCompletion({ ...existingSearch, ...values })
							return (
								<section className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-6 pt-8 backdrop-blur-sm sm:-mx-0 sm:px-0">
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
							)
						}}
					/>

					<div className="border-border/50 border-t" />

					{/* Basic Information */}
					<section className="space-y-8">
						<div className="space-y-1">
							<h2 className="font-light text-2xl tracking-tight">About You</h2>
							<p className="text-muted-foreground text-sm">Let's start with the basics</p>
						</div>

						<div className="space-y-6">
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="name" className="font-normal text-sm">
											Full Name
										</Label>
										<Input
											id="name"
											placeholder="Enter your name"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="border-border/50 transition-colors focus:border-primary"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="description">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="description" className="font-normal text-sm">
											Tell us about yourself
										</Label>
										<Textarea
											id="description"
											placeholder="Share a bit about your lifestyle, work, or what you're looking for..."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											rows={4}
											className="resize-none border-border/50 transition-colors focus:border-primary"
										/>
									</div>
								)}
							</form.Field>
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
							<form.Field name="city">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="city" className="font-normal text-sm">
											City
										</Label>
										<Input
											id="city"
											placeholder="e.g., Berlin"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="border-border/50 transition-colors focus:border-primary"
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="country">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="country" className="font-normal text-sm">
											Country
										</Label>
										<Input
											id="country"
											placeholder="e.g., Germany"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											className="border-border/50 transition-colors focus:border-primary"
										/>
									</div>
								)}
							</form.Field>
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
							<form.Field name="minPrice">
								{(field) => (
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
												value={field.state.value || ""}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number.parseInt(e.target.value) : undefined,
													)
												}
												onBlur={field.handleBlur}
												className="border-border/50 pl-7 transition-colors focus:border-primary"
											/>
										</div>
									</div>
								)}
							</form.Field>

							<form.Field name="maxPrice">
								{(field) => (
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
												value={field.state.value || ""}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number.parseInt(e.target.value) : undefined,
													)
												}
												onBlur={field.handleBlur}
												className="border-border/50 pl-7 transition-colors focus:border-primary"
											/>
										</div>
									</div>
								)}
							</form.Field>
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
							<form.Field name="propertyType">
								{(field) => (
									<div className="space-y-4">
										<Label className="font-normal text-sm">Property Type</Label>
										<RadioGroup
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as PropertyType)}
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
								)}
							</form.Field>

							<div className="grid gap-8 md:grid-cols-2">
								<form.Field name="bedrooms">
									{(field) => (
										<div className="space-y-4">
											<Label className="font-normal text-sm">Bedrooms</Label>
											<RadioGroup
												value={field.state.value?.toString()}
												onValueChange={(value) => field.handleChange(Number.parseInt(value))}
												className="flex gap-3"
											>
												{[1, 2, 3, 4, 5].map((num) => (
													<label
														key={num}
														className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border border-border/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
													>
														<RadioGroupItem
															value={num.toString()}
															id={`bed-${num}`}
															className="sr-only"
														/>
														<span className="font-medium text-sm">{num}+</span>
													</label>
												))}
											</RadioGroup>
										</div>
									)}
								</form.Field>

								<form.Field name="bathrooms">
									{(field) => (
										<div className="space-y-4">
											<Label className="font-normal text-sm">Bathrooms</Label>
											<RadioGroup
												value={field.state.value?.toString()}
												onValueChange={(value) => field.handleChange(Number.parseInt(value))}
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
									)}
								</form.Field>
							</div>

							<div className="grid gap-6 md:grid-cols-2">
								<form.Field name="minSquareMeters">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="minSqm" className="font-normal text-sm">
												Minimum Size (m²)
											</Label>
											<Input
												id="minSqm"
												type="number"
												placeholder="40"
												value={field.state.value || ""}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number.parseInt(e.target.value) : undefined,
													)
												}
												onBlur={field.handleBlur}
												className="border-border/50 transition-colors focus:border-primary"
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="maxSquareMeters">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="maxSqm" className="font-normal text-sm">
												Maximum Size (m²)
											</Label>
											<Input
												id="maxSqm"
												type="number"
												placeholder="120"
												value={field.state.value || ""}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number.parseInt(e.target.value) : undefined,
													)
												}
												onBlur={field.handleBlur}
												className="border-border/50 transition-colors focus:border-primary"
											/>
										</div>
									)}
								</form.Field>
							</div>

							<div className="grid gap-6 md:grid-cols-2">
								<form.Field name="petFriendly">
									{(field) => (
										<div className="space-y-4">
											<Label className="font-normal text-sm">Pet Friendly</Label>
											<RadioGroup
												value={field.state.value?.toString()}
												onValueChange={(value) => field.handleChange(value === "true")}
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
									)}
								</form.Field>

								<form.Field name="furnished">
									{(field) => (
										<div className="space-y-4">
											<Label className="font-normal text-sm">Furnished</Label>
											<RadioGroup
												value={field.state.value?.toString()}
												onValueChange={(value) => field.handleChange(value === "true")}
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
									)}
								</form.Field>
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

						<form.Field name="amenities">
							{(field) => (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{AMENITIES.map((amenity) => (
										<label
											key={amenity}
											className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent/30 hover:border-primary/50"
										>
											<Checkbox
												id={amenity}
												checked={field.state.value.includes(amenity)}
												onCheckedChange={() => {
													const current = field.state.value
													const isSelected = current.includes(amenity)
													field.handleChange(
														isSelected
															? current.filter((a: string) => a !== amenity)
															: [...current, amenity],
													)
												}}
											/>
											<span className="text-sm">{amenity}</span>
										</label>
									))}
								</div>
							)}
						</form.Field>
					</section>

					{/* Submit Buttons */}
					<div className="fixed bottom-0 left-0 right-0 z-20 flex justify-end gap-4 border-t border-border/50 bg-background/95 p-4 backdrop-blur-sm">
						<div className="container mx-auto max-w-4xl">
							<div className="flex justify-end">
								<Button type="submit" size="lg" className="font-normal shadow-lg">
									Save Profile
								</Button>
							</div>
						</div>
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

