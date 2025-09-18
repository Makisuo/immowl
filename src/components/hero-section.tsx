import { Link } from "@tanstack/react-router"
import { ArrowRight, Filter, Search } from "lucide-react"
import { AnimatedGroup } from "~/components/ui/animated-group"
import { Button } from "~/components/ui/button"
import { TextEffect } from "~/components/ui/text-effect"
import { HeroHeader } from "./header"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
} as const

export default function HeroSection() {
	return (
		<>
			<HeroHeader />
			<main className="overflow-hidden">
				<div
					aria-hidden
					className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
				>
					<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
					<div className="-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
					<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
				</div>
				<section>
					<div className="relative pt-24 md:pt-36">
						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											delayChildren: 1,
										},
									},
								},
								item: {
									hidden: {
										opacity: 0,
										y: 20,
									},
									visible: {
										opacity: 1,
										y: 0,
										transition: {
											type: "spring",
											bounce: 0.3,
											duration: 2,
										},
									},
								},
							}}
							className="mask-b-from-35% mask-b-to-90% -z-20 absolute inset-0 top-56 lg:top-32"
						>
							<img
								src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
								alt="background"
								className="hidden size-full dark:block"
								width="3276"
								height="4095"
							/>
						</AnimatedGroup>

						<div
							aria-hidden
							className="-z-10 absolute inset-0 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
						/>

						<div className="mx-auto max-w-7xl px-6">
							<div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
								<AnimatedGroup variants={transitionVariants}>
									<Link
										to="/"
										className="group mx-auto flex w-fit items-center gap-4 rounded-full border bg-muted p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 hover:bg-background dark:border-t-white/5 dark:shadow-zinc-950 dark:hover:border-t-border"
									>
										<span className="text-foreground text-sm">
											Introducing Support for AI Models
										</span>
										<span className="block h-4 w-0.5 border-l bg-white dark:border-background dark:bg-zinc-700"></span>

										<div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
											<div className="-translate-x-1/2 flex w-12 duration-500 ease-in-out group-hover:translate-x-0">
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
												<span className="flex size-6">
													<ArrowRight className="m-auto size-3" />
												</span>
											</div>
										</div>
									</Link>
								</AnimatedGroup>

								<TextEffect
									preset="fade-in-blur"
									speedSegment={0.3}
									as="h1"
									className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
								>
									Find your perfect next home
								</TextEffect>
								<TextEffect
									per="line"
									preset="fade-in-blur"
									speedSegment={0.3}
									delay={0.5}
									as="p"
									className="mx-auto mt-8 max-w-2xl text-balance text-lg"
								>
									Search through thousands of verified properties to find your next dream
									home with ease.
								</TextEffect>

								<div className="flex w-full justify-center">
									<AnimatedGroup
										variants={{
											container: {
												visible: {
													transition: {
														staggerChildren: 0.1,
														delayChildren: 0.5,
													},
												},
											},
											...transitionVariants,
										}}
									>
										<div className="rounded-[calc(var(--radius-xl)+0.125rem)] border bg-foreground/10 p-0.5">
											<div className="overflow-hidden rounded-xl bg-card shadow-2xl">
												<div className="flex items-center divide-x divide-border/50">
												{/* Country Selection */}
												<div className="min-w-0 flex-1">
													<Select>
														<SelectTrigger className="h-16 rounded-none border-0 bg-transparent px-6 shadow-none outline-none transition-all hover:bg-accent hover:rounded-md focus:ring-0 focus:ring-offset-0">
															<div className="flex items-center gap-3">
																<div className="h-4 w-6 flex-shrink-0 rounded-sm bg-gradient-to-b from-black via-red-600 to-yellow-400"></div>
																<SelectValue
																	placeholder="Berlin"
																	className="font-medium text-base"
																/>
															</div>
														</SelectTrigger>
														<SelectContent className="z-50">
															<SelectItem value="de">Germany</SelectItem>
															<SelectItem value="us">United States</SelectItem>
															<SelectItem value="uk">United Kingdom</SelectItem>
															<SelectItem value="fr">France</SelectItem>
															<SelectItem value="es">Spain</SelectItem>
														</SelectContent>
													</Select>
												</div>

												{/* City/Property Type Selection */}
												<div className="min-w-0 flex-1">
													<Select>
														<SelectTrigger className="h-16 rounded-none border-0 bg-transparent px-6 shadow-none outline-none transition-all hover:bg-accent hover:rounded-md focus:ring-0 focus:ring-offset-0">
															<div className="flex items-center gap-3">
																<span className="text-slate-400">×</span>
																<SelectValue
																	placeholder="Wohnung Mieten"
																	className="font-medium text-base"
																/>
															</div>
														</SelectTrigger>
														<SelectContent className="z-50">
															<SelectItem value="apartment-rent">
																Wohnung Mieten
															</SelectItem>
															<SelectItem value="apartment-buy">
																Wohnung Kaufen
															</SelectItem>
															<SelectItem value="house-rent">
																Haus Mieten
															</SelectItem>
															<SelectItem value="house-buy">
																Haus Kaufen
															</SelectItem>
														</SelectContent>
													</Select>
												</div>

												{/* Advanced Filters */}
												<div className="flex-shrink-0">
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="ghost"
																className="h-16 rounded-none border-0 bg-transparent px-6 shadow-none outline-none hover:bg-transparent focus:ring-0 focus:ring-offset-0"
															>
																<Filter className="h-4 w-4 text-slate-400" />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="z-50 w-80 p-6" align="end">
															<div className="space-y-6">
																<div>
																	<Label className="mb-3 block font-medium text-sm">
																		Bedrooms
																	</Label>
																	<Select>
																		<SelectTrigger>
																			<SelectValue placeholder="Any bedrooms" />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="studio">
																				Studio
																			</SelectItem>
																			<SelectItem value="1">
																				1 Bedroom
																			</SelectItem>
																			<SelectItem value="2">
																				2 Bedrooms
																			</SelectItem>
																			<SelectItem value="3">
																				3 Bedrooms
																			</SelectItem>
																			<SelectItem value="4">
																				4 Bedrooms
																			</SelectItem>
																			<SelectItem value="5+">
																				5+ Bedrooms
																			</SelectItem>
																		</SelectContent>
																	</Select>
																</div>

																<div>
																	<Label className="mb-3 block font-medium text-sm">
																		Price Range
																	</Label>
																	<div className="space-y-3">
																		<Slider
																			max={2000000}
																			min={50000}
																			step={10000}
																			className="w-full"
																		/>
																		<div className="flex justify-between text-slate-600 text-sm dark:text-slate-400">
																			<span>€ 400</span>
																			<span>€ 50000</span>
																		</div>
																	</div>
																</div>

																<div>
																	<Label className="mb-3 block font-medium text-sm">
																		Size (sq m)
																	</Label>
																	<div className="space-y-3">
																		<Slider
																			max={500}
																			min={20}
																			step={5}
																			className="w-full"
																		/>
																		<div className="flex justify-between text-slate-600 text-sm dark:text-slate-400">
																			<span>200 sq m</span>
																			<span>10000 sq m</span>
																		</div>
																	</div>
																</div>

																<div className="flex items-center justify-between">
																	<Label className="font-medium text-sm">
																		Pet-friendly
																	</Label>
																	<Switch />
																</div>

																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => {}}
																	className="w-full"
																>
																	Clear Filters
																</Button>
															</div>
														</PopoverContent>
													</Popover>
												</div>

												{/* Search Button */}
												<div className="flex-shrink-0 px-4">
													<div
														key={1}
														className="rounded-full border bg-foreground/10 p-0.5"
													>
														<Button
															asChild
															size="lg"
															className="rounded-full px-5 text-base"
														>
															<Link to="/">
																<span className="text-nowrap">Search</span>
															</Link>
														</Button>
													</div>
												</div>
											</div>
											</div>
										</div>
									</AnimatedGroup>
								</div>

								<AnimatedGroup
									variants={{
										container: {
											visible: {
												transition: {
													staggerChildren: 0.05,
													delayChildren: 0.75,
												},
											},
										},
										...transitionVariants,
									}}
									className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
								>
									<div
										key={1}
										className="rounded-[calc(var(--radius-xl)+0.125rem)] border bg-foreground/10 p-0.5"
									>
										<Button asChild size="lg" className="rounded-xl px-5 text-base">
											<Link to="/">
												<span className="text-nowrap">Start Building</span>
											</Link>
										</Button>
									</div>
									<Button
										key={2}
										asChild
										size="lg"
										variant="ghost"
										className="h-10.5 rounded-xl px-5"
									>
										<Link to="/">
											<span className="text-nowrap">Request a demo</span>
										</Link>
									</Button>
								</AnimatedGroup>
							</div>
						</div>

						<AnimatedGroup
							variants={{
								container: {
									visible: {
										transition: {
											staggerChildren: 0.05,
											delayChildren: 0.75,
										},
									},
								},
								...transitionVariants,
							}}
						>
							<div className="mask-b-from-55% -mr-56 relative mt-8 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
								<div className="relative inset-shadow-2xs mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background dark:inset-shadow-white/20">
									<img
										className="relative hidden aspect-15/8 rounded-2xl bg-background dark:block"
										src="/mail2.png"
										alt="app screen"
										width="2700"
										height="1440"
									/>
									<img
										className="relative z-2 aspect-15/8 rounded-2xl border border-border/25 dark:hidden"
										src="/mail2-light.png"
										alt="app screen"
										width="2700"
										height="1440"
									/>
								</div>
							</div>
						</AnimatedGroup>
					</div>
				</section>
				<section className="bg-background pt-16 pb-16 md:pb-32">
					<AnimatedGroup
						variants={{
							container: {
								visible: {
									transition: {
										staggerChildren: 0.1,
										delayChildren: 0.8,
									},
								},
							},
							...transitionVariants,
						}}
						className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
					>
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">50K+</div>
							<div className="text-slate-600 dark:text-slate-400">Properties</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">25K+</div>
							<div className="text-slate-600 dark:text-slate-400">Happy Clients</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">100+</div>
							<div className="text-slate-600 dark:text-slate-400">Cities</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-3xl text-slate-900 dark:text-white">15+</div>
							<div className="text-slate-600 dark:text-slate-400">Countries</div>
						</div>
					</AnimatedGroup>
				</section>
			</main>
		</>
	)
}
