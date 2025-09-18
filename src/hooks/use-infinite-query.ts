"use client"

import type { PaginatedQueryArgs, PaginatedQueryReference, UsePaginatedQueryReturnType } from "convex/react"
import { usePaginatedQuery } from "convex/react"
import { getFunctionName } from "convex/server"
import * as React from "react"
import { proxy, useSnapshot } from "valtio"

type InfiniteQueryStore<Query extends PaginatedQueryReference> = Record<
	string,
	{
		queries: Record<string, UsePaginatedQueryReturnType<Query>>
		lastKey: string | null
	}
>

const store = proxy<InfiniteQueryStore<any>>({})

export function useInfiniteQuery<Query extends PaginatedQueryReference>(
	query: Query,
	args: PaginatedQueryArgs<Query>,
	{ skipQuery, ...options }: { initialNumItems: number; skipQuery?: boolean },
) {
	const queryName = getFunctionName(query)

	const queryKey = JSON.stringify({ queryName, args })

	const paginatedQuery = usePaginatedQuery(query, skipQuery ? "skip" : args, options)

	const state = React.useRef(store).current
	const snap = useSnapshot(state)

	if (paginatedQuery.status !== "LoadingFirstPage" && paginatedQuery.status !== "LoadingMore") {
		state[queryName] = {
			queries: state[queryName]
				? {
						...state[queryName].queries,
						[queryKey]: paginatedQuery,
					}
				: {
						[queryKey]: paginatedQuery,
					},
			lastKey: queryKey,
		}
	}

	// If currently loading more, return the actual paginated query with LoadingMore status
	// Otherwise return the cached version
	const queryResult = paginatedQuery.status === "LoadingMore"
		? paginatedQuery
		: (snap[queryName]?.queries[queryKey] ??
			(snap[queryName]?.lastKey
				? snap[queryName]?.queries[snap[queryName]?.lastKey as string]
				: {
						results: [],
						status: "LoadingFirstPage",
						isLoading: true,
						loadMore: (_numItems: number) => {},
					}))

	return {
		loadingFirstPage: paginatedQuery.status === "LoadingFirstPage",
		query: queryResult as UsePaginatedQueryReturnType<Query>,
	}
}
