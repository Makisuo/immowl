import { createFileRoute } from "@tanstack/react-router"
import { OwnersPage } from "~/components/owners/OwnersPage"

export const Route = createFileRoute("/_app/_authed/owners")({
	component: OwnersPage,
})
