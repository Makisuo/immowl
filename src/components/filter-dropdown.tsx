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

export function FilterDropdown() {
	const [priceRange, setPriceRange] = useState([1000, 3000])
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [selectedBedrooms, setSelectedBedrooms] = useState<string>("Any")
	const [selectedBathrooms, setSelectedBathrooms] = useState<string>("Any")
	const [selectedPropertyType, setSelectedPropertyType] = useState<string>("Any")
	const [selectedLeaseTerm, setSelectedLeaseTerm] = useState<string>("Any")
	const [selectedPetPolicy, setSelectedPetPolicy] = useState<string>("Any")

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
		setSelectedAmenities((prev) =>
			prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
		)
	}

	const clearFilters = () => {
		setPriceRange([1000, 3000])
		setSelectedAmenities([])
		setSelectedBedrooms("Any")
		setSelectedBathrooms("Any")
		setSelectedPropertyType("Any")
		setSelectedLeaseTerm("Any")
		setSelectedPetPolicy("Any")
	}

	const getActiveFiltersCount = () => {
		let count = 0
		if (priceRange[0] !== 1000 || priceRange[1] !== 3000) count++
		if (selectedBedrooms !== "Any") count++
		if (selectedBathrooms !== "Any") count++
		if (selectedPropertyType !== "Any") count++
		if (selectedLeaseTerm !== "Any") count++
		if (selectedPetPolicy !== "Any") count++
		if (selectedAmenities.length > 0) count++
		return count
	}

	return (
		<div className="flex items-center gap-4">
			{/* Active filters display */}
			{selectedAmenities.length > 0 && (
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
						variant="outline"
						className="flex items-center gap-2 border-gray-300 bg-white hover:bg-gray-50"
					>
						<Filter className="h-4 w-4" />
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
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-80 bg-white p-4 dark:bg-gray-800" align="end">
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
									{["Any", "1", "2", "3+"].map((bed) => (
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
									{["Any", "1+", "2+", "3+"].map((bath) => (
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
								{["Any", "Apartment", "Condo", "Townhouse"].map((type) => (
									<Button
										key={type}
										variant={selectedPropertyType === type ? "default" : "outline"}
										size="sm"
										onClick={() => setSelectedPropertyType(type)}
										className="h-8 text-xs"
									>
										{type}
									</Button>
								))}
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
											className="rounded border-gray-300"
										/>
										<Label
											htmlFor={amenity}
											className="cursor-pointer text-gray-700 text-xs dark:text-gray-300"
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
