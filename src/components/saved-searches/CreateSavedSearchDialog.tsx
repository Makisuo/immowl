import { useConvexMutation } from "@convex-dev/react-query"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
import { Slider } from "~/components/ui/slider"
import { toast } from "sonner"
import { useState } from "react"

// TODO: replace mock amenities with actual amenities
// TODO: adjust look and feel to filter menu of search page
// TODO: overall UI fixes

const AMENITIES = [
	"Pet Friendly",
	"Parking Included",
	"Gym/Fitness Center",
	"Swimming Pool",
	"In-Unit Laundry",
	"Balcony/Patio",
	"Air Conditioning",
	"Dishwasher",
	"Elevator",
	"Doorman/Concierge",
	"Storage Unit",
	"Hardwood Floors",
]

const PROPERTY_TYPES = ["apartment", "house", "condo", "townhouse", "studio"] as const

type Props = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateSavedSearchDialog({ open, onOpenChange }: Props) {
	type FormShape = {
		name: string
		description: string
		city: string
		country: string
		propertyType?: (typeof PROPERTY_TYPES)[number] | undefined
		minPrice?: number | undefined
		maxPrice?: number | undefined
		bedrooms?: number | undefined
		bathrooms?: number | undefined
		amenities: string[]
		petFriendly?: boolean | undefined
		furnished?: boolean | undefined
		weights: {
			location: number
			price: number
			bedrooms: number
			bathrooms: number
			amenities: number
			propertyType: number
		}
	}

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearch),
	})

	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			city: "",
			country: "",
			propertyType: undefined,
			minPrice: undefined,
			maxPrice: undefined,
			bedrooms: undefined,
			bathrooms: undefined,
			amenities: [],
			petFriendly: undefined,
			furnished: undefined,
			weights: {
				location: 50,
				price: 50,
				bedrooms: 50,
				bathrooms: 50,
				amenities: 50,
				propertyType: 50,
			},
		} as FormShape,
		onSubmit: async ({ value }) => {
			const v = value as FormShape
			if (!v.name.trim()) {
				toast.error("Please enter a name for your search")
				return
			}
			if (!v.city.trim() || !v.country.trim()) {
				toast.error("City and country are required")
				return
			}

			try {
				await createSavedSearch.mutateAsync({
					name: v.name.trim(),
					description: v.description.trim() || undefined,
					// criteria
					city: v.city.trim(),
					country: v.country.trim(),
					propertyType: v.propertyType,
					minPrice: v.minPrice,
					maxPrice: v.maxPrice,
					bedrooms: v.bedrooms,
					bathrooms: v.bathrooms,
					amenities: selectedAmenities,
					petFriendly: v.petFriendly,
					furnished: v.furnished,
					// grouped weights (booleans handled 0/100 on server)
					weights: {
						location: v.weights.location,
						price: v.weights.price,
						bedrooms: v.weights.bedrooms,
						bathrooms: v.weights.bathrooms,
						amenities: v.weights.amenities,
						propertyType: v.weights.propertyType,
					},
				})
				toast.success("Saved search created")
				onOpenChange(false)
			} catch (e) {
				console.error(e)
				toast.error("Failed to create saved search")
			}
		},
	})

	const toggleAmenity = (a: string) => {
		setSelectedAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
		form.setFieldValue("amenities", (v) => {
			const arr = v ?? []
			return arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]
		})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
				<DialogHeader>
					<DialogTitle>New Search Request</DialogTitle>
					<DialogDescription>
						Define your criteria and how important each is. You can adjust weights for non-boolean
						criteria; boolean options like pet-friendly and furnished will be treated as 0 or 100
						based on selection.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
						{/* Basic info */}
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) =>
									!value.trim()
										? "A name is required"
										: value.length > 100
											? "Name must be at most 100 characters"
											: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor={field.name}>Name *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										maxLength={100}
										placeholder="e.g., 2BR Apartment in Berlin"
									/>
								</div>
							)}
						</form.Field>

						<form.Field
							name="description"
							validators={{
								onChange: ({ value }) =>
									value.length > 500
										? "Description must be at most 500 characters"
										: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor={field.name}>Description</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={3}
										maxLength={500}
										placeholder="Add notes about what you're looking for..."
									/>
								</div>
							)}
						</form.Field>

						{/* Location */}
						<form.Field
							name="city"
							validators={{
								onChange: ({ value }) => (!value.trim() ? "City is required" : undefined),
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>City *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Berlin"
									/>
								</div>
							)}
						</form.Field>
						<form.Field
							name="country"
							validators={{
								onChange: ({ value }) => (!value.trim() ? "Country is required" : undefined),
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Country *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="DE"
									/>
								</div>
							)}
						</form.Field>

						{/* Property Type */}
						<form.Field name="propertyType">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Property Type</Label>
									<select
										id={field.name}
										className="w-full rounded-md border border-input bg-background p-2 text-sm"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange((e.target.value || undefined) as any)
										}
									>
										<option value="">Any</option>
										{PROPERTY_TYPES.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
								</div>
							)}
						</form.Field>

						{/* Price */}
						<form.Field name="minPrice">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Min Price (€)</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(
												e.target.value === "" ? undefined : Number(e.target.value),
											)
										}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name="maxPrice">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Max Price (€)</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(
												e.target.value === "" ? undefined : Number(e.target.value),
											)
										}
									/>
								</div>
							)}
						</form.Field>

						{/* Rooms */}
						<form.Field name="bedrooms">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Bedrooms</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(
												e.target.value === "" ? undefined : Number(e.target.value),
											)
										}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name="bathrooms">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Bathrooms (min)</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(
												e.target.value === "" ? undefined : Number(e.target.value),
											)
										}
									/>
								</div>
							)}
						</form.Field>

						{/* Amenities */}
						<div className="space-y-2 md:col-span-2">
							<Label>Popular Amenities</Label>
							<div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
								{AMENITIES.map((a) => (
									<label
										key={a}
										className="flex cursor-pointer items-center gap-2 text-muted-foreground text-xs"
									>
										<input
											type="checkbox"
											className="h-4 w-4 rounded border-gray-300"
											checked={selectedAmenities.includes(a)}
											onChange={() => toggleAmenity(a)}
										/>
										{a}
									</label>
								))}
							</div>
						</div>

						{/* Boolean criteria */}
						<form.Field name="petFriendly">
							{(field) => (
								<div className="flex items-center justify-between rounded-md border p-3">
									<div>
										<Label htmlFor="pet-friendly">Pet Friendly</Label>
										<p className="text-muted-foreground text-xs">
											Treats weight as 100 when enabled, otherwise 0
										</p>
									</div>
									<Switch
										id="pet-friendly"
										checked={Boolean(field.state.value)}
										onCheckedChange={(v) => field.handleChange(Boolean(v))}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name="furnished">
							{(field) => (
								<div className="flex items-center justify-between rounded-md border p-3">
									<div>
										<Label htmlFor="furnished">Furnished</Label>
										<p className="text-muted-foreground text-xs">
											Treats weight as 100 when enabled, otherwise 0
										</p>
									</div>
									<Switch
										id="furnished"
										checked={Boolean(field.state.value)}
										onCheckedChange={(v) => field.handleChange(Boolean(v))}
									/>
								</div>
							)}
						</form.Field>

						{/* Weights (sliders) */}
						<div className="md:col-span-2">
							<div className="space-y-4 rounded-md border p-3">
								<div className="flex items-center justify-between">
									<Label className="text-sm">Location weight</Label>
									<form.Field name="weights.location">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Price weight</Label>
									<form.Field name="weights.price">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Bedrooms weight</Label>
									<form.Field name="weights.bedrooms">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Bathrooms weight</Label>
									<form.Field name="weights.bathrooms">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Amenities weight</Label>
									<form.Field name="weights.amenities">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Property type weight</Label>
									<form.Field name="weights.propertyType">
										{(field) => (
											<div className="flex w-64 items-center gap-3">
												<Slider
													value={[field.state.value]}
													onValueChange={(vals) =>
														field.handleChange(vals[0] ?? 50)
													}
													min={0}
													max={100}
													step={10}
												/>
												<span className="text-muted-foreground text-xs">
													{field.state.value}
												</span>
											</div>
										)}
									</form.Field>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || createSavedSearch.isPending}>
									{createSavedSearch.isPending || isSubmitting ? "Saving..." : "Create"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
