import { createFileRoute } from "@tanstack/react-router"
import { ApartmentGrid } from "~/components/apartment-grid"
import { FilterDropdown } from "~/components/filter-dropdown"

export const Route = createFileRoute("/search")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="font-semibold text-gray-900 text-xl dark:text-white">
						Available Apartments
					</h1>
					<span className="text-gray-600 text-sm dark:text-gray-400">1,234 results</span>
				</div>
				<FilterDropdown />
			</div>
			<main className="w-full">
				<ApartmentGrid />
			</main>
		</div>
	)
}
