import { useForm } from "@tanstack/react-form"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import {
	Step1BasicInfo,
	Step2Location,
	Step3PriceRange,
	Step4Rooms,
	Step5PropertyType,
	Step6PetPolicy,
	Step7Amenities,
} from "./WizardSteps"

// Zod validation schema
const savedSearchSchema = z.object({
	name: z.string().min(1, "Search name is required"),
	description: z.string().optional(),
	criteria: z.object({
		city: z.string().min(1, "City is required"),
		country: z.string().min(1, "Country is required"),
		propertyType: z.enum(["apartment", "house", "condo", "townhouse", "studio"]).optional(),
		minPrice: z.number().positive().optional(),
		maxPrice: z.number().positive().optional(),
		minSquareMeters: z.number().positive().optional(),
		maxSquareMeters: z.number().positive().optional(),
		bedrooms: z.number().min(0).optional(),
		bathrooms: z.number().min(0).optional(),
		amenities: z.array(z.string()).optional(),
		petFriendly: z.boolean().optional(),
		furnished: z.boolean().optional(),
		weights: z
			.object({
				location: z.number().min(0).max(100).optional(),
				price: z.number().min(0).max(100).optional(),
				bedrooms: z.number().min(0).max(100).optional(),
				bathrooms: z.number().min(0).max(100).optional(),
				amenities: z.number().min(0).max(100).optional(),
				petFriendly: z.number().min(0).max(100).optional(),
				furnished: z.number().min(0).max(100).optional(),
				propertyType: z.number().min(0).max(100).optional(),
			})
			.optional(),
	}),
})

type SavedSearchFormData = z.infer<typeof savedSearchSchema>

// Form state for internal use (includes UI-specific fields)
const wizardFormSchema = savedSearchSchema.extend({
	// UI-specific fields for better UX
	bedroomsSelection: z.enum(["any", "1", "2", "3+"]).optional(),
	bathroomsSelection: z.enum(["any", "1", "2", "3+"]).optional(),
	propertyTypeSelection: z.enum(["any", "apartment", "house", "condo", "townhouse", "studio"]).optional(),
	furnishedSelection: z.enum(["any", "furnished", "unfurnished"]).optional(),
	petPolicySelection: z.enum(["any", "pet_friendly", "no_pets"]).optional(),
})

type WizardFormData = z.infer<typeof wizardFormSchema>

const STEPS = [
	{ id: 1, title: "Basic Info", description: "Name and description" },
	{ id: 2, title: "Location", description: "City and country" },
	{ id: 3, title: "Price Range", description: "Budget preferences" },
	{ id: 4, title: "Rooms", description: "Bedrooms and bathrooms" },
	{ id: 5, title: "Property Type", description: "Type and furnishing" },
	{ id: 6, title: "Pet Policy", description: "Pet preferences" },
	{ id: 7, title: "Amenities", description: "Additional features" },
]

const TOTAL_STEPS = STEPS.length

interface SavedSearchWizardProps {
	onComplete: (data: SavedSearchFormData) => void

	initialData?: Partial<SavedSearchFormData>
}

export function SavedSearchWizard({ onComplete, initialData }: SavedSearchWizardProps) {
	const [currentStep, setCurrentStep] = useState(1)

	// Default form values with "Any" selections
	const defaultValues: WizardFormData = {
		name: initialData?.name || "",
		description: initialData?.description || "",
		criteria: {
			city: initialData?.criteria?.city || "",
			country: initialData?.criteria?.country || "",
			propertyType: initialData?.criteria?.propertyType,
			minPrice: initialData?.criteria?.minPrice,
			maxPrice: initialData?.criteria?.maxPrice,
			minSquareMeters: initialData?.criteria?.minSquareMeters,
			maxSquareMeters: initialData?.criteria?.maxSquareMeters,
			bedrooms: initialData?.criteria?.bedrooms,
			bathrooms: initialData?.criteria?.bathrooms,
			amenities: initialData?.criteria?.amenities || [],
			petFriendly: initialData?.criteria?.petFriendly,
			furnished: initialData?.criteria?.furnished,
			weights: {
				location: initialData?.criteria?.weights?.location || 50,
				price: initialData?.criteria?.weights?.price || 50,
				bedrooms: initialData?.criteria?.weights?.bedrooms || 50,
				bathrooms: initialData?.criteria?.weights?.bathrooms || 50,
				amenities: initialData?.criteria?.weights?.amenities || 50,
				petFriendly: initialData?.criteria?.weights?.petFriendly || 50,
				furnished: initialData?.criteria?.weights?.furnished || 50,
				propertyType: initialData?.criteria?.weights?.propertyType || 50,
			},
		},
		// UI-specific defaults prefer initialData when present; otherwise "any"
		bedroomsSelection:
			initialData?.criteria?.bedrooms != null
				? initialData.criteria.bedrooms >= 3
					? "3+"
					: initialData.criteria.bedrooms === 2
						? "2"
						: initialData.criteria.bedrooms === 1
							? "1"
							: "any"
				: "any",
		bathroomsSelection:
			initialData?.criteria?.bathrooms != null
				? initialData.criteria.bathrooms >= 3
					? "3+"
					: initialData.criteria.bathrooms === 2
						? "2"
						: initialData.criteria.bathrooms === 1
							? "1"
							: "any"
				: "any",
		propertyTypeSelection: initialData?.criteria?.propertyType ?? "any",
		furnishedSelection:
			initialData?.criteria?.furnished === true
				? "furnished"
				: initialData?.criteria?.furnished === false
					? "unfurnished"
					: "any",
		petPolicySelection:
			initialData?.criteria?.petFriendly === true
				? "pet_friendly"
				: initialData?.criteria?.petFriendly === false
					? "no_pets"
					: "any",
	}

	const form = useForm({
		defaultValues,
		validators: {
			onChange: wizardFormSchema,
		},
		onSubmit: async ({ value }) => {
			// Transform wizard form data to saved search format
			const transformedData: SavedSearchFormData = {
				name: value.name,
				description: value.description,
				criteria: {
					city: value.criteria.city,
					country: value.criteria.country,
					propertyType:
						value.propertyTypeSelection === "any"
							? undefined
							: (value.propertyTypeSelection as any),
					minPrice: value.criteria.minPrice,
					maxPrice: value.criteria.maxPrice,
					minSquareMeters: value.criteria.minSquareMeters ?? undefined,
					maxSquareMeters: value.criteria.maxSquareMeters ?? undefined,
					bedrooms:
						value.bedroomsSelection === "any"
							? undefined
							: value.bedroomsSelection === "3+"
								? 3
								: Number(value.bedroomsSelection),
					bathrooms:
						value.bathroomsSelection === "any"
							? undefined
							: value.bathroomsSelection === "3+"
								? 3
								: Number(value.bathroomsSelection),
					amenities: value.criteria.amenities,
					petFriendly:
						value.petPolicySelection === "any"
							? undefined
							: value.petPolicySelection === "pet_friendly",
					furnished:
						value.furnishedSelection === "any"
							? undefined
							: value.furnishedSelection === "furnished",
					weights: {
						location: value.criteria.weights?.location,
						price: value.criteria.weights?.price,
						bedrooms: value.criteria.weights?.bedrooms,
						bathrooms: value.criteria.weights?.bathrooms,
						amenities: value.criteria.weights?.amenities,
						petFriendly:
							value.petPolicySelection === "any"
								? undefined
								: value.petPolicySelection === "pet_friendly"
									? 100
									: value.petPolicySelection === "no_pets"
										? 0
										: 50,
						furnished: value.criteria.weights?.furnished,
						propertyType: value.criteria.weights?.propertyType,
					},
				},
			}

			onComplete(transformedData)
		},
	})

	const canGoNext = () => {
		// Add step-specific validation logic here
		const formState = form.state

		switch (currentStep) {
			case 1:
				return formState.values.name && formState.values.name.length > 0
			case 2:
				return formState.values.criteria.city && formState.values.criteria.country
			default:
				return currentStep < TOTAL_STEPS
		}
	}

	const canGoPrevious = () => {
		return currentStep > 1
	}

	const handleNext = () => {
		if (canGoNext()) {
			setCurrentStep((prev) => prev + 1)
		}
	}

	const handlePrevious = () => {
		if (canGoPrevious()) {
			setCurrentStep((prev) => prev - 1)
		}
	}

	const handleStepClick = (stepId: number) => {
		// Allow navigation to previous steps or current step
		if (initialData || stepId <= currentStep) {
			setCurrentStep(stepId)
		}
	}

	const progress = (currentStep / TOTAL_STEPS) * 100

	return (
		<div className="mx-auto w-full space-y-6">
			<div className="space-y-4">
				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>
							Step {currentStep} of {TOTAL_STEPS}
						</span>
						<span>{Math.round(progress)}% Complete</span>
					</div>
					<Progress value={progress} className="h-2" />
				</div>

				{/* Step Navigation */}
				<div className="flex flex-wrap gap-2">
					{STEPS.map((step) => (
						<button
							key={step.id}
							type="button"
							onClick={() => handleStepClick(step.id)}
							className={`min-w-0 flex-1 rounded-lg border p-2 text-left text-xs transition-colors${
								step.id === currentStep
									? "border-blue-500 bg-blue-50 text-blue-700"
									: step.id < currentStep
										? "cursor-pointer border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
										: "border-gray-200 bg-gray-50 text-gray-500"
							}`}
							// {/* disabled= */}{step.id > currentStep}
						>
							<div className="truncate font-medium">{step.title}</div>
							<div className="truncate text-xs opacity-75">{step.description}</div>
						</button>
					))}
				</div>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
				className="space-y-6"
			>
				{/* Step Content */}
				<div className="min-h-[400px]">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
						>
							{currentStep === 1 && <Step1BasicInfo form={form} />}
							{currentStep === 2 && <Step2Location form={form} />}
							{currentStep === 3 && <Step3PriceRange form={form} />}
							{currentStep === 4 && <Step4Rooms form={form} />}
							{currentStep === 5 && <Step5PropertyType form={form} />}
							{currentStep === 6 && <Step6PetPolicy form={form} />}
							{currentStep === 7 && <Step7Amenities form={form} />}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between border-t pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={handlePrevious}
						disabled={!canGoPrevious()}
						className="flex items-center gap-2"
					>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>

					<div className="flex gap-2">
						{currentStep === TOTAL_STEPS ? (
							<Button type="submit" className="flex items-center gap-2">
								Save Profile
							</Button>
						) : (
							<Button
								type="button"
								onClick={handleNext}
								disabled={!canGoNext()}
								className="flex items-center gap-2"
							>
								Next
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
