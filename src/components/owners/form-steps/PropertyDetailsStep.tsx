import type { FormApi } from "@tanstack/react-form"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { PropertyFormData } from "../PropertyFormWizard"

interface PropertyDetailsStepProps {
	form: FormApi<PropertyFormData>
}

const AMENITIES_OPTIONS = [
	"Balcony",
	"Terrace",
	"Garden",
	"Parking",
	"Garage",
	"Elevator",
	"Basement",
	"Kitchen",
	"Dishwasher",
	"Washing Machine",
	"Air Conditioning",
	"Heating",
	"Internet",
	"Cable TV",
	"Security System",
	"Gym",
	"Pool",
	"Playground",
]

export function PropertyDetailsStep({ form }: PropertyDetailsStepProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4">
				<form.Field name="rooms.bedrooms">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="bedrooms">Bedrooms *</Label>
							<Input
								id="bedrooms"
								type="number"
								min="0"
								max="10"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
							/>
							{field.state.meta.errors ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							) : null}
						</div>
					)}
				</form.Field>

				<form.Field name="rooms.bathrooms">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="bathrooms">Bathrooms *</Label>
							<Input
								id="bathrooms"
								type="number"
								min="0"
								max="5"
								step="0.5"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
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

			<form.Field name="squareMeters">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="squareMeters">Size (m²) *</Label>
						<Input
							id="squareMeters"
							type="number"
							min="10"
							max="1000"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</div>
				)}
			</form.Field>

			<div className="space-y-4">
				<div className="flex items-center space-x-4">
					<form.Field name="furnished">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Checkbox
									id="furnished"
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked as boolean)}
								/>
								<Label htmlFor="furnished" className="font-normal">
									Furnished
								</Label>
							</div>
						)}
					</form.Field>

					<form.Field name="petFriendly">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Checkbox
									id="petFriendly"
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked as boolean)}
								/>
								<Label htmlFor="petFriendly" className="font-normal">
									Pet Friendly
								</Label>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			<form.Field name="amenities">
				{(field) => (
					<div className="space-y-2">
						<Label>Amenities</Label>
						<div className="border rounded-lg p-4">
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{AMENITIES_OPTIONS.map((amenity) => {
									const isChecked = field.state.value.includes(amenity)
									return (
										<div key={amenity} className="flex items-center space-x-2">
											<Checkbox
												id={amenity}
												checked={isChecked}
												onCheckedChange={(checked) => {
													if (checked) {
														field.handleChange([...field.state.value, amenity])
													} else {
														field.handleChange(
															field.state.value.filter((a) => a !== amenity),
														)
													}
												}}
											/>
											<Label htmlFor={amenity} className="font-normal text-sm">
												{amenity}
											</Label>
										</div>
									)
								})}
							</div>
						</div>
						{field.state.value.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{field.state.value.map((amenity) => (
									<Badge key={amenity} variant="secondary">
										{amenity}
									</Badge>
								))}
							</div>
						)}
					</div>
				)}
			</form.Field>
		</div>
	)
}
