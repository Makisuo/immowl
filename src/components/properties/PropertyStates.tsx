"use client"

import { Link } from "@tanstack/react-router"
import { AlertCircle, Bookmark, Loader2, Search } from "lucide-react"
import { motion } from "motion/react"
import { memo } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

export const PropertyCardSkeleton = memo(function PropertyCardSkeleton() {
	return (
		<Card className="h-full overflow-hidden border-0 bg-white p-0 shadow-sm dark:bg-gray-800">
			<div className="relative">
				<Skeleton className="h-40 w-full rounded-none sm:h-48" />
				<div className="absolute bottom-2 left-2">
					<Skeleton className="h-4 w-8 rounded" />
				</div>
				<div className="absolute top-2 left-2">
					<Skeleton className="h-6 w-16 rounded-full" />
				</div>
				<div className="absolute top-2 right-2">
					<Skeleton className="h-9 w-9 rounded-full" />
				</div>
			</div>
			<CardContent className="space-y-3 p-4">
				<div className="space-y-1">
					<Skeleton className="h-5 w-3/4" />
					<div className="flex items-center gap-1">
						<Skeleton className="h-3 w-3 rounded-full" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-12" />
					</div>
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>
				<div className="flex items-center justify-between pt-1">
					<div>
						<Skeleton className="inline h-6 w-16" />
						<Skeleton className="ml-1 inline h-4 w-12" />
					</div>
				</div>
				<Skeleton className="h-3 w-24" />
			</CardContent>
		</Card>
	)
})

interface LoadingGridProps {
	count?: number
	columns?: string
}

export const LoadingGrid = memo(function LoadingGrid({
	count = 8,
	columns = "grid-cols-1 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4",
}: LoadingGridProps) {
	return (
		<div className={`grid gap-4 ${columns}`}>
			{[...Array(count)].map((_, index) => (
				<PropertyCardSkeleton key={`skeleton-${index}`} />
			))}
		</div>
	)
})

interface EmptyStateProps {
	title?: string
	description?: string
	icon?: React.ElementType
	actionLabel?: string
	actionHref?: string
}

export const EmptyState = memo(function EmptyState({
	title = "No properties found",
	description = "Try adjusting your search filters or browse available properties.",
	icon: Icon = Bookmark,
	actionLabel = "Browse Properties",
	actionHref = "/search",
}: EmptyStateProps) {
	return (
		<motion.div
			className="flex flex-col items-center justify-center py-16 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
				<Icon className="h-12 w-12 text-blue-500" />
			</div>
			<h3 className="mb-2 font-semibold text-foreground text-xl">{title}</h3>
			<p className="mb-6 max-w-md text-muted-foreground">{description}</p>
			{actionLabel && actionHref && (
				<Link to={actionHref}>
					<Button>
						<Search className="mr-2 h-4 w-4" />
						{actionLabel}
					</Button>
				</Link>
			)}
		</motion.div>
	)
})

interface ErrorStateProps {
	error?: Error | unknown
	title?: string
	description?: string
	onRetry?: () => void
	showDetails?: boolean
}

export const ErrorState = memo(function ErrorState({
	error,
	title = "Something went wrong",
	description = "We're having trouble loading the data. Please try refreshing the page or check your connection.",
	onRetry,
	showDetails = true,
}: ErrorStateProps) {
	const errorMessage = error instanceof Error ? error.message : String(error)

	return (
		<motion.div
			className="flex flex-col items-center justify-center py-16 text-center"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="mb-4 rounded-full bg-red-50 p-4 dark:bg-red-900/20">
				<AlertCircle className="h-12 w-12 text-red-500" />
			</div>
			<h3 className="mb-2 font-semibold text-foreground text-xl">{title}</h3>
			<p className="mb-6 max-w-md text-muted-foreground">{description}</p>
			{showDetails && error ? (
				<details className="mb-4 text-muted-foreground text-sm">
					<summary className="cursor-pointer">Technical details</summary>
					<pre className="mt-2 max-w-lg overflow-auto rounded bg-gray-100 p-2 text-left text-xs dark:bg-gray-800">
						{errorMessage}
					</pre>
				</details>
			) : null}
			<Button onClick={onRetry || (() => window.location.reload())}>
				{onRetry ? "Try Again" : "Refresh Page"}
			</Button>
		</motion.div>
	)
})

interface LoadingStateProps {
	message?: string
}

export const LoadingState = memo(function LoadingState({
	message = "Loading properties...",
}: LoadingStateProps) {
	return (
		<motion.div
			className="flex flex-col items-center justify-center py-16"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
			<p className="text-muted-foreground">{message}</p>
		</motion.div>
	)
})
