import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { DialogOverlay } from "~/components/ui/dialog"

interface ImageGalleryProps {
	images: string[]
	title: string
	open: boolean
	onOpenChange: (open: boolean) => void
	initialIndex?: number
}

export function ImageGallery({
	images,
	title,
	open,
	onOpenChange,
	initialIndex = 0,
}: ImageGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)

	useEffect(() => {
		setCurrentIndex(initialIndex)
	}, [initialIndex])

	useEffect(() => {
		if (!open) return

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault()
				setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
			} else if (e.key === "ArrowRight") {
				e.preventDefault()
				setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [open, images.length])

	const navigateImage = (direction: "prev" | "next") => {
		if (direction === "next") {
			setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
		} else {
			setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
		}
	}

	const hasMultipleImages = images.length > 1

	if (images.length === 0) return null

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogOverlay className="bg-black/95" />
				<DialogPrimitive.Content
					className="fixed inset-0 z-50 flex items-center justify-center focus:outline-none"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
						onClick={() => onOpenChange(false)}
					>
						<X className="h-6 w-6" />
					</Button>

					<div className="relative flex h-full w-full items-center justify-center p-8">
						<img
							src={images[currentIndex]}
							alt={`${title} - View ${currentIndex + 1}`}
							className="max-h-full max-w-full object-contain"
						/>

						{hasMultipleImages && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 left-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
									onClick={(e) => {
										e.stopPropagation()
										navigateImage("prev")
									}}
								>
									<ChevronLeft className="h-6 w-6" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
									onClick={(e) => {
										e.stopPropagation()
										navigateImage("next")
									}}
								>
									<ChevronRight className="h-6 w-6" />
								</Button>
							</>
						)}

						<div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black/50 px-3 py-1">
							<span className="text-sm text-white">
								{currentIndex + 1} / {images.length}
							</span>
						</div>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}