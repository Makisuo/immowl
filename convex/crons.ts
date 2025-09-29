import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Geocode properties with missing coordinates every 6 hours
// This runs at: 00:00, 06:00, 12:00, 18:00 UTC
crons.interval(
	"geocode-properties",
	{ hours: 6 },
	internal.geocoding.geocodePropertiesInBackground,
	{ batchSize: 100 }, // Process up to 100 properties per run
)

export default crons