import { ChevronDown, ChevronUp } from "lucide-react"
import { type ReactNode, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface PreferenceSectionProps {
	title: string
	description?: string
	icon?: ReactNode
	children: ReactNode
	defaultExpanded?: boolean
	collapsible?: boolean
}

export function PreferenceSection({
	title,
	description,
	icon,
	children,
	defaultExpanded = true,
	collapsible = false,
}: PreferenceSectionProps) {
	const [expanded, setExpanded] = useState(defaultExpanded)

	return (
		<Card>
			<CardHeader
				className={collapsible ? "cursor-pointer" : ""}
				onClick={() => collapsible && setExpanded(!expanded)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{icon && <div className="text-blue-600">{icon}</div>}
						<div>
							<CardTitle className="text-lg">{title}</CardTitle>
							{description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
						</div>
					</div>
					{collapsible && (
						<div className="text-muted-foreground">
							{expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
						</div>
					)}
				</div>
			</CardHeader>
			{expanded && <CardContent className="space-y-6">{children}</CardContent>}
		</Card>
	)
}