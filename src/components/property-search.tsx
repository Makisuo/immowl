import { Link } from "@tanstack/react-router"
import { Filter } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"

export function PropertySearch() {
	return (
		<div className="rounded-full border bg-foreground/10 p-0.5">
			<div className="overflow-hidden rounded-full bg-card shadow-2xl">
				<div className="flex items-center gap-2">
					{/* Country Selection */}
					<div className="min-w-0 flex-1 gap-1">
						<Select>
							<SelectTrigger className="h-16 w-full rounded-md border-0 bg-transparent! px-6 shadow-none outline-none transition-all hover:bg-accent! focus:ring-0 focus:ring-offset-0">
								<div className="flex items-center gap-3">
									<div className="h-4 w-6 flex-shrink-0 rounded-sm bg-gradient-to-b from-black via-red-600 to-yellow-400"></div>
									<SelectValue
										placeholder="berlin"
										className="font-medium text-base"
									/>
								</div>
							</SelectTrigger>
							<SelectContent className="z-[100]">
								<SelectItem value="berlin">Berlin</SelectItem>
								<SelectItem value="hamburg">Hamburg</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* City/Property Type Selection */}
					<div className="min-w-0 flex-1">
						<Select>
							<SelectTrigger className="h-16 rounded-md border-0 bg-transparent! px-6 shadow-none outline-none transition-all hover:bg-accent! focus:ring-0 focus:ring-offset-0">
								<div className="flex items-center gap-3">
									<span className="text-slate-400">×</span>
									<SelectValue
										placeholder="Wohnung Mieten"
										className="font-medium text-base"
									/>
								</div>
							</SelectTrigger>
							<SelectContent className="z-[100]">
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
									className="h-16 rounded-none border-0 bg-transparent px-6 shadow-none outline-none transition-all hover:rounded-md hover:bg-accent focus:ring-0 focus:ring-offset-0"
								>
									<Filter className="h-4 w-4 text-slate-400" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="z-[100] w-80 p-6" align="end">
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
	)
}