type ExternalSource = "immowelt"

interface SourceInfo {
	name: string
	domain: string
	displayName: string
}

const EXTERNAL_SOURCES: Record<ExternalSource, SourceInfo> = {
	immowelt: {
		name: "immowelt",
		domain: "www.immowelt.de",
		displayName: "Immowelt",
	},
}

export function getSourceInfo(source?: string): SourceInfo | null {
	if (!source) return null
	return EXTERNAL_SOURCES[source as ExternalSource] || null
}

export function getFaviconUrl(source?: string, size = 32): string | null {
	const sourceInfo = getSourceInfo(source)
	if (!sourceInfo) return null

	// Using Google's favicon service
	return `https://www.google.com/s2/favicons?domain=${sourceInfo.domain}&sz=${size}`
}

export function getSourceDisplayName(source?: string): string {
	const sourceInfo = getSourceInfo(source)
	return sourceInfo?.displayName || source || "External"
}

export function getDomainFromUrl(url?: string): string | null {
	if (!url) return null
	try {
		const urlObj = new URL(url)
		return urlObj.hostname
	} catch {
		return null
	}
}

export function getFaviconFromUrl(url?: string, size = 32): string | null {
	const domain = getDomainFromUrl(url)
	if (!domain) return null
	return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}
