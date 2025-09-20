import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { LogoIcon } from "~/components/logo"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { authClient } from "~/lib/auth.client"

export const Route = createFileRoute("/_auth/reset-password")({
	component: RouteComponent,
})

function RouteComponent() {
	const router = useRouter()
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [passwords, setPasswords] = useState({
		password: "",
		confirmPassword: "",
	})

	const searchParams = new URLSearchParams(window.location.search)
	const token = searchParams.get("token")

	if (!token) {
		return (
			<section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
				<div className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-8 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
					<div>
						<Link to="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Invalid Reset Link</h1>
						<p className="text-destructive text-sm">
							The password reset link is invalid or has expired.
						</p>
						<Button asChild className="mt-6 w-full">
							<Link to="/forgot-password">Request New Link</Link>
						</Button>
					</div>
				</div>
			</section>
		)
	}

	const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		if (passwords.password !== passwords.confirmPassword) {
			setError("Passwords do not match")
			setLoading(false)
			return
		}

		if (passwords.password.length < 8) {
			setError("Password must be at least 8 characters long")
			setLoading(false)
			return
		}

		try {
			await authClient.resetPassword({
				newPassword: passwords.password,
				token,
			})
			router.navigate({ to: "/sign-in" })
		} catch (err: any) {
			setError(err?.message || "Failed to reset password. Please try again.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
			<form
				onSubmit={handleResetPassword}
				className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="p-8 pb-6">
					<div>
						<Link to="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Create New Password</h1>
						<p className="text-sm">Enter your new password below</p>
					</div>

					<hr className="my-6 border-dashed" />

					<div className="space-y-6">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="password" className="block text-sm">
								New Password
							</Label>
							<Input
								type="password"
								required
								name="password"
								id="password"
								disabled={loading}
								value={passwords.password}
								onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
								placeholder="Enter new password"
								minLength={8}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="block text-sm">
								Confirm Password
							</Label>
							<Input
								type="password"
								required
								name="confirmPassword"
								id="confirmPassword"
								disabled={loading}
								value={passwords.confirmPassword}
								onChange={(e) =>
									setPasswords({
										...passwords,
										confirmPassword: e.target.value,
									})
								}
								placeholder="Confirm new password"
								minLength={8}
							/>
						</div>

						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? "Resetting..." : "Reset Password"}
						</Button>
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
