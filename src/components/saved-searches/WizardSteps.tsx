import { useField } from "@tanstack/react-form"
import {
	Bath,
	Bed,
	Building,
	Building2,
	Car,
	Castle,
	Dumbbell,
	Euro,
	Heart,
	HeartOff,
	Home,
	MapPin,
	Minus,
	Ruler,
	TreePine,
	Utensils,
	Warehouse,
	Waves,
	Wifi,
	Wind,
	Zap,
} from "lucide-react"
import { AnimatePresence } from "motion/react"
import { Input } from "~/components/ui/input"
import {
	CheckboxCard,
	FormField,
	ImportanceRadio,
	SelectionCard,
	SelectionGrid,
	StepContainer,
} from "./WizardComponents"

// Step 2: Location (City and Country)
export function Step2Location({ form }: { form: any }) {
	const cityField = useField({
		form,
		name: "criteria.city",
	})

	const countryField = useField({
		form,
		name: "criteria.country",
	})

	const locationWeightField = useField({
		form,
		name: "criteria.weights.location",
	})

	return (
		<StepContainer
			title="Where are you looking?"
			description="Tell us the city and country where you want to find properties."
		>
			<div className="mx-auto max-w-md space-y-6">
				<div className="space-y-4">
					<FormField label="City" required error={cityField.state.meta.errors?.[0]}>
						<div className="relative">
							<MapPin className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								value={cityField.state.value}
								onChange={(e) => cityField.handleChange(e.target.value)}
								onBlur={cityField.handleBlur}
								placeholder="e.g., Berlin, Munich, Hamburg"
								className="pl-10"
							/>
						</div>
					</FormField>

					<FormField label="Country" required error={countryField.state.meta.errors?.[0]}>
						<Input
							value={countryField.state.value}
							onChange={(e) => countryField.handleChange(e.target.value)}
							onBlur={countryField.handleBlur}
							placeholder="e.g., Germany, Austria, Switzerland"
						/>
					</FormField>
				</div>

				<ImportanceRadio
					label="How important is the exact location?"
					value={locationWeightField.state.value}
					onChange={(value) => locationWeightField.handleChange(value)}
				/>
			</div>
		</StepContainer>
	)
}

// Step 3: Price Range
export function Step3PriceRange({ form }: { form: any }) {
	const minPriceField = useField({
		form,
		name: "criteria.minPrice",
	})

	const maxPriceField = useField({
		form,
		name: "criteria.maxPrice",
	})

	const priceWeightField = useField({
		form,
		name: "criteria.weights.price",
	})

	return (
		<StepContainer
			title="What's your budget?"
			description="Set your price range to find properties within your budget."
		>
			<div className="mx-auto max-w-md space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<FormField label="Minimum Price" error={minPriceField.state.meta.errors?.[0]}>
						<div className="relative">
							<Euro className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								type="number"
								value={minPriceField.state.value || ""}
								onChange={(e) =>
									minPriceField.handleChange(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								onBlur={minPriceField.handleBlur}
								placeholder="500"
								className="pl-10"
							/>
						</div>
					</FormField>

					<FormField label="Maximum Price" error={maxPriceField.state.meta.errors?.[0]}>
						<div className="relative">
							<Euro className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								type="number"
								value={maxPriceField.state.value || ""}
								onChange={(e) =>
									maxPriceField.handleChange(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								onBlur={maxPriceField.handleBlur}
								placeholder="2000"
								className="pl-10"
							/>
						</div>
					</FormField>
				</div>

				<ImportanceRadio
					label="How important is staying within budget?"
					value={priceWeightField.state.value}
					onChange={(value) => priceWeightField.handleChange(value)}
				/>
			</div>
		</StepContainer>
	)
}

// Step 4: Rooms (Bedrooms and Bathrooms)
export function Step4Rooms({ form }: { form: any }) {
	const bedroomsField = useField({
		form,
		name: "bedroomsSelection",
	})

	const bathroomsField = useField({
		form,
		name: "bathroomsSelection",
	})

	const roomsWeightField = useField({
		form,
		name: "criteria.weights.bedrooms",
	})

	const bedroomOptions = [
		{ value: "any", label: "Any", icon: <Bed /> },
		{ value: "1", label: "1", icon: <Bed /> },
		{ value: "2", label: "2", icon: <Bed /> },
		{ value: "3+", label: "3+", icon: <Bed /> },
	]

	const bathroomOptions = [
		{ value: "any", label: "Any", icon: <Bath /> },
		{ value: "1", label: "1", icon: <Bath /> },
		{ value: "2", label: "2", icon: <Bath /> },
		{ value: "3+", label: "3+", icon: <Bath /> },
	]

	return (
		<StepContainer
			title="How many rooms do you need?"
			description="Select the number of bedrooms and bathrooms you prefer."
		>
			<div className="mx-auto max-w-2xl space-y-6">
				<div className="space-y-4">
					<div>
						<h3 className="mb-3 font-medium text-gray-900 text-lg">Bedrooms</h3>
						<SelectionGrid columns={4}>
							{bedroomOptions.map((option) => (
								<SelectionCard
									key={option.value}
									id={`bedrooms-${option.value}`}
									title={option.label}
									icon={option.icon}
									selected={bedroomsField.state.value === option.value}
									onClick={() => bedroomsField.handleChange(option.value)}
								/>
							))}
						</SelectionGrid>
					</div>

					<div>
						<h3 className="mb-3 font-medium text-gray-900 text-lg">Bathrooms</h3>
						<SelectionGrid columns={4}>
							{bathroomOptions.map((option) => (
								<SelectionCard
									key={option.value}
									id={`bathrooms-${option.value}`}
									title={option.label}
									icon={option.icon}
									selected={bathroomsField.state.value === option.value}
									onClick={() => bathroomsField.handleChange(option.value)}
								/>
							))}
						</SelectionGrid>
					</div>
				</div>

				<ImportanceRadio
					label="How important is the number of rooms?"
					value={roomsWeightField.state.value}
					onChange={(value) => roomsWeightField.handleChange(value)}
				/>
			</div>
		</StepContainer>
	)
}

// Step 5: Property Type and Furnished
export function Step5PropertyType({ form }: { form: any }) {
	const propertyTypeField = useField({
		form,
		name: "propertyTypeSelection",
	})

	const furnishedField = useField({
		form,
		name: "furnishedSelection",
	})

	const propertyTypeWeightField = useField({
		form,
		name: "criteria.weights.propertyType",
	})

	const minSqmField = useField({
		form,
		name: "criteria.minSquareMeters",
	})

	const maxSqmField = useField({
		form,
		name: "criteria.maxSquareMeters",
	})

	const propertyTypeOptions = [
		{ value: "any", label: "Any", icon: <Home /> },
		{ value: "apartment", label: "Apartment", icon: <Building2 /> },
		{ value: "condo", label: "Condo", icon: <Building /> },
		{ value: "studio", label: "Studio", icon: <Warehouse /> },
		{ value: "townhouse", label: "Townhouse", icon: <Castle /> },
		{ value: "house", label: "House", icon: <Home /> },
	]

	const furnishedOptions = [
		{ value: "any", label: "Any" },
		{ value: "furnished", label: "Furnished" },
		{ value: "unfurnished", label: "Unfurnished" },
	]

	// Automatically set weight based on property type selection
	const handlePropertyTypeChange = (value: string) => {
		propertyTypeField.handleChange(value)
		// If "any" is selected, weight = 0, otherwise weight = 100
		propertyTypeWeightField.handleChange(value === "any" ? 0 : 100)
	}

	return (
		<StepContainer
			title="What type of property?"
			description="Choose your preferred property type, furnishing status, and ideal size range."
		>
			<div className="mx-auto max-w-2xl space-y-6">
				<div className="space-y-4">
					<div>
						<h3 className="mb-3 font-medium text-gray-900 text-lg">Property Type</h3>
						<SelectionGrid columns={3}>
							{propertyTypeOptions.map((option) => (
								<SelectionCard
									key={option.value}
									id={`property-type-${option.value}`}
									title={option.label}
									icon={option.icon}
									selected={propertyTypeField.state.value === option.value}
									onClick={() => handlePropertyTypeChange(option.value)}
								/>
							))}
						</SelectionGrid>
					</div>

					<div>
						<h3 className="mb-3 font-medium text-gray-900 text-lg">Furnished Status</h3>
						<SelectionGrid columns={3}>
							{furnishedOptions.map((option) => (
								<SelectionCard
									key={option.value}
									id={`furnished-${option.value}`}
									title={option.label}
									selected={furnishedField.state.value === option.value}
									onClick={() => furnishedField.handleChange(option.value)}
								/>
							))}
						</SelectionGrid>
					</div>

					<div>
						<h3 className="mb-3 font-medium text-gray-900 text-lg">Size Range (m²)</h3>
						<div className="grid grid-cols-2 gap-4">
							<FormField label="Min m²" error={minSqmField.state.meta.errors?.[0]}>
								<div className="relative">
									<Ruler className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
									<Input
										type="number"
										value={minSqmField.state.value || ""}
										onChange={(e) =>
											minSqmField.handleChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
										onBlur={minSqmField.handleBlur}
										placeholder="40"
										className="pl-10"
									/>
								</div>
							</FormField>
							<FormField label="Max m²" error={maxSqmField.state.meta.errors?.[0]}>
								<div className="relative">
									<Ruler className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
									<Input
										type="number"
										value={maxSqmField.state.value || ""}
										onChange={(e) =>
											maxSqmField.handleChange(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
										onBlur={maxSqmField.handleBlur}
										placeholder="120"
										className="pl-10"
									/>
								</div>
							</FormField>
						</div>
					</div>
				</div>
			</div>
		</StepContainer>
	)
}

// Step 6: Pet Policy
export function Step6PetPolicy({ form }: { form: any }) {
	const petPolicyField = useField({
		form,
		name: "petPolicySelection",
	})

	const petPolicyOptions = [
		{
			value: "any",
			label: "Any",
			description: "No preference about pets",
			icon: <Minus />,
		},
		{
			value: "pet_friendly",
			label: "Pet Friendly",
			description: "Must allow pets",
			icon: <Heart />,
		},
		{
			value: "no_pets",
			label: "No Pets",
			description: "Prefer no pets allowed",
			icon: <HeartOff />,
		},
	]

	return (
		<StepContainer
			title="What's your pet policy?"
			description="Let us know your preference regarding pets in the property."
		>
			<div className="mx-auto max-w-md">
				<SelectionGrid columns={1}>
					{petPolicyOptions.map((option) => (
						<SelectionCard
							key={option.value}
							id={`pet-policy-${option.value}`}
							title={option.label}
							description={option.description}
							icon={option.icon}
							selected={petPolicyField.state.value === option.value}
							onClick={() => petPolicyField.handleChange(option.value)}
							className="text-left"
						/>
					))}
				</SelectionGrid>
			</div>
		</StepContainer>
	)
}

// Step 7: Amenities
export function Step7Amenities({ form }: { form: any }) {
	const amenitiesField = useField({
		form,
		name: "criteria.amenities",
	})

	const amenitiesWeightField = useField({
		form,
		name: "criteria.weights.amenities",
	})

	const amenityOptions = [
		{ value: "Pet Friendly", label: "Pet Friendly", icon: <Heart /> },
		{ value: "Gym/Fitness Center", label: "Gym/Fitness Center", icon: <Dumbbell /> },
		{ value: "In-Unit Laundry", label: "In-Unit Laundry", icon: <Utensils /> },
		{ value: "Air Conditioning", label: "Air Conditioning", icon: <Wind /> },
		{ value: "Parking Included", label: "Parking Included", icon: <Car /> },
		{ value: "Swimming Pool", label: "Swimming Pool", icon: <Waves /> },
		{ value: "Balcony/Patio", label: "Balcony/Patio", icon: <TreePine /> },
		{ value: "Dishwasher", label: "Dishwasher", icon: <Utensils /> },
		{ value: "High-Speed Internet", label: "High-Speed Internet", icon: <Wifi /> },
	]

	const selectedAmenities = amenitiesField.state.value || []
	const hasSelectedAmenities = selectedAmenities.length > 0

	const toggleAmenity = (amenity: string) => {
		const current = selectedAmenities
		const isSelected = current.includes(amenity)

		if (isSelected) {
			amenitiesField.handleChange(current.filter((a) => a !== amenity))
		} else {
			amenitiesField.handleChange([...current, amenity])
		}
	}

	return (
		<StepContainer
			title="What amenities matter to you?"
			description="Select the amenities that are important for your ideal property."
		>
			<div className="mx-auto max-w-2xl space-y-6">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{amenityOptions.map((amenity) => (
						<CheckboxCard
							key={amenity.value}
							id={`amenity-${amenity.value}`}
							title={amenity.label}
							checked={selectedAmenities.includes(amenity.value)}
							onChange={() => toggleAmenity(amenity.value)}
						/>
					))}
				</div>

				<AnimatePresence>
					{hasSelectedAmenities && (
						<ImportanceRadio
							label="How important are these amenities?"
							value={amenitiesWeightField.state.value}
							onChange={(value) => amenitiesWeightField.handleChange(value)}
						/>
					)}
				</AnimatePresence>
			</div>
		</StepContainer>
	)
}
