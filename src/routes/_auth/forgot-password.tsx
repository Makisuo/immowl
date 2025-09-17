import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { LogoIcon } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { authClient } from "~/lib/auth.client"

export const Route = createFileRoute("/_auth/forgot-password")({
	component: RouteComponent,
})

function RouteComponent() {
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)

	const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError("")
		setSuccess(false)

		const formData = new FormData(e.currentTarget)
		const email = formData.get("email") as string

		try {
			await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			})
			setSuccess(true)
		} catch (err: any) {
			setError(err?.message || "Failed to send reset email. Please try again.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
			<form
				onSubmit={handleForgotPassword}
				className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="p-8 pb-6">
					<div>
						<Link to="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Reset Your Password</h1>
						<p className="text-sm">Enter your email and we'll send you a reset link</p>
					</div>

					<hr className="my-6 border-dashed" />

					<div className="space-y-6">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
								{error}
							</div>
						)}

						{success && (
							<div className="rounded-md bg-primary/10 p-3 text-primary text-sm">
								Password reset link has been sent to your email. Please check your inbox.
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="block text-sm">
								Email Address
							</Label>
							<Input
								type="email"
								required
								name="email"
								id="email"
								disabled={loading || success}
								placeholder="Enter your email"
							/>
						</div>

						<Button className="w-full" type="submit" disabled={loading || success}>
							{loading ? "Sending..." : "Send Reset Link"}
						</Button>

						<div className="text-center">
							<Button asChild variant="link" size="sm">
								<Link to="/sign-in" className="text-sm">
									Back to Sign In
								</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="rounded-(--radius) border bg-muted p-3">
					<p className="text-center text-accent-foreground text-sm">
						Remember your password?
						<Button asChild variant="link" className="px-2">
							<Link to="/sign-in">Sign In</Link>
						</Button>
					</p>
				</div>
			</form>
		</section>
	)
}