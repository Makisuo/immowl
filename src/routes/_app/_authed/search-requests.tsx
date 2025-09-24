import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { SavedSearchesList } from "~/components/saved-searches/SavedSearchesList"

export const Route = createFileRoute("/_app/_authed/search-requests")({
	component: SearchRequestsPage,
})

function SearchRequestsPage() {
	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
						<div className="flex items-center gap-2">
							<Search className="h-6 w-6 text-blue-600" />
							<h1 className="font-semibold text-foreground text-xl sm:text-2xl">
								Search Requests
							</h1>
						</div>
						<span className="text-muted-foreground text-sm">
							Manage your saved searches and get notified when new matching properties are available
						</span>
					</div>
				</div>
			</div>

			{/* Saved Searches List */}
			<SavedSearchesList />
		</div>
	)
}
