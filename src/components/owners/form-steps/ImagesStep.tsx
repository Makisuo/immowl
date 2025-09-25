import type { FormApi } from "@tanstack/react-form"
import { Image as ImageIcon, Upload, X } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { PropertyFormData } from "../PropertyFormWizard"

interface ImagesStepProps {
	form: FormApi<PropertyFormData>
}

export function ImagesStep({ form }: ImagesStepProps) {
	const [imageUrl, setImageUrl] = useState("")

	return (
		<div className="space-y-4">
			<form.Field name="imageUrls">
				{(field) => (
					<>
						<div className="space-y-2">
							<Label>Property Images</Label>
							<div className="flex gap-2">
								<Input
									placeholder="Enter image URL"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && imageUrl) {
											e.preventDefault()
											field.handleChange([...field.state.value, imageUrl])
											setImageUrl("")
										}
									}}
								/>
								<Button
									type="button"
									onClick={() => {
										if (imageUrl) {
											field.handleChange([...field.state.value, imageUrl])
											setImageUrl("")
										}
									}}
									disabled={!imageUrl}
								>
									<Upload className="w-4 h-4 mr-2" />
									Add Image
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">
								Add image URLs one by one. You can add up to 10 images.
							</p>
						</div>

						{field.state.value.length > 0 && (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
								{field.state.value.map((url, index) => (
									<Card key={index} className="relative group overflow-hidden">
										<div className="aspect-video bg-muted flex items-center justify-center">
											{url ? (
												<img
													src={url}
													alt={`Property image ${index + 1}`}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.currentTarget.src = ""
														e.currentTarget.style.display = "none"
													}}
												/>
											) : (
												<ImageIcon className="w-12 h-12 text-muted-foreground" />
											)}
										</div>
										<Button
											type="button"
											size="icon"
											variant="destructive"
											className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={() => {
												const newImages = field.state.value.filter(
													(_, i) => i !== index,
												)
												field.handleChange(newImages)
											}}
										>
											<X className="w-4 h-4" />
										</Button>
										<div className="p-2">
											<p className="text-xs text-muted-foreground truncate">
												Image {index + 1}
											</p>
										</div>
									</Card>
								))}
							</div>
						)}

						{field.state.value.length === 0 && (
							<div className="border-2 border-dashed rounded-lg p-12 text-center">
								<ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-sm text-muted-foreground">
									No images added yet. Add image URLs to showcase your property.
								</p>
							</div>
						)}

						{field.state.meta.errors ? (
							<p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
						) : null}
					</>
				)}
			</form.Field>
		</div>
	)
}
