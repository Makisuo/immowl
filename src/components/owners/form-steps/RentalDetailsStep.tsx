import type { FormApi } from "@tanstack/react-form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { PropertyFormData } from "../PropertyFormWizard"

interface RentalDetailsStepProps {
	form: FormApi<PropertyFormData>
}

export function RentalDetailsStep({ form }: RentalDetailsStepProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Monthly Rent</h3>
				<div className="grid grid-cols-2 gap-4">
					<form.Field name="monthlyRent.cold">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="coldRent">Cold Rent (€)</Label>
								<Input
									id="coldRent"
									type="number"
									min="100"
									max="10000"
									placeholder="e.g., 800"
									value={field.state.value || ""}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value ? Number(e.target.value) : undefined,
										)
									}
								/>
								{field.state.meta.errors ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="monthlyRent.warm">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="warmRent">Warm Rent (€)</Label>
								<Input
									id="warmRent"
									type="number"
									min="100"
									max="10000"
									placeholder="e.g., 1000"
									value={field.state.value || ""}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value ? Number(e.target.value) : undefined,
										)
									}
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
			</div>

			<form.Field name="deposit">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="deposit">Security Deposit (€)</Label>
						<Input
							id="deposit"
							type="number"
							min="0"
							max="50000"
							placeholder="e.g., 2400 (typically 2-3 months rent)"
							value={field.state.value || ""}
							onBlur={field.handleBlur}
							onChange={(e) =>
								field.handleChange(e.target.value ? Number(e.target.value) : undefined)
							}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="minimumLease">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="minimumLease">Minimum Lease Duration (months)</Label>
						<Input
							id="minimumLease"
							type="number"
							min="1"
							max="60"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
						<p className="text-sm text-muted-foreground">Common durations: 6, 12, or 24 months</p>
					</div>
				)}
			</form.Field>

			<form.Field name="availableFrom">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="availableFrom">Available From</Label>
						<Input
							id="availableFrom"
							type="date"
							value={
								field.state.value
									? new Date(field.state.value).toISOString().split("T")[0]
									: ""
							}
							onBlur={field.handleBlur}
							onChange={(e) =>
								field.handleChange(
									e.target.value ? new Date(e.target.value).getTime() : undefined,
								)
							}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Contact Information</h3>
				<div className="grid grid-cols-2 gap-4">
					<form.Field name="contactEmail">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="contactEmail">Contact Email</Label>
								<Input
									id="contactEmail"
									type="email"
									placeholder="your@email.com"
									value={field.state.value || ""}
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

					<form.Field name="contactPhone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="contactPhone">Contact Phone</Label>
								<Input
									id="contactPhone"
									type="tel"
									placeholder="+49 123 456789"
									value={field.state.value || ""}
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
			</div>
		</div>
	)
}
