import type { FormApi } from "@tanstack/react-form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { PropertyFormData } from "../PropertyFormWizard"

interface BasicInfoStepProps {
	form: FormApi<PropertyFormData>
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
	return (
		<div className="space-y-4">
			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="title">Property Title *</Label>
						<Input
							id="title"
							placeholder="e.g., Modern 2BR Apartment in City Center"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							placeholder="Describe your property, its features, location benefits, etc."
							rows={6}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p>
						) : null}
						<p className="text-muted-foreground text-sm">
							{field.state.value.length}/1000 characters
						</p>
					</div>
				)}
			</form.Field>

			<form.Field name="propertyType">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="propertyType">Property Type *</Label>
						<Select value={field.state.value} onValueChange={field.handleChange}>
							<SelectTrigger id="propertyType">
								<SelectValue placeholder="Select property type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="apartment">Apartment</SelectItem>
								<SelectItem value="house">House</SelectItem>
								<SelectItem value="condo">Condo</SelectItem>
								<SelectItem value="townhouse">Townhouse</SelectItem>
								<SelectItem value="studio">Studio</SelectItem>
							</SelectContent>
						</Select>
						{field.state.meta.errors ? (
							<p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>
		</div>
	)
}
