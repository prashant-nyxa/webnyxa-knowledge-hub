import 'server-only'

type MailPayload = {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: MailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.warn(`Email delivery skipped for ${to}. Set RESEND_API_KEY and EMAIL_FROM to enable outgoing mail.`)
    console.info(`Email subject: ${subject}`)
    return { delivered: false }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}`)
  }

  return { delivered: true }
}

export async function sendDeveloperAccountEmail({
  to,
  name,
  resetUrl,
}: {
  to: string
  name: string
  resetUrl: string
}) {
  return sendEmail({
    to,
    subject: 'Your WebNyxa account has been created',
    html: `
      <p>Hi ${name},</p>
      <p>Your developer account for WebNyxa Knowledge Hub has been created.</p>
      <p>You can reset your password anytime using the link below:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `,
  })
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string
  name: string
  resetUrl: string
}) {
  return sendEmail({
    to,
    subject: 'Reset your WebNyxa password',
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your WebNyxa Knowledge Hub password.</p>
      <p>Use the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  })
}
