import { createFileRoute } from "@tanstack/react-router"

import HeroSection from "~/components/hero-section"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

function Home() {
	return (
		<div>
			<HeroSection />
		</div>
	)
}
