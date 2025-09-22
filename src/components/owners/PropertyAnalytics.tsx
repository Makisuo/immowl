import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import { Activity, Euro, Home, Loader2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

export function PropertyAnalytics() {
	const { data, isLoading, error } = useQuery(
		convexQuery(api.ownerProperties.getOwnerPropertyAnalytics, {
			timeframe: "month",
		}),
	)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="py-12 text-center">
				<p className="text-destructive">Failed to load analytics</p>
				<p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
			</div>
		)
	}

	if (!data) {
		return null
	}

	const stats = [
		{
			title: "Total Properties",
			value: data.totalProperties,
			description: `${data.activeProperties} active`,
			icon: Home,
		},
		{
			title: "Monthly Revenue",
			value: `€${data.totalRevenue.toLocaleString()}`,
			description: "Potential earnings",
			icon: Euro,
		},
		{
			title: "Average Rent",
			value: `€${Math.round(data.averageRent).toLocaleString()}`,
			description: "Per property",
			icon: TrendingUp,
		},
		{
			title: "Occupancy Rate",
			value: `${Math.round(data.occupancyRate * 100)}%`,
			description: "Current occupancy",
			icon: Activity,
		},
	]

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon
					return (
						<Card key={index}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
								<Icon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">{stat.value}</div>
								<p className="mt-1 text-muted-foreground text-xs">{stat.description}</p>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Performance Insights</CardTitle>
					<CardDescription>Track how your properties are performing</CardDescription>
				</CardHeader>
				<CardContent>
					{data.topPerformingProperties && data.topPerformingProperties.length > 0 ? (
						<div className="space-y-4">
							<h4 className="font-medium">Top Performing Properties</h4>
							{data.topPerformingProperties.map((property: any) => (
								<div
									key={property._id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div>
										<p className="font-medium">{property.title}</p>
										<p className="text-muted-foreground text-sm">
											{property.views} views • {property.inquiries} inquiries
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							<p>No performance data available yet.</p>
							<p className="mt-2 text-sm">
								Analytics will appear once your properties receive views and inquiries.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
