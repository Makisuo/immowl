import resend from "@convex-dev/resend/convex.config"
import workpool from "@convex-dev/workpool/convex.config"
import { defineApp } from "convex/server"
import betterAuth from "./betterAuth/convex.config"

const app = defineApp()
app.use(betterAuth)
app.use(resend)
app.use(workpool, { name: "scrapeWorkpool" })

export default app
