import { useConvexMutation } from "@convex-dev/react-query"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import { Building2, MapPin, Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import {
	ImportanceRadio,
	getLevelFromWeight,
	getWeightFromLevel,
	type ImportanceLevel,
} from "./ImportanceRadio"
import { PreferenceSection } from "./PreferenceSection"

// TODO: replace with actual amenities from the database
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

type PropertyType = (typeof PROPERTY_TYPES)[number]

interface ProfilePreferencesProps {
	initialProfile?: {
		preferences: {
			city?: string
			country?: string
			locationImportance: number
			propertyType?: PropertyType
			propertyTypeImportance: number
			bedrooms?: number
			bedroomsImportance: number
			bathrooms?: number
			bathroomsImportance: number
			minSquareMeters?: number
			squareMetersImportance: number
			minPrice?: number
			maxPrice?: number
			priceImportance: number
			petFriendly?: boolean
			petFriendlyImportance: number
			furnished?: boolean
			furnishedImportance: number
			amenities?: string[]
			amenitiesImportance: number
		}
	}
}

export function ProfilePreferences({ initialProfile }: ProfilePreferencesProps) {
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
		initialProfile?.preferences.amenities ?? [],
	)

	const updateProfile = useMutation({
		mutationFn: useConvexMutation(api.userProfiles.createOrUpdateUserProfile),
	})

	type FormShape = {
		// Preferences
		city?: string
		country?: string
		propertyType?: PropertyType
		bedrooms?: number
		bathrooms?: number
		minSquareMeters?: number
		minPrice?: number
		maxPrice?: number
		petFriendly: boolean
		furnished: boolean
		amenities: string[]

		// Importance levels (will be converted to weights)
		locationImportance: ImportanceLevel
		priceImportance: ImportanceLevel
		bedroomsImportance: ImportanceLevel
		bathroomsImportance: ImportanceLevel
		propertyTypeImportance: ImportanceLevel
		squareMetersImportance: ImportanceLevel
		amenitiesImportance: ImportanceLevel
	}

	const form = useForm({
		defaultValues: {
			// Preferences
			city: initialProfile?.preferences.city ?? "",
			country: initialProfile?.preferences.country ?? "",
			propertyType: initialProfile?.preferences.propertyType,
			bedrooms: initialProfile?.preferences.bedrooms,
			bathrooms: initialProfile?.preferences.bathrooms,
			minSquareMeters: initialProfile?.preferences.minSquareMeters,
			minPrice: initialProfile?.preferences.minPrice,
			maxPrice: initialProfile?.preferences.maxPrice,
			petFriendly: initialProfile?.preferences.petFriendly ?? false,
			furnished: initialProfile?.preferences.furnished ?? false,
			amenities: initialProfile?.preferences.amenities ?? [],

			// Importance levels
			locationImportance: getLevelFromWeight(initialProfile?.preferences.locationImportance ?? 66),
			priceImportance: getLevelFromWeight(initialProfile?.preferences.priceImportance ?? 66),
			bedroomsImportance: getLevelFromWeight(initialProfile?.preferences.bedroomsImportance ?? 66),
			bathroomsImportance: getLevelFromWeight(initialProfile?.preferences.bathroomsImportance ?? 33),
			propertyTypeImportance: getLevelFromWeight(initialProfile?.preferences.propertyTypeImportance ?? 33),
			squareMetersImportance: getLevelFromWeight(initialProfile?.preferences.squareMetersImportance ?? 33),
			amenitiesImportance: getLevelFromWeight(initialProfile?.preferences.amenitiesImportance ?? 33),
		} as FormShape,
		onSubmit: async ({ value }) => {
			const v = value as FormShape

			try {
				await updateProfile.mutateAsync({
					preferences: {
						city: v.city?.trim() || undefined,
						country: v.country?.trim() || undefined,
						locationImportance: getWeightFromLevel(v.locationImportance),
						propertyType: v.propertyType,
						propertyTypeImportance: getWeightFromLevel(v.propertyTypeImportance),
						bedrooms: v.bedrooms,
						bedroomsImportance: getWeightFromLevel(v.bedroomsImportance),
						bathrooms: v.bathrooms,
						bathroomsImportance: getWeightFromLevel(v.bathroomsImportance),
						minSquareMeters: v.minSquareMeters,
						squareMetersImportance: getWeightFromLevel(v.squareMetersImportance),
						minPrice: v.minPrice,
						maxPrice: v.maxPrice,
						priceImportance: getWeightFromLevel(v.priceImportance),
						petFriendly: v.petFriendly,
						petFriendlyImportance: v.petFriendly ? 100 : 0,
						furnished: v.furnished,
						furnishedImportance: v.furnished ? 100 : 0,
						amenities: selectedAmenities,
						amenitiesImportance: getWeightFromLevel(v.amenitiesImportance),
					},
				})

				toast.success("Profile updated successfully")
			} catch (e) {
				console.error(e)
				toast.error("Failed to update profile")
			}
		},
	})

	const toggleAmenity = (amenity: string) => {
		setSelectedAmenities((prev) =>
			prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
		)
		form.setFieldValue("amenities", (v) => {
			const arr = v ?? []
			return arr.includes(amenity) ? arr.filter((a) => a !== amenity) : [...arr, amenity]
		})
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			className="space-y-6"
		>
			{/* Essential Preferences */}
			<PreferenceSection
				title="Essential Preferences"
				description="The most important factors in your apartment search"
				icon={<MapPin className="h-5 w-5" />}
			>
				{/* Location */}
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<form.Field name="city">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>City</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Berlin"
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="country">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Country</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., Germany"
									/>
								</div>
							)}
						</form.Field>
					</div>

					<form.Field name="locationImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="locationImportance"
								label="How important is the location?"
							/>
						)}
					</form.Field>
				</div>

				{/* Price Range */}
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<form.Field name="minPrice">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Min Monthly Rent (€)</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
										}
										placeholder="e.g., 800"
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="maxPrice">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Max Monthly Rent (€)</Label>
									<Input
										id={field.name}
										type="number"
										value={field.state.value ?? ""}
										onChange={(e) =>
											field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
										}
										placeholder="e.g., 1500"
									/>
								</div>
							)}
						</form.Field>
					</div>

					<form.Field name="priceImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="priceImportance"
								label="How important is staying within your budget?"
							/>
						)}
					</form.Field>
				</div>

				{/* Bedrooms */}
				<div className="space-y-4">
					<form.Field name="bedrooms">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Minimum Bedrooms</Label>
								<Input
									id={field.name}
									type="number"
									min="0"
									value={field.state.value ?? ""}
									onChange={(e) =>
										field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
									}
									placeholder="e.g., 2"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="bedroomsImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="bedroomsImportance"
								label="How important is the number of bedrooms?"
							/>
						)}
					</form.Field>
				</div>
			</PreferenceSection>

			{/* Property Details */}
			<PreferenceSection
				title="Property Details"
				description="Specific property characteristics"
				icon={<Building2 className="h-5 w-5" />}
				collapsible
				defaultExpanded={false}
			>
				{/* Property Type */}
				<div className="space-y-4">
					<form.Field name="propertyType">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Property Type</Label>
								<select
									id={field.name}
									className="w-full rounded-md border border-input bg-background p-2 text-sm"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange((e.target.value || undefined) as PropertyType)}
								>
									<option value="">Any</option>
									{PROPERTY_TYPES.map((t) => (
										<option key={t} value={t}>
											{t.charAt(0).toUpperCase() + t.slice(1)}
										</option>
									))}
								</select>
							</div>
						)}
					</form.Field>

					<form.Field name="propertyTypeImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="propertyTypeImportance"
								label="How important is the property type?"
							/>
						)}
					</form.Field>
				</div>

				{/* Bathrooms */}
				<div className="space-y-4">
					<form.Field name="bathrooms">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Minimum Bathrooms</Label>
								<Input
									id={field.name}
									type="number"
									min="0"
									step="0.5"
									value={field.state.value ?? ""}
									onChange={(e) =>
										field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
									}
									placeholder="e.g., 1"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="bathroomsImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="bathroomsImportance"
								label="How important is the number of bathrooms?"
							/>
						)}
					</form.Field>
				</div>

				{/* Square Meters */}
				<div className="space-y-4">
					<form.Field name="minSquareMeters">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Minimum Size (m²)</Label>
								<Input
									id={field.name}
									type="number"
									min="0"
									value={field.state.value ?? ""}
									onChange={(e) =>
										field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
									}
									placeholder="e.g., 60"
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="squareMetersImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="squareMetersImportance"
								label="How important is the size?"
							/>
						)}
					</form.Field>
				</div>
			</PreferenceSection>

			{/* Lifestyle & Amenities */}
			<PreferenceSection
				title="Lifestyle & Amenities"
				description="Additional preferences and features"
				icon={<Sparkles className="h-5 w-5" />}
				collapsible
				defaultExpanded={false}
			>
				{/* Pet Friendly */}
				<form.Field name="petFriendly">
					{(field) => (
						<div className="flex items-center justify-between rounded-md border p-4">
							<div>
								<Label htmlFor="pet-friendly">Pet Friendly</Label>
								<p className="text-muted-foreground text-xs">
									Automatically marked as critical when enabled
								</p>
							</div>
							<Switch
								id="pet-friendly"
								checked={field.state.value}
								onCheckedChange={field.handleChange}
							/>
						</div>
					)}
				</form.Field>

				{/* Furnished */}
				<form.Field name="furnished">
					{(field) => (
						<div className="flex items-center justify-between rounded-md border p-4">
							<div>
								<Label htmlFor="furnished">Furnished</Label>
								<p className="text-muted-foreground text-xs">
									Automatically marked as critical when enabled
								</p>
							</div>
							<Switch id="furnished" checked={field.state.value} onCheckedChange={field.handleChange} />
						</div>
					)}
				</form.Field>

				{/* Amenities */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Desired Amenities</Label>
						<div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
							{AMENITIES.map((amenity) => (
								<label
									key={amenity}
									className="flex cursor-pointer items-center gap-2 text-muted-foreground text-sm"
								>
									<Checkbox
										checked={selectedAmenities.includes(amenity)}
										onCheckedChange={() => toggleAmenity(amenity)}
									/>
									{amenity}
								</label>
							))}
						</div>
					</div>

					<form.Field name="amenitiesImportance">
						{(field) => (
							<ImportanceRadio
								value={field.state.value}
								onChange={field.handleChange}
								name="amenitiesImportance"
								label="How important are these amenities?"
							/>
						)}
					</form.Field>
				</div>
			</PreferenceSection>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button type="submit" disabled={updateProfile.isPending} size="lg">
					{updateProfile.isPending ? "Saving..." : "Save Profile"}
				</Button>
			</div>
		</form>
	)
}