import { Link } from "@tanstack/react-router"
import { LogOut, Menu, User, X } from "lucide-react"
import React from "react"
import { Logo } from "~/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useAuth } from "~/hooks/use-auth"
import { cn } from "~/lib/utils"

const menuItems = [
	{ name: "Search", href: "/search" },
	{ name: "Solution", href: "#link" },
	{ name: "Pricing", href: "#link" },
	{ name: "About", href: "#link" },
]

export const AppHeader = () => {
	const [menuState, setMenuState] = React.useState(false)
	const [isScrolled, setIsScrolled] = React.useState(false)
	const { user, isAuthenticated, signOut } = useAuth()

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50)
		}
		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])
	return (
		<header>
			<nav data-state={menuState && "active"} className="fixed z-[200] w-full px-2">
				<div
					className={cn(
						"mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
						isScrolled &&
							"max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5",
					)}
				>
					<div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
						<div className="flex w-full justify-between lg:w-auto">
							<Link to="/" aria-label="home" className="flex items-center space-x-2">
								<Logo />
							</Link>

							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState === true ? "Close Menu" : "Open Menu"}
								type="button"
								className="-m-2.5 -mr-4 relative z-20 block cursor-pointer p-2.5 lg:hidden"
							>
								<Menu className="m-auto size-6 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 duration-200" />
								<X className="-rotate-180 absolute inset-0 m-auto size-6 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 scale-0 in-data-[state=active]:opacity-100 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											to={item.href}
											className="block text-muted-foreground duration-150 hover:text-accent-foreground"
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="mb-6 in-data-[state=active]:block hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:in-data-[state=active]:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Link
												to={item.href}
												className="block text-muted-foreground duration-150 hover:text-accent-foreground"
											>
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								{isAuthenticated && user ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="relative h-8 w-8 rounded-full"
											>
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={user.image || undefined}
														alt={user.name || "User"}
													/>
													<AvatarFallback>
														{user.name ? (
															user.name.charAt(0).toUpperCase()
														) : (
															<User className="h-4 w-4" />
														)}
													</AvatarFallback>
												</Avatar>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56">
											<DropdownMenuLabel>
												<div className="flex flex-col space-y-1">
													<p className="font-medium text-sm leading-none">
														{user.name || "User"}
													</p>
													<p className="text-muted-foreground text-xs leading-none">
														{user.email}
													</p>
												</div>
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link to="/profile" className="cursor-pointer">
													<User className="mr-2 h-4 w-4" />
													<span>Profile</span>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => signOut()}
												className="cursor-pointer"
											>
												<LogOut className="mr-2 h-4 w-4" />
												<span>Sign out</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<>
										<Button
											asChild
											variant="outline"
											size="sm"
											className={cn(isScrolled && "lg:hidden")}
										>
											<Link to="/sign-in">
												<span>Login</span>
											</Link>
										</Button>
										<Button asChild size="sm" className={cn(isScrolled && "lg:hidden")}>
											<Link to="/sign-up">
												<span>Sign Up</span>
											</Link>
										</Button>
										<Button
											asChild
											size="sm"
											className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
										>
											<Link to="/sign-up">
												<span>Get Started</span>
											</Link>
										</Button>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	)
}
