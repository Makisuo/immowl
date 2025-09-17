import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { authClient } from "~/lib/auth.client"
import { LogoIcon } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export const Route = createFileRoute("/_auth/sign-in")({
	component: RouteComponent,
})

function RouteComponent() {
	const router = useRouter()
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		const formData = new FormData(e.currentTarget)

		try {
			await authClient.signIn.email({
				email: formData.get("email") as string,
				password: formData.get("pwd") as string,
			})

			router.navigate({ to: "/" })
		} catch (err: any) {
			setError(err?.message || "Invalid email or password")
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
			<form
				onSubmit={handleSignIn}
				className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="p-8 pb-6">
					<div>
						<Link to="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Sign In to Immowl</h1>
						<p className="text-sm">Welcome back! Sign in to continue</p>
					</div>

					<div className="mt-6 grid grid-cols-2 gap-3">
						<Button type="button" variant="outline">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="0.98em"
								height="1em"
								viewBox="0 0 256 262"
							>
								<path
									fill="#4285f4"
									d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
								></path>
								<path
									fill="#34a853"
									d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
								></path>
								<path
									fill="#fbbc05"
									d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
								></path>
								<path
									fill="#eb4335"
									d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
								></path>
							</svg>
							<span>Google</span>
						</Button>
						<Button type="button" variant="outline">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1em"
								height="1em"
								viewBox="0 0 256 256"
							>
								<path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
								<path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
								<path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
								<path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
							</svg>
							<span>Microsoft</span>
						</Button>
					</div>

					<hr className="my-4 border-dashed" />

					<div className="space-y-6">
						{error && (
							<div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="block text-sm">
								Email
							</Label>
							<Input type="email" required name="email" id="email" disabled={loading} />
						</div>

						<div className="space-y-0.5">
							<div className="flex items-center justify-between">
								<Label htmlFor="pwd" className="text-sm">
									Password
								</Label>
								<Button asChild variant="link" size="sm">
									<a
										href="#"
										onClick={(e) => e.preventDefault()}
										className="link intent-info variant-ghost text-sm"
									>
										Forgot your Password ?
									</a>
								</Button>
							</div>
							<Input
								type="password"
								required
								name="pwd"
								id="pwd"
								disabled={loading}
								className="input sz-md variant-mixed"
							/>
						</div>

						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</div>
				</div>

				<div className="rounded-(--radius) border bg-muted p-3">
					<p className="text-center text-accent-foreground text-sm">
						Don't have an account ?
						<Button asChild variant="link" className="px-2">
							<Link to="/sign-up">Create account</Link>
						</Button>
					</p>
				</div>
			</form>
		</section>
	)
}
