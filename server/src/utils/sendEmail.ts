// server/src/utils/sendEmail.ts

import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Define a type for the email options to ensure type safety
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string; // replyTo is optional
}

/**
 * Utility function to send an email using Nodemailer.
 *
 * @param options The email options object.
 * @param options.to The recipient's email address.
 * @param options.subject The subject line of the email.
 * @param options.html The HTML body of the email.
 * @param options.replyTo The email address to which replies should be sent (optional).
 */
const sendEmail = async (options: EmailOptions) => {
  // Check if all necessary environment variables are set
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    throw new Error(
      "SMTP configuration is incomplete. Please check your .env file."
    );
  }

  // Create a transporter object using the default SMTP transport
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string, 10),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Define the email message
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Sender address
    to: options.to, // List of recipients
    subject: options.subject, // Subject line
    html: options.html, // HTML body content
    replyTo: options.replyTo, // Reply-to address
  };

  // Send the email
  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email.");
  }
};

export default sendEmail;
