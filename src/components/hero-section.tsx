import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { PropertySearch } from "~/components/property-search"
import { AnimatedGroup } from "~/components/ui/animated-group"
import { TextEffect } from "~/components/ui/text-effect"

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
		<main className="relative overflow-hidden">
			<div aria-hidden className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
				<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
				<div className="-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
				<div className="-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
			</div>
			<section>
				<div>
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
								Search through thousands of verified properties to find your next dream home
								with ease.
							</TextEffect>

							<div className="mt-12 flex w-full justify-center">
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
									<PropertySearch />
								</AnimatedGroup>
							</div>
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
	)
}
