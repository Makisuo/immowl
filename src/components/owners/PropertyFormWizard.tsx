import { useConvexMutation } from "@convex-dev/react-query"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import { ChevronLeft, ChevronRight, SaveIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { BasicInfoStep } from "./form-steps/BasicInfoStep"
import { ImagesStep } from "./form-steps/ImagesStep"
import { LocationStep } from "./form-steps/LocationStep"
import { PropertyDetailsStep } from "./form-steps/PropertyDetailsStep"
import { RentalDetailsStep } from "./form-steps/RentalDetailsStep"

export const propertyFormSchema = z.object({
	// Basic Info
	title: z.string().min(5, "Title must be at least 5 characters").max(100),
	description: z.string().min(20, "Description must be at least 20 characters").max(1000),
	propertyType: z.enum(["apartment", "house", "condo", "townhouse", "studio"]),

	// Location
	address: z.object({
		street: z.string().min(1, "Street is required"),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		zipCode: z.string().regex(/^\d{5}$/, "Must be a valid 5-digit zip code"),
		country: z.string().default("Germany"),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
	}),

	// Property Details
	rooms: z.object({
		bedrooms: z.number().min(0).max(10),
		bathrooms: z.number().min(0).max(5),
	}),
	squareMeters: z.number().min(10, "Must be at least 10 square meters").max(1000),
	furnished: z.boolean().default(false),
	petFriendly: z.boolean().default(false),
	amenities: z.array(z.string()).default([]),

	// Rental Details
	monthlyRent: z.object({
		cold: z.number().min(100, "Cold rent must be at least 100").max(10000).optional(),
		warm: z.number().min(100, "Warm rent must be at least 100").max(10000).optional(),
	}),
	deposit: z.number().min(0).max(50000).optional(),
	minimumLease: z.number().min(1).max(60).default(12),
	availableFrom: z.number().optional(),

	// Contact
	contactEmail: z.string().email("Invalid email address").optional(),
	contactPhone: z.string().optional(),

	// Images
	imageUrls: z.array(z.string()).default([]),
})

export type PropertyFormData = z.infer<typeof propertyFormSchema>

interface PropertyFormWizardProps {
	mode: "create" | "edit"
	initialData?: Partial<PropertyFormData>
	propertyId?: string
	onSuccess?: () => void
}

const FORM_STEPS = [
	{ title: "Basic Information", description: "Property title and description" },
	{ title: "Location", description: "Property address and location" },
	{ title: "Property Details", description: "Rooms, size, and amenities" },
	{ title: "Rental Details", description: "Pricing and availability" },
	{ title: "Images", description: "Upload property photos" },
]

export function PropertyFormWizard({ mode, initialData, propertyId, onSuccess }: PropertyFormWizardProps) {
	const [currentStep, setCurrentStep] = useState(0)

	const createProperty = useMutation({
		mutationFn: useConvexMutation(api.ownerProperties.createOwnerProperty),
	})
	const updateProperty = useMutation({
		mutationFn: useConvexMutation(api.ownerProperties.updateOwnerProperty),
	})

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			propertyType: "apartment" as const,
			address: {
				street: "",
				city: "",
				state: "",
				zipCode: "",
				country: "Germany",
				latitude: undefined,
				longitude: undefined,
			},
			rooms: {
				bedrooms: 1,
				bathrooms: 1,
			},
			squareMeters: 50,
			furnished: false,
			petFriendly: false,
			amenities: [],
			monthlyRent: {
				cold: undefined,
				warm: undefined,
			},
			deposit: undefined,
			minimumLease: 12,
			availableFrom: undefined,
			contactEmail: "",
			contactPhone: "",
			imageUrls: [],
			...initialData,
		},
		onSubmit: async ({ value }) => {
			try {
				if (mode === "create") {
					await createProperty.mutateAsync(value as any)
					toast.success("Property created successfully!")
				} else if (mode === "edit" && propertyId) {
					await updateProperty.mutateAsync({ propertyId: propertyId as any, ...value } as any)
					toast.success("Property updated successfully!")
				}
				onSuccess?.()
			} catch (error) {
				toast.error("Failed to save property. Please try again.")
				console.error(error)
			}
		},
	})

	const handleNext = () => {
		if (currentStep < FORM_STEPS.length - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

	return (
		<div className="flex w-full flex-col gap-6 border-none">
			<div>
				<CardTitle>{mode === "create" ? "Add New Property" : "Edit Property"}</CardTitle>
				<CardDescription>
					Step {currentStep + 1} of {FORM_STEPS.length}: {FORM_STEPS[currentStep].title}
				</CardDescription>
				<Progress value={progress} className="mt-4" />
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					if (currentStep === FORM_STEPS.length - 1) {
						void form.handleSubmit()
					} else {
						handleNext()
					}
				}}
				className="space-y-6"
			>
				<div className="min-h-[400px]">
					{currentStep === 0 && <BasicInfoStep form={form} />}
					{currentStep === 1 && <LocationStep form={form} />}
					{currentStep === 2 && <PropertyDetailsStep form={form} />}
					{currentStep === 3 && <RentalDetailsStep form={form} />}
					{currentStep === 4 && <ImagesStep form={form} />}
				</div>

				<div className="flex justify-between border-t pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={handlePrevious}
						disabled={currentStep === 0}
					>
						<ChevronLeft className="mr-2 h-4 w-4" />
						Previous
					</Button>

					<div className="flex gap-2">
						{currentStep === FORM_STEPS.length - 1 ? (
							<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
								{([canSubmit, isSubmitting]) => (
									<Button type="submit" disabled={!canSubmit || isSubmitting}>
										<SaveIcon className="mr-2 h-4 w-4" />
										{isSubmitting
											? "Saving..."
											: mode === "create"
												? "Create Property"
												: "Update Property"}
									</Button>
								)}
							</form.Subscribe>
						) : (
							<Button type="submit">
								Next
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
