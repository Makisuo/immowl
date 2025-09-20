"use client"

import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { FilterDropdown } from "~/components/filter-dropdown"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function PropertySearch() {
	const navigate = useNavigate()
	const [city, setCity] = useState<string>("Berlin")
	const [propertyType, setPropertyType] = useState<string>("apartment-rent")

	// Filter states
	const [priceRange, setPriceRange] = useState<[number, number]>([1000, 3000])
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [selectedBedrooms, setSelectedBedrooms] = useState<string>("Any")
	const [selectedBathrooms, setSelectedBathrooms] = useState<string>("Any")
	const [selectedPropertyTypeFilter, setSelectedPropertyTypeFilter] = useState<string>("Any")
	const [selectedLeaseTerm, setSelectedLeaseTerm] = useState<string>("Any")
	const [selectedPetPolicy, setSelectedPetPolicy] = useState<string>("Any")

	const handleSearch = () => {
		// Extract property type from the combined value
		const propertyTypeMap: Record<string, string> = {
			"apartment-rent": "apartment",
			"apartment-buy": "apartment",
			"house-rent": "house",
			"house-buy": "house",
		}

		const searchParams = {
			city,
			country: "DE",
			propertyType: propertyTypeMap[propertyType] || "apartment",
		}

		// Navigate to search route with parameters
		navigate({ to: "/search", search: searchParams })
	}

	return (
		<div className="rounded-full border bg-foreground/10 p-0.5">
			<div className="overflow-hidden rounded-full bg-card shadow-2xl">
				<div className="flex items-center gap-2">
					{/* City Selection */}
					<div className="min-w-0 flex-1 gap-1">
						<Select value={city} onValueChange={setCity}>
							<SelectTrigger className="h-16 w-full rounded-md border-0 bg-transparent! px-6 shadow-none outline-none transition-all hover:bg-accent! focus:ring-0 focus:ring-offset-0">
								<div className="flex items-center gap-3">
									<div className="h-4 w-6 flex-shrink-0 rounded-sm bg-gradient-to-b from-black via-red-600 to-yellow-400"></div>
									<SelectValue
										placeholder="Select city"
										className="font-medium text-base"
									/>
								</div>
							</SelectTrigger>
							<SelectContent className="z-[100]">
								<SelectItem value="Berlin">Berlin</SelectItem>
								<SelectItem value="Hamburg">Hamburg</SelectItem>
								<SelectItem value="Munich">Munich</SelectItem>
								<SelectItem value="Frankfurt">Frankfurt</SelectItem>
								<SelectItem value="Cologne">Cologne</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Property Type Selection */}
					<div className="min-w-0 flex-1">
						<Select value={propertyType} onValueChange={setPropertyType}>
							<SelectTrigger className="h-16 rounded-md border-0 bg-transparent! px-6 shadow-none outline-none transition-all hover:bg-accent! focus:ring-0 focus:ring-offset-0">
								<div className="flex items-center gap-3">
									<span className="text-slate-400">×</span>
									<SelectValue
										placeholder="Property type"
										className="font-medium text-base"
									/>
								</div>
							</SelectTrigger>
							<SelectContent className="z-[100]">
								<SelectItem value="apartment-rent">Wohnung Mieten</SelectItem>
								<SelectItem value="apartment-buy">Wohnung Kaufen</SelectItem>
								<SelectItem value="house-rent">Haus Mieten</SelectItem>
								<SelectItem value="house-buy">Haus Kaufen</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Advanced Filters */}
					<div className="min-w-0 flex-shrink-0">
						<FilterDropdown
							buttonVariant="ghost"
							buttonClassName="h-16 rounded-none border-0 bg-transparent px-6 shadow-none outline-none transition-all hover:rounded-md hover:bg-accent focus:ring-0 focus:ring-offset-0"
							contentClassName="z-[100]"
							showBadges={false}
							iconOnly
							priceRange={priceRange}
							setPriceRange={setPriceRange}
							selectedAmenities={selectedAmenities}
							setSelectedAmenities={setSelectedAmenities}
							selectedBedrooms={selectedBedrooms}
							setSelectedBedrooms={setSelectedBedrooms}
							selectedBathrooms={selectedBathrooms}
							setSelectedBathrooms={setSelectedBathrooms}
							selectedPropertyType={selectedPropertyTypeFilter}
							setSelectedPropertyType={setSelectedPropertyTypeFilter}
							selectedLeaseTerm={selectedLeaseTerm}
							setSelectedLeaseTerm={setSelectedLeaseTerm}
							selectedPetPolicy={selectedPetPolicy}
							setSelectedPetPolicy={setSelectedPetPolicy}
						/>
					</div>

					{/* Search Button */}
					<div className="flex-shrink-0 px-4">
						<div key={1} className="rounded-full border bg-foreground/10 p-0.5">
							<Button size="lg" className="rounded-full px-5 text-base" onClick={handleSearch}>
								<span className="text-nowrap">Search</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
