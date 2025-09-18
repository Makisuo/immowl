import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { ApartmentGrid } from "~/components/apartment-grid"
import { FilterDropdown } from "~/components/filter-dropdown"

const searchSchema = type({
	city: "string = 'berlin'",
	country: "string = 'germany'",
	propertyType: "string = 'apartment'",
	"ammenities?": "string[]",
})

export const Route = createFileRoute("/search")({
	component: RouteComponent,
	validateSearch: searchSchema,
})

function RouteComponent() {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="font-semibold text-foreground text-xl">Available Apartments</h1>
					<span className="text-muted-foreground text-sm">1,234 results</span>
				</div>
				<FilterDropdown />
			</div>
			<main className="w-full">
				<ApartmentGrid />
			</main>
		</div>
	)
}
