import { SavedSearchWizard } from "./SavedSearchWizard"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"

interface SearchProfileWizardModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onComplete: (data: any) => void | Promise<void>
	initialData?: any
}

export function SearchProfileWizardModal({
	open,
	onOpenChange,
	onComplete,
	initialData,
}: SearchProfileWizardModalProps) {
	const handleComplete = async (data: any) => {
		await onComplete(data)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{initialData ? "Edit Your Search Profile" : "Create Your Search Profile"}
					</DialogTitle>
					<DialogDescription>
						{initialData
							? "Update your preferences to find the perfect property"
							: "Tell us what you're looking for and we'll match properties for you"}
					</DialogDescription>
				</DialogHeader>
				<SavedSearchWizard onComplete={handleComplete} initialData={initialData} />
			</DialogContent>
		</Dialog>
	)
}