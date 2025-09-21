"use client"

import { ChevronDown, Filter, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Slider } from "~/components/ui/slider"
import type { UISearchFilters } from "~/hooks/use-search-params"
import { cn } from "~/lib/utils"

interface FilterDropdownProps {
	buttonVariant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
	buttonClassName?: string
	contentClassName?: string
	compact?: boolean
	showBadges?: boolean
	align?: "start" | "center" | "end"
	iconOnly?: boolean
	// Controlled state props with proper types
	priceRange?: [number, number]
	setPriceRange?: (range: [number, number]) => void
	selectedAmenities?: string[]
	setSelectedAmenities?: (amenities: string[]) => void
	selectedBedrooms?: UISearchFilters["bedrooms"]
	setSelectedBedrooms?: (bedrooms: UISearchFilters["bedrooms"]) => void
	selectedBathrooms?: UISearchFilters["bathrooms"]
	setSelectedBathrooms?: (bathrooms: UISearchFilters["bathrooms"]) => void
	selectedPropertyType?: UISearchFilters["propertyType"]
	setSelectedPropertyType?: (propertyType: UISearchFilters["propertyType"]) => void
	selectedPetPolicy?: UISearchFilters["petFriendly"]
	setSelectedPetPolicy?: (petPolicy: UISearchFilters["petFriendly"]) => void
	selectedFurnished?: UISearchFilters["furnished"]
	setSelectedFurnished?: (furnished: UISearchFilters["furnished"]) => void
	selectedLeaseTerm?: string
	setSelectedLeaseTerm?: (leaseTerm: string) => void
}

export function FilterDropdown({
	buttonVariant = "outline",
	buttonClassName,
	contentClassName,
	showBadges = true,
	align = "end",
	iconOnly = false,
	// Controlled state props
	priceRange: priceRangeProp,
	setPriceRange: setPriceRangeProp,
	selectedAmenities: selectedAmenitiesProp,
	setSelectedAmenities: setSelectedAmenitiesProp,
	selectedBedrooms: selectedBedroomsProp,
	setSelectedBedrooms: setSelectedBedroomsProp,
	selectedBathrooms: selectedBathroomsProp,
	setSelectedBathrooms: setSelectedBathroomsProp,
	selectedPropertyType: selectedPropertyTypeProp,
	setSelectedPropertyType: setSelectedPropertyTypeProp,
	setSelectedLeaseTerm: setSelectedLeaseTermProp,
	selectedPetPolicy: selectedPetPolicyProp,
	setSelectedPetPolicy: setSelectedPetPolicyProp,
	selectedFurnished: selectedFurnishedProp,
	setSelectedFurnished: setSelectedFurnishedProp,
}: FilterDropdownProps) {
	// Use props if provided, otherwise use internal state
	const [internalPriceRange, setInternalPriceRange] = useState<[number, number]>([0, 5000])
	const [internalSelectedAmenities, setInternalSelectedAmenities] = useState<string[]>([])
	const [internalSelectedBedrooms, setInternalSelectedBedrooms] =
		useState<UISearchFilters["bedrooms"]>("Any")
	const [internalSelectedBathrooms, setInternalSelectedBathrooms] =
		useState<UISearchFilters["bathrooms"]>("Any")
	const [internalSelectedPropertyType, setInternalSelectedPropertyType] =
		useState<UISearchFilters["propertyType"]>("Any")
	const [_internalSelectedLeaseTerm, setInternalSelectedLeaseTerm] = useState<string>("Any")
	const [internalSelectedPetPolicy, setInternalSelectedPetPolicy] =
		useState<UISearchFilters["petFriendly"]>("Any")
	const [internalSelectedFurnished, setInternalSelectedFurnished] =
		useState<UISearchFilters["furnished"]>("Any")

	// Use props if provided, otherwise use internal state
	const priceRange = priceRangeProp ?? internalPriceRange
	const setPriceRange = setPriceRangeProp ?? setInternalPriceRange
	const selectedAmenities = selectedAmenitiesProp ?? internalSelectedAmenities
	const setSelectedAmenities = setSelectedAmenitiesProp ?? setInternalSelectedAmenities
	const selectedBedrooms = selectedBedroomsProp ?? internalSelectedBedrooms
	const setSelectedBedrooms = setSelectedBedroomsProp ?? setInternalSelectedBedrooms
	const selectedBathrooms = selectedBathroomsProp ?? internalSelectedBathrooms
	const setSelectedBathrooms = setSelectedBathroomsProp ?? setInternalSelectedBathrooms
	const selectedPropertyType = selectedPropertyTypeProp ?? internalSelectedPropertyType
	const setSelectedPropertyType = setSelectedPropertyTypeProp ?? setInternalSelectedPropertyType
	const setSelectedLeaseTerm = setSelectedLeaseTermProp ?? setInternalSelectedLeaseTerm
	const selectedPetPolicy = selectedPetPolicyProp ?? internalSelectedPetPolicy
	const setSelectedPetPolicy = setSelectedPetPolicyProp ?? setInternalSelectedPetPolicy
	const selectedFurnished = selectedFurnishedProp ?? internalSelectedFurnished
	const setSelectedFurnished = setSelectedFurnishedProp ?? setInternalSelectedFurnished

	const amenities = [
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

	const toggleAmenity = (amenity: string) => {
		const newAmenities = selectedAmenities.includes(amenity)
			? selectedAmenities.filter((a) => a !== amenity)
			: [...selectedAmenities, amenity]
		setSelectedAmenities(newAmenities)
	}

	const clearFilters = () => {
		setPriceRange([0, 5000])
		setSelectedAmenities([])
		setSelectedBedrooms("Any")
		setSelectedBathrooms("Any")
		setSelectedPropertyType("Any")
		setSelectedLeaseTerm("Any")
		setSelectedPetPolicy("Any")
		setSelectedFurnished("Any")
	}

	const getActiveFiltersCount = () => {
		let count = 0
		if (priceRange[0] > 0 || priceRange[1] < 5000) count++
		if (selectedBedrooms !== "Any") count++
		if (selectedBathrooms !== "Any") count++
		if (selectedPropertyType !== "Any") count++
		if (selectedPetPolicy !== "Any") count++
		if (selectedFurnished !== "Any") count++
		if (selectedAmenities.length > 0) count++
		// Note: city and country are not included as they're location filters, not property filters
		// selectedLeaseTerm is not currently being used in the search
		return count
	}

	return (
		<div className="flex items-center gap-4">
			{/* Active filters display */}
			{showBadges && selectedAmenities.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedAmenities.slice(0, 3).map((amenity) => (
						<Badge
							key={amenity}
							variant="secondary"
							className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 text-xs hover:bg-blue-100"
						>
							{amenity}
							<X
								className="ml-1 h-3 w-3 cursor-pointer"
								onClick={() => toggleAmenity(amenity)}
							/>
						</Badge>
					))}
					{selectedAmenities.length > 3 && (
						<Badge
							variant="secondary"
							className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 text-xs"
						>
							+{selectedAmenities.length - 3} more
						</Badge>
					)}
				</div>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant={buttonVariant}
						className={cn(
							"flex items-center gap-2",
							buttonVariant === "outline" && "border-gray-300 bg-white hover:bg-gray-50",
							buttonClassName,
						)}
					>
						<Filter className={cn("h-4 w-4", iconOnly && "text-slate-400")} />
						{!iconOnly && (
							<>
								Filters
								{getActiveFiltersCount() > 0 && (
									<Badge
										variant="secondary"
										className="ml-1 rounded-full bg-blue-100 px-2 py-0 text-blue-700 text-xs"
									>
										{getActiveFiltersCount()}
									</Badge>
								)}
								<ChevronDown className="h-4 w-4" />
							</>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className={cn("w-80 bg-white p-4 dark:bg-gray-800", contentClassName)}
					align={align}
				>
					<div className="space-y-6">
						{/* Header */}
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="text-gray-600 text-sm underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							>
								Clear all
							</Button>
						</div>

						{/* Price Range */}
						<div className="space-y-3">
							<Label className="font-medium text-gray-900 text-sm dark:text-white">
								Price range
							</Label>
							<div className="px-2">
								<Slider
									value={priceRange}
									onValueChange={setPriceRange}
									max={5000}
									min={500}
									step={100}
									className="w-full"
								/>
							</div>
							<div className="flex items-center justify-between text-gray-600 text-sm dark:text-gray-300">
								<span>${priceRange[0]}</span>
								<span>${priceRange[1]}+</span>
							</div>
						</div>

						<Separator />

						{/* Quick Filters */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="font-medium text-gray-900 text-sm dark:text-white">
									Bedrooms
								</Label>
								<div className="grid grid-cols-2 gap-1">
									{(["Any", "Studio", "1", "2", "3+"] as const).map((bed) => (
										<Button
											key={bed}
											variant={selectedBedrooms === bed ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedBedrooms(bed)}
											className="h-8 text-xs"
										>
											{bed}
										</Button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label className="font-medium text-gray-900 text-sm dark:text-white">
									Bathrooms
								</Label>
								<div className="grid grid-cols-2 gap-1">
									{(["Any", "1", "2", "3+"] as const).map((bath) => (
										<Button
											key={bath}
											variant={selectedBathrooms === bath ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedBathrooms(bath)}
											className="h-8 text-xs"
										>
											{bath}
										</Button>
									))}
								</div>
							</div>
						</div>

						<Separator />

						{/* Property Type */}
						<div className="space-y-2">
							<Label className="font-medium text-gray-900 text-sm dark:text-white">
								Property type
							</Label>
							<div className="grid grid-cols-2 gap-2">
								{(["Any", "Apartment", "House", "Condo", "Townhouse", "Studio"] as const).map(
									(type) => (
										<Button
											key={type}
											variant={selectedPropertyType === type ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedPropertyType(type)}
											className="h-8 text-xs"
										>
											{type}
										</Button>
									),
								)}
							</div>
						</div>

						<Separator />

						{/* Pet Policy and Furnished */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="font-medium text-gray-900 text-sm dark:text-white">
									Pet Policy
								</Label>
								<div className="space-y-1">
									{(["Any", "Yes", "No"] as const).map((option) => (
										<Button
											key={option}
											variant={selectedPetPolicy === option ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedPetPolicy(option)}
											className="h-8 w-full text-xs"
										>
											{option === "Yes"
												? "Pet Friendly"
												: option === "No"
													? "No Pets"
													: option}
										</Button>
									))}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="font-medium text-gray-900 text-sm dark:text-white">
									Furnished
								</Label>
								<div className="space-y-1">
									{(["Any", "Yes", "No"] as const).map((option) => (
										<Button
											key={option}
											variant={selectedFurnished === option ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedFurnished(option)}
											className="h-8 w-full text-xs"
										>
											{option === "Yes"
												? "Furnished"
												: option === "No"
													? "Unfurnished"
													: option}
										</Button>
									))}
								</div>
							</div>
						</div>

						<Separator />

						{/* Amenities - Compact Grid */}
						<div className="space-y-2">
							<Label className="font-medium text-gray-900 text-sm dark:text-white">
								Popular amenities
							</Label>
							<div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
								{amenities.slice(0, 8).map((amenity) => (
									<div key={amenity} className="flex items-center space-x-2">
										<Checkbox
											id={amenity}
											checked={selectedAmenities.includes(amenity)}
											onCheckedChange={() => toggleAmenity(amenity)}
											className="rounded"
										/>
										<Label
											htmlFor={amenity}
											className="cursor-pointer text-muted-foreground text-xs"
										>
											{amenity}
										</Label>
									</div>
								))}
							</div>
						</div>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
