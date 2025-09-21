import { useCallback, useState } from "react"

export interface UseImageNavigationOptions {
	totalImages: number
	initialIndex?: number
	onChange?: (index: number) => void
}

export function useImageNavigation({ totalImages, initialIndex = 0, onChange }: UseImageNavigationOptions) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)

	const goToNext = useCallback(() => {
		setCurrentIndex((prev) => {
			const newIndex = prev === totalImages - 1 ? 0 : prev + 1
			onChange?.(newIndex)
			return newIndex
		})
	}, [totalImages, onChange])

	const goToPrevious = useCallback(() => {
		setCurrentIndex((prev) => {
			const newIndex = prev === 0 ? totalImages - 1 : prev - 1
			onChange?.(newIndex)
			return newIndex
		})
	}, [totalImages, onChange])

	const goToIndex = useCallback(
		(index: number) => {
			if (index >= 0 && index < totalImages) {
				setCurrentIndex(index)
				onChange?.(index)
			}
		},
		[totalImages, onChange],
	)

	const handleKeyNavigation = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault()
				goToPrevious()
			} else if (e.key === "ArrowRight") {
				e.preventDefault()
				goToNext()
			}
		},
		[goToNext, goToPrevious],
	)

	return {
		currentIndex,
		goToNext,
		goToPrevious,
		goToIndex,
		handleKeyNavigation,
		hasMultipleImages: totalImages > 1,
	}
}
