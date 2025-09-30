import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "convex/_generated/api"
import { User } from "lucide-react"
import { ProfilePreferences } from "~/components/profile/ProfilePreferences"
import { Card, CardContent, CardHeader } from "~/components/ui/card"

export const Route = createFileRoute("/_app/_authed/profile")({
	component: ProfilePage,
})

function ProfilePage() {
	const { data: profile, isLoading } = useQuery(convexQuery(api.userProfiles.getUserProfile, {}))

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="mb-8">
					<div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
					<div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted"></div>
				</div>
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-6 w-1/3 rounded bg-muted"></div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="h-4 w-2/3 rounded bg-muted"></div>
									<div className="h-4 w-1/2 rounded bg-muted"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3">
					<User className="h-6 w-6 text-blue-600" />
					<div>
						<h1 className="font-semibold text-foreground text-xl sm:text-2xl">
							Apartment Preferences
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Configure your preferences to help us match you with the perfect apartment
						</p>
					</div>
				</div>
			</div>

			{/* Profile Form */}
			<ProfilePreferences initialProfile={profile ?? undefined} />
		</div>
	)
}
