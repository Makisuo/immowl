import type { Doc } from "convex/_generated/dataModel"
import { Edit2, Euro, Eye, EyeOff, Home, MapPin, MoreVertical, Trash2 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface OwnerPropertyCardProps {
	property: Doc<"properties">
	onEdit: () => void
	onDelete: () => void
	onToggleStatus: () => void
}

export function OwnerPropertyCard({ property, onEdit, onDelete, onToggleStatus }: OwnerPropertyCardProps) {
	const isActive = property.status === "active"
	const rentDisplay = property.monthlyRent.warm
		? `€${property.monthlyRent.warm} warm`
		: property.monthlyRent.cold
			? `€${property.monthlyRent.cold} cold`
			: "Price not set"

	const propertyTypeLabels = {
		apartment: "Apartment",
		house: "House",
		condo: "Condo",
		townhouse: "Townhouse",
		studio: "Studio",
	}

	return (
		<Card className="relative overflow-hidden">
			{!isActive && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
					<Badge variant="secondary" className="px-4 py-2 text-lg">
						Disabled
					</Badge>
				</div>
			)}

			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-1">
						<h3 className="line-clamp-1 font-semibold text-lg">{property.title}</h3>
						<div className="flex items-center text-muted-foreground text-sm">
							<MapPin className="mr-1 h-3 w-3" />
							<span>
								{property.address.city}, {property.address.state}
							</span>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onEdit}>
								<Edit2 className="mr-2 h-4 w-4" />
								Edit Property
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onToggleStatus}>
								{isActive ? (
									<>
										<EyeOff className="mr-2 h-4 w-4" />
										Disable Property
									</>
								) : (
									<>
										<Eye className="mr-2 h-4 w-4" />
										Activate Property
									</>
								)}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={onDelete} className="text-destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Property
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				{property.imageUrls && property.imageUrls.length > 0 ? (
					<div className="mb-3 aspect-video overflow-hidden rounded-md bg-muted">
						<img
							src={property.imageUrls[0]}
							alt={property.title}
							className="h-full w-full object-cover"
							onError={(e) => {
								e.currentTarget.src = ""
								e.currentTarget.style.display = "none"
							}}
						/>
					</div>
				) : (
					<div className="mb-3 flex aspect-video items-center justify-center rounded-md bg-muted">
						<Home className="h-12 w-12 text-muted-foreground" />
					</div>
				)}

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Badge variant="outline">{propertyTypeLabels[property.propertyType]}</Badge>
						<span className="text-muted-foreground text-sm">{property.squareMeters} m²</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							{property.rooms.bedrooms} bed • {property.rooms.bathrooms} bath
						</span>
						{property.furnished && (
							<Badge variant="secondary" className="text-xs">
								Furnished
							</Badge>
						)}
					</div>
				</div>
			</CardContent>

			<CardFooter className="border-t pt-3">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center">
						<Euro className="mr-1 h-4 w-4 text-muted-foreground" />
						<span className="font-semibold">{rentDisplay}</span>
					</div>
					{property.availableFrom && (
						<span className="text-muted-foreground text-xs">
							Available {new Date(property.availableFrom).toLocaleDateString()}
						</span>
					)}
				</div>
			</CardFooter>
		</Card>
	)
}
