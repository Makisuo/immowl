import { createFileRoute } from "@tanstack/react-router"
import { ApartmentGrid } from "~/components/apartment-grid"

export const Route = createFileRoute("/search")({
	component: RouteComponent,
})

function RouteComponent() {
	return <ApartmentGrid />
}
