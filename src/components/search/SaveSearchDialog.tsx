import { useConvexMutation } from "@convex-dev/react-query"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { api } from "convex/_generated/api"
import { Bell, BellOff, Save } from "lucide-react"
import { useEffect } from "react"
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
	type SaveSearchForm = {
		name: string
		description: string
		notificationsEnabled: boolean
		emailNotifications: boolean
	}

	const createSavedSearch = useMutation({
		mutationFn: useConvexMutation(api.savedSearches.createSavedSearch),
	})

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			notificationsEnabled: true,
			emailNotifications: true,
		} as SaveSearchForm,
		onSubmit: async ({ value }) => {
			const v = value as SaveSearchForm
			if (!v.name.trim()) {
				toast.error("Please enter a name for your search")
				return
			}

			if (!searchParams.city || !searchParams.country) {
				toast.error("City and country are required to save a search")
				return
			}

			try {
				await createSavedSearch.mutateAsync({
					name: v.name.trim(),
					description: v.description.trim() || undefined,

					// Search criteria - ensure required fields are present
					city: searchParams.city,
					country: searchParams.country,
					propertyType: searchParams.propertyType,
					minPrice: searchParams.minPrice,
					maxPrice: searchParams.maxPrice,
					bedrooms: searchParams.bedrooms,
					bathrooms: searchParams.bathrooms,
					amenities: searchParams.amenities,
					petFriendly: searchParams.petFriendly,
					furnished: searchParams.furnished,
				})

				toast.success("Search saved successfully!")
				onOpenChange(false)
			} catch (error) {
				toast.error("Failed to save search. Please try again.")
				console.error(error)
			}
		},
	})

	// Reset form values when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset()
		}
	}, [open, form])

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
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<div className="space-y-4 py-4">
						{/* Search Summary */}
						<div className="rounded-lg bg-muted p-3">
							<p className="font-medium text-sm">Search Criteria</p>
							<p className="mt-1 text-muted-foreground text-sm">{getSearchSummary()}</p>
						</div>

						{/* Name Input */}
						<form.Field
							name="name"
							validators={{
								onChange: ({ value }) =>
									!value.trim()
										? "A name is required"
										: value.length > 100
											? "Name must be at most 100 characters"
											: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Search Name *</Label>
									<Input
										id={field.name}
										placeholder="e.g., 2BR Apartment in Berlin"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										maxLength={100}
									/>
									<div className="flex items-center justify-between">
										<p className="text-muted-foreground text-xs">
											{field.state.value.length}/100 characters
										</p>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 text-xs">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								</div>
							)}
						</form.Field>

						{/* Description Input */}
						<form.Field
							name="description"
							validators={{
								onChange: ({ value }) =>
									value.length > 500
										? "Description must be at most 500 characters"
										: undefined,
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Description (optional)</Label>
									<Textarea
										id={field.name}
										placeholder="Add notes about what you're looking for..."
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={3}
										maxLength={500}
									/>
									<div className="flex items-center justify-between">
										<p className="text-muted-foreground text-xs">
											{field.state.value.length}/500 characters
										</p>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 text-xs">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								</div>
							)}
						</form.Field>

						{/* Notification Settings */}
						<div className="space-y-4 border-t pt-4">
							<Label className="font-medium text-sm">Notification Settings</Label>

							<form.Field name="notificationsEnabled">
								{(field) => (
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											{field.state.value ? (
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
											checked={field.state.value}
											onCheckedChange={(v) => field.handleChange(Boolean(v))}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="emailNotifications">
								{(field) =>
									field.form.getFieldValue("notificationsEnabled") ? (
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
												checked={field.state.value}
												onCheckedChange={(v) => field.handleChange(Boolean(v))}
											/>
										</div>
									) : null
								}
							</form.Field>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit || createSavedSearch.isPending}>
									{createSavedSearch.isPending || isSubmitting
										? "Saving..."
										: "Save Search"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
