import type { FormApi } from "@tanstack/react-form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { PropertyFormData } from "../PropertyFormWizard"

interface LocationStepProps {
	form: FormApi<PropertyFormData>
}

export function LocationStep({ form }: LocationStepProps) {
	return (
		<div className="space-y-4">
			<form.Field name="address.street">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="street">Street Address *</Label>
						<Input
							id="street"
							placeholder="e.g., 123 Main Street"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="address.city">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="city">City *</Label>
							<Input
								id="city"
								placeholder="e.g., Berlin"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				</form.Field>

				<form.Field name="address.state">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="state">State/Province *</Label>
							<Input
								id="state"
								placeholder="e.g., Berlin"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="address.zipCode">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="zipCode">ZIP/Postal Code *</Label>
							<Input
								id="zipCode"
								placeholder="e.g., 10115"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								maxLength={5}
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				</form.Field>

				<form.Field name="address.country">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="country">Country</Label>
							<Input
								id="country"
								placeholder="e.g., Germany"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				</form.Field>
			</div>

			<div className="rounded-lg bg-muted p-4">
				<p className="text-sm text-muted-foreground">
					Tip: Provide accurate address information to help potential tenants find your property
					easily. The exact location can be shown on a map.
				</p>
			</div>
		</div>
	)
}
