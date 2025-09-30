import { Label } from "~/components/ui/label"

export type ImportanceLevel = "not-important" | "somewhat" | "very" | "critical"

const IMPORTANCE_LEVELS: Array<{ value: ImportanceLevel; label: string; weight: number }> = [
	{ value: "not-important", label: "Not Important", weight: 0 },
	{ value: "somewhat", label: "Somewhat", weight: 33 },
	{ value: "very", label: "Very", weight: 66 },
	{ value: "critical", label: "Critical", weight: 100 },
]

export function getWeightFromLevel(level: ImportanceLevel): number {
	return IMPORTANCE_LEVELS.find((l) => l.value === level)?.weight ?? 50
}

export function getLevelFromWeight(weight: number): ImportanceLevel {
	if (weight === 0) return "not-important"
	if (weight <= 33) return "somewhat"
	if (weight <= 66) return "very"
	return "critical"
}

interface ImportanceRadioProps {
	value: ImportanceLevel
	onChange: (level: ImportanceLevel) => void
	name: string
	label?: string
}

export function ImportanceRadio({ value, onChange, name, label }: ImportanceRadioProps) {
	return (
		<div className="space-y-2">
			{label && <Label className="text-muted-foreground text-sm">{label}</Label>}
			<div className="flex flex-wrap gap-2">
				{IMPORTANCE_LEVELS.map((level) => (
					<label
						key={level.value}
						className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
							value === level.value
								? "border-blue-600 bg-blue-50 text-blue-600"
								: "border-border bg-background hover:border-blue-300"
						}`}
					>
						<input
							type="radio"
							name={name}
							value={level.value}
							checked={value === level.value}
							onChange={() => onChange(level.value)}
							className="sr-only"
						/>
						<span className="font-medium">{level.label}</span>
					</label>
				))}
			</div>
		</div>
	)
}