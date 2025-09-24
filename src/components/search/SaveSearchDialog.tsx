import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import { Bell, BellOff, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import type { SearchFilters } from "~/hooks/use-search-params"

interface SaveSearchDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	searchParams: SearchFilters
}

export function SaveSearchDialog({ open, onOpenChange, searchParams }: SaveSearchDialogProps) {
	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [notificationsEnabled, setNotificationsEnabled] = useState(true)
	const [emailNotifications, setEmailNotifications] = useState(true)

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearch),
	})

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Please enter a name for your search")
			return
		}

		// Validate required fields
		if (!searchParams.city || !searchParams.country) {
			toast.error("City and country are required to save a search")
			return
		}

		try {
			await createSavedSearch.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,

				// Search criteria - ensure required fields are present
				city: searchParams.city,
				country: searchParams.country,
				propertyType: searchParams.propertyType,
				sortBy: searchParams.sortBy,
				minPrice: searchParams.minPrice,
				maxPrice: searchParams.maxPrice,
				bedrooms: searchParams.bedrooms,
				bathrooms: searchParams.bathrooms,
				amenities: searchParams.amenities,
				petFriendly: searchParams.petFriendly,
				furnished: searchParams.furnished,

				// Notification settings
				notificationsEnabled,
				emailNotifications,
			})

			toast.success("Search saved successfully!")
			onOpenChange(false)

			// Reset form
			setName("")
			setDescription("")
			setNotificationsEnabled(true)
			setEmailNotifications(true)
		} catch (error) {
			toast.error("Failed to save search. Please try again.")
			console.error(error)
		}
	}

	const getSearchSummary = () => {
		const parts = []

		parts.push(`${searchParams.city}, ${searchParams.country}`)

		if (searchParams.propertyType) {
			parts.push(searchParams.propertyType)
		}

		if (searchParams.minPrice || searchParams.maxPrice) {
			const priceRange = []
			if (searchParams.minPrice) priceRange.push(`€${searchParams.minPrice}+`)
			if (searchParams.maxPrice) priceRange.push(`€${searchParams.maxPrice}-`)
			parts.push(priceRange.join(" to "))
		}

		if (searchParams.bedrooms) {
			parts.push(`${searchParams.bedrooms} bed`)
		}

		if (searchParams.bathrooms) {
			parts.push(`${searchParams.bathrooms}+ bath`)
		}

		if (searchParams.furnished) {
			parts.push("furnished")
		}

		if (searchParams.petFriendly) {
			parts.push("pet-friendly")
		}

		if (searchParams.amenities && searchParams.amenities.length > 0) {
			parts.push(`${searchParams.amenities.length} amenities`)
		}

		return parts.join(" • ")
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Save className="h-5 w-5" />
						Save Search
					</DialogTitle>
					<DialogDescription>
						Save this search to get notified when new matching properties are available.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Search Summary */}
					<div className="rounded-lg bg-muted p-3">
						<Label className="font-medium text-sm">Search Criteria</Label>
						<p className="mt-1 text-muted-foreground text-sm">{getSearchSummary()}</p>
					</div>

					{/* Name Input */}
					<div className="space-y-2">
						<Label htmlFor="name">Search Name *</Label>
						<Input
							id="name"
							placeholder="e.g., 2BR Apartments in Berlin"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={100}
						/>
						<p className="text-muted-foreground text-xs">{name.length}/100 characters</p>
					</div>

					{/* Description Input */}
					<div className="space-y-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							placeholder="Add notes about what you're looking for..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							maxLength={500}
						/>
						<p className="text-muted-foreground text-xs">{description.length}/500 characters</p>
					</div>

					{/* Notification Settings */}
					<div className="space-y-4 border-t pt-4">
						<Label className="font-medium text-sm">Notification Settings</Label>

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								{notificationsEnabled ? (
									<Bell className="h-4 w-4 text-blue-600" />
								) : (
									<BellOff className="h-4 w-4 text-muted-foreground" />
								)}
								<div>
									<Label htmlFor="notifications" className="font-normal">
										Enable Notifications
									</Label>
									<p className="text-muted-foreground text-xs">
										Get notified when new properties match your search
									</p>
								</div>
							</div>
							<Switch
								id="notifications"
								checked={notificationsEnabled}
								onCheckedChange={setNotificationsEnabled}
							/>
						</div>

						{notificationsEnabled && (
							<div className="flex items-center justify-between pl-6">
								<div>
									<Label htmlFor="email-notifications" className="font-normal">
										Email Notifications
									</Label>
									<p className="text-muted-foreground text-xs">
										Receive notifications via email
									</p>
								</div>
								<Switch
									id="email-notifications"
									checked={emailNotifications}
									onCheckedChange={setEmailNotifications}
								/>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!name.trim() || createSavedSearch.isPending}>
						{createSavedSearch.isPending ? "Saving..." : "Save Search"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
