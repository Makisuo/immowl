import { ExternalLink } from "lucide-react"
import { cn } from "~/lib/utils"
import { getFaviconUrl, getSourceDisplayName } from "~/utils/externalSources"

interface ExternalSourceIndicatorProps {
	source?: string
	url?: string
	size?: "sm" | "md" | "lg"
	showText?: boolean
	className?: string
	onClick?: (e: React.MouseEvent) => void
}

export function ExternalSourceIndicator({
	source,
	url,
	size = "md",
	showText = true,
	className,
	onClick,
}: ExternalSourceIndicatorProps) {
	if (!source && !url) return null

	const faviconUrl =
		getFaviconUrl(source) ||
		(url ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` : null)
	const displayName = getSourceDisplayName(source)

	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-5 w-5",
		lg: "h-6 w-6",
	}

	const containerClasses = {
		sm: "gap-1 text-xs",
		md: "gap-1.5 text-sm",
		lg: "gap-2 text-base",
	}

	return (
		<div
			className={cn("inline-flex items-center", containerClasses[size], className)}
			onClick={onClick}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								onClick(e as any)
							}
						}
					: undefined
			}
		>
			{faviconUrl ? (
				<img
					src={faviconUrl}
					alt={`${displayName} favicon`}
					className={cn(sizeClasses[size], "rounded")}
					loading="lazy"
				/>
			) : (
				<ExternalLink className={cn(sizeClasses[size], "text-muted-foreground")} />
			)}
			{showText && <span className="text-muted-foreground">{displayName}</span>}
		</div>
	)
}
