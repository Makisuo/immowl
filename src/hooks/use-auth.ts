import { authClient } from "~/lib/auth.client"

export function useAuth() {
	const { data: session, isPending, error } = authClient.useSession()

	return {
		user: session?.user,
		isAuthenticated: !!session?.user,
		isLoading: isPending,
		error,
		signOut: async () => {
			await authClient.signOut({})
		},
	}
}
