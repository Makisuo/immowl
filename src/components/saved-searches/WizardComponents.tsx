import { motion } from "motion/react"
import type { ReactNode } from "react"

import { Label } from "~/components/ui/label"
import { Slider } from "~/components/ui/slider"
import { cn } from "~/lib/utils"

interface SelectionCardProps {
	id: string
	title: string
	description?: string
	icon?: ReactNode
	selected: boolean
	onClick: () => void
	disabled?: boolean
	className?: string
}

export function SelectionCard({
	id,
	title,
	description,
	icon,
	selected,
	onClick,
	disabled = false,
	className,
}: SelectionCardProps) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 text-center transition-all duration-200",
				"hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
				selected
					? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
					: "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			whileHover={!disabled ? { scale: 1.02 } : {}}
			whileTap={!disabled ? { scale: 0.98 } : {}}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			{selected && (
				<motion.div
					className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-blue-500"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				>
					<svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				</motion.div>
			)}

			{icon && (
				<div className={cn("text-2xl", selected ? "text-blue-600" : "text-gray-400")}>{icon}</div>
			)}

			<div className="space-y-1">
				<div className="font-medium text-sm">{title}</div>
				{description && <div className="text-gray-500 text-xs">{description}</div>}
			</div>
		</motion.button>
	)
}

interface WeightSliderProps {
	label: string
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
	step?: number
	className?: string
	showValue?: boolean
}

export function WeightSlider({
	label,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	className,
	showValue = true,
}: WeightSliderProps) {
	return (
		<motion.div
			className={cn("space-y-3", className)}
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.2 }}
		>
			<div className="flex items-center justify-between">
				<Label className="font-medium text-gray-700 text-sm">{label}</Label>
				{showValue && <span className="font-mono text-gray-500 text-sm">{value}%</span>}
			</div>

			<div className="px-2">
				<Slider
					value={[value]}
					onValueChange={(values) => onChange(values[0])}
					min={min}
					max={max}
					step={step}
					className="w-full"
				/>
			</div>

			<div className="flex justify-between text-gray-400 text-xs">
				<span>Not Important</span>
				<span>Very Important</span>
			</div>
		</motion.div>
	)
}

interface ImportanceRadioProps {
	label: string
	value: number
	onChange: (value: number) => void
	className?: string
}

const IMPORTANCE_OPTIONS = [
	{ label: "Not Important", value: 0 },
	{ label: "Slightly Important", value: 25 },
	{ label: "Moderately Important", value: 50 },
	{ label: "Important", value: 75 },
	{ label: "Very Important", value: 100 },
]

export function ImportanceRadio({ label, value, onChange, className }: ImportanceRadioProps) {
	return (
		<motion.div
			className={cn("space-y-3", className)}
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.2 }}
		>
			<Label className="font-medium text-gray-700 text-sm">{label}</Label>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
				{IMPORTANCE_OPTIONS.map((option) => (
					<label
						key={option.value}
						className={cn(
							"flex cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2 text-center text-xs font-medium transition-all duration-200",
							"hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1",
							value === option.value
								? "border-blue-500 bg-blue-50 text-blue-700"
								: "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
						)}
					>
						<input
							type="radio"
							name={`importance-${label}`}
							value={option.value}
							checked={value === option.value}
							onChange={() => onChange(option.value)}
							className="sr-only"
						/>
						<span>{option.label}</span>
					</label>
				))}
			</div>
		</motion.div>
	)
}

interface StepContainerProps {
	title: string
	description: string
	children: ReactNode
	className?: string
}

export function StepContainer({ title, description, children, className }: StepContainerProps) {
	return (
		<div className={cn("space-y-6", className)}>
			<div className="space-y-2 text-center">
				<h2 className="font-semibold text-gray-900 text-xl">{title}</h2>
				<p className="mx-auto max-w-md text-gray-600 text-sm">{description}</p>
			</div>

			<div className="space-y-4">{children}</div>
		</div>
	)
}

interface FormFieldProps {
	label: string
	error?: string
	required?: boolean
	children: ReactNode
	className?: string
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label className="font-medium text-gray-700 text-sm">
				{label}
				{required && <span className="ml-1 text-red-500">*</span>}
			</Label>

			{children}

			{error && (
				<motion.p
					className="text-red-600 text-sm"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
				>
					{error}
				</motion.p>
			)}
		</div>
	)
}

interface SelectionGridProps {
	children: ReactNode
	columns?: number
	className?: string
}

export function SelectionGrid({ children, columns = 3, className }: SelectionGridProps) {
	return (
		<div
			className={cn(
				"grid gap-3",
				columns === 2 && "grid-cols-1 sm:grid-cols-2",
				columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
				columns === 4 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
				className,
			)}
		>
			{children}
		</div>
	)
}

interface CheckboxCardProps {
	id: string
	title: string
	description?: string
	checked: boolean
	onChange: (checked: boolean) => void
	disabled?: boolean
	className?: string
}

export function CheckboxCard({
	id,
	title,
	description,
	checked,
	onChange,
	disabled = false,
	className,
}: CheckboxCardProps) {
	return (
		<motion.label
			htmlFor={id}
			className={cn(
				"relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-200",
				"focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:shadow-sm",
				checked
					? "border-blue-500 bg-blue-50"
					: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			whileHover={!disabled ? { scale: 1.01 } : {}}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				disabled={disabled}
				className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>

			<div className="flex-1 space-y-1">
				<div className="font-medium text-gray-900 text-sm">{title}</div>
				{description && <div className="text-gray-500 text-xs">{description}</div>}
			</div>
		</motion.label>
	)
}
