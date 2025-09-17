import { Resend } from "@convex-dev/resend"
import { render } from "@react-email/components"
import { components } from "./_generated/api"
import type { MutationCtx } from "./_generated/server"
import ResetPasswordEmail from "./emails/resetPassword"
import VerifyEmail from "./emails/verifyEmail"
import VerifyOTP from "./emails/verifyOtp"

const resend: Resend = new Resend(components.resend, {
	testMode: false,
})

const sendEmail = async (
	ctx: MutationCtx,
	{
		to,
		subject,
		html,
	}: {
		to: string
		subject: string
		html: string
	},
) => {
	await resend.sendEmail(ctx, {
		from: "Test <onboarding@boboddy.business>",
		to,
		subject,
		html,
	})
}

export const sendEmailVerification = async (
	ctx: MutationCtx,
	{
		to,
		url,
	}: {
		to: string
		url: string
	},
) => {
	await sendEmail(ctx, {
		to,
		subject: "Verify your email address",
		html: await render(<VerifyEmail url={url} />),
	})
}

export const sendOTPVerification = async (
	ctx: MutationCtx,
	{
		to,
		code,
	}: {
		to: string
		code: string
	},
) => {
	await sendEmail(ctx, {
		to,
		subject: "Verify your email address",
		html: await render(<VerifyOTP code={code} />),
	})
}

export const sendResetPassword = async (
	ctx: MutationCtx,
	{
		to,
		url,
	}: {
		to: string
		url: string
	},
) => {
	await sendEmail(ctx, {
		to,
		subject: "Reset your password",
		html: await render(<ResetPasswordEmail url={url} />),
	})
}
