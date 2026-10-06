import "server-only";
import nodemailer from "nodemailer";

export type Email = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  /** Optional fixed Message-ID, so a repeated send is recognised as the same message by mail clients that deduplicate. */
  messageId?: string;
};

export type MailerMode = "gmail" | "log";

function gmailConfig() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  return user && pass ? { user, pass } : null;
}

/** Domain for generated Message-IDs (the sender's domain when Gmail is configured). */
export function messageIdDomain(): string {
  return gmailConfig()?.user.split("@")[1] ?? "frostwellcakes.example";
}

export function mailerMode(): MailerMode {
  return gmailConfig() ? "gmail" : "log";
}

/** Where bakery notifications go: BAKERY_EMAIL, else GMAIL_USER. */
export function bakeryAddress(): string {
  return (
    process.env.BAKERY_EMAIL?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    "bakery@frostwellcakes.example"
  );
}

/**
 * Send emails through Gmail with nodemailer when GMAIL_USER and
 * GMAIL_APP_PASSWORD are set; otherwise log them to the server console.
 */
export async function sendEmails(emails: Email[]): Promise<MailerMode> {
  const gmail = gmailConfig();
  if (!gmail) {
    for (const email of emails) {
      console.info(
        [
          "[email] Not sent (GMAIL_USER / GMAIL_APP_PASSWORD not set). Logged instead:",
          "From: Frostwell Cakes <GMAIL_USER>",
          `To: ${email.to}`,
          email.replyTo ? `Reply-To: ${email.replyTo}` : null,
          email.messageId ? `Message-ID: ${email.messageId}` : null,
          `Subject: ${email.subject}`,
          "",
          email.text,
          "[/email]",
        ]
          .filter((line) => line !== null)
          .join("\n"),
      );
    }
    return "log";
  }

  const transporter = nodemailer.createTransport({ service: "gmail", auth: gmail });
  for (const email of emails) {
    const info = await transporter.sendMail({
      from: { name: "Frostwell Cakes", address: gmail.user },
      to: email.to,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
      messageId: email.messageId,
    });
    console.info(
      `[email] Sent "${email.subject}" messageId=${info.messageId} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)}`,
    );
  }
  return "gmail";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
