import { cn } from "~/lib/utils"

export const Logo = ({ className }: { className?: string }) => {
	return (
		<svg
			viewBox="0 0 78 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("h-5 w-auto text-foreground", className)}
		>
			<title>feather</title>
			<g fill="#ff9ff5">
				<path
					d="m14.451,9.699c-.513,3.998-3.934,4.571-7.451,4.003"
					fill="none"
					stroke="#ff9ff5"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
				/>
				<path
					d="m3,17s1.469-12.904,14-14c-.627,1.093-.642,2.918-1.06,4.748-.587,2.252-2.615,2.532-5.1,2.532"
					fill="none"
					stroke="#ff9ff5"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
				/>
			</g>

			{/* Replaced path-based wordmark with Immowl text */}
			<text x="24" y="13" fontFamily="sans-serif" fontSize="14" fill="currentColor">
				Immowl
			</text>
		</svg>
	)
}

export const LogoIcon = ({ className }: { className?: string }) => {
	return (
		<svg
			className={cn("size-5", className)}
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
		>
			<title>feather</title>
			<g fill="#ff9ff5">
				<path
					d="m14.451,9.699c-.513,3.998-3.934,4.571-7.451,4.003"
					fill="none"
					stroke="#ff9ff5"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				></path>
				<path
					d="m3,17s1.469-12.904,14-14c-.627,1.093-.642,2.918-1.06,4.748-.587,2.252-2.615,2.532-5.1,2.532"
					fill="none"
					stroke="#ff9ff5"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				></path>
			</g>
		</svg>
	)
}
