"use node"

import { v } from "convex/values"
import jwt from "jsonwebtoken"
import { action } from "./_generated/server"

export const generateToken = action({
	args: {
		origin: v.string(),
	},
	returns: v.object({
		token: v.optional(v.string()),
		error: v.optional(v.string()),
	}),
	handler: async (_ctx, args) => {
		const teamId = process.env.APPLE_TEAM_ID
		const keyId = process.env.APPLE_MAPKIT_KEY_ID
		let privateKey = process.env.APPLE_MAPKIT_PRIVATE_KEY

		if (!teamId || !keyId || !privateKey) {
			console.error("Missing Apple MapKit configuration:", {
				hasTeamId: !!teamId,
				hasKeyId: !!keyId,
				hasPrivateKey: !!privateKey,
			})
			return {
				error: "MapKit configuration missing. Please check environment variables.",
			}
		}

		try {
			privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`

			// Generate JWT token for MapKit JS
			const token = jwt.sign(
				{
					// Origin restriction for security
					origin: args.origin,
					// Issuer is your Team ID
					iss: teamId,
					// Issued at time (in seconds)
					iat: Math.floor(Date.now() / 1000),
					// Expiration time (30 minutes from now)
					exp: Math.floor(Date.now() / 1000) + 1800,
				},
				privateKey,
				{
					header: {
						kid: keyId, // Key ID from Apple Developer Portal
						typ: "JWT",
						alg: "ES256", // Required algorithm for Apple MapKit
					},
					algorithm: "ES256",
				},
			)

			return { token }
		} catch (error) {
			console.error("Error generating MapKit token:", error)
			// Provide more specific error message based on the error type
			let errorMessage = "Failed to generate token"
			if (error instanceof Error) {
				if (error.message.includes("secretOrPrivateKey must be an asymmetric key")) {
					errorMessage =
						"Invalid private key. Ensure you're using the .p8 file content from Apple Developer Portal."
				} else if (error.message.includes("secretOrPrivateKey must have a value")) {
					errorMessage = "Private key is empty or invalid."
				} else {
					errorMessage = `Token generation failed: ${error.message}`
				}
			}
			return { error: errorMessage }
		}
	},
})
